
from flask import Blueprint, request, jsonify, current_app

import os
import math
import joblib
import numpy as np
import pandas as pd


# ==================================================
# 1. CREATE CROP RECOMMENDATION BLUEPRINT
# ==================================================

crop_bp = Blueprint("crop_api", __name__)


# ==================================================
# 2. LOAD TRAINED MODEL AND LABEL ENCODER
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "xgboost_crop_model.pkl"
)

ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "crop_label_encoder.pkl"
)

crop_model = joblib.load(MODEL_PATH)

crop_encoder = joblib.load(ENCODER_PATH)

print("Crop recommendation model loaded successfully!")


# ==================================================
# 3. DEFINE INPUT FEATURES
# ==================================================

CROP_FEATURES = [
    "Soil_Moisture",
    "Temperature",
    "Humidity"
]


# ==================================================
# 4. DECODE PREDICTED CROP LABELS
# ==================================================

def decode_crop_labels(class_ids):

    values = np.asarray(class_ids)

    # If the model already predicts crop names
    if all(isinstance(value, str) for value in values):
        return values.astype(str)

    # Otherwise, convert encoded labels to names
    return crop_encoder.inverse_transform(
        values.astype(int)
    )


# ==================================================
# 5. PREPARE INPUT DATAFRAME
# ==================================================

def prepare_crop_input(
    soil_moisture,
    temperature,
    humidity
):

    input_values = {
        "Soil_Moisture": soil_moisture,
        "Temperature": temperature,
        "Humidity": humidity
    }

    # Preserve feature names and order from training
    if hasattr(crop_model, "feature_names_in_"):
        expected_features = list(
            crop_model.feature_names_in_
        )
    else:
        expected_features = CROP_FEATURES

    unsupported = [
        feature
        for feature in expected_features
        if feature not in input_values
    ]

    if unsupported:
        raise ValueError(
            f"Unsupported model features: {unsupported}"
        )

    return pd.DataFrame([{
        feature: input_values[feature]
        for feature in expected_features
    }])


# ==================================================
# 6. HEALTH CHECK ENDPOINT
# ==================================================

@crop_bp.route(
    "/api/crop/health",
    methods=["GET"]
)
def crop_health():

    return jsonify({
        "status": "ok",
        "model": "XGBoost Crop Recommendation",
        "model_loaded": True,
        "features": CROP_FEATURES
    }), 200


# ==================================================
# 7. CROP RECOMMENDATION ENDPOINT
# ==================================================

@crop_bp.route(
    "/api/crop/recommend",
    methods=["POST"]
)
def recommend_crop():

    try:

        # Receive JSON from React
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "error": "A valid JSON object is required."
            }), 400

        # Read inputs
        soil_moisture = float(
            data["soil_moisture"]
        )

        temperature = float(
            data["temperature"]
        )

        humidity = float(
            data["humidity"]
        )

        # Validate sensor values
        values = [
            soil_moisture,
            temperature,
            humidity
        ]

        if not all(math.isfinite(v) for v in values):
            raise ValueError(
                "All readings must be valid numbers."
            )

        if not 0 <= soil_moisture <= 100:
            raise ValueError(
                "Soil moisture must be between 0 and 100%."
            )

        if not 0 <= temperature <= 60:
            raise ValueError(
                "Temperature must be between 0 and 60°C."
            )

        if not 0 <= humidity <= 100:
            raise ValueError(
                "Humidity must be between 0 and 100%."
            )

        # Prepare model input
        input_df = prepare_crop_input(
            soil_moisture,
            temperature,
            humidity
        )

        # Predict primary crop
        prediction = crop_model.predict(input_df)

        recommended_crop = decode_crop_labels(
            prediction
        )[0]

        # Get top three predictions
        top_three = []

        if hasattr(crop_model, "predict_proba"):

            probabilities = crop_model.predict_proba(
                input_df
            )[0]

            class_ids = crop_model.classes_

            top_indices = np.argsort(
                probabilities
            )[::-1][:3]

            top_class_ids = class_ids[top_indices]

            top_crop_names = decode_crop_labels(
                top_class_ids
            )

            for index, crop_name in zip(
                top_indices,
                top_crop_names
            ):

                top_three.append({
                    "crop": str(crop_name),
                    "probability": round(
                        float(probabilities[index]) * 100,
                        2
                    )
                })

        # Return results to React
        return jsonify({
            "recommended_crop": str(recommended_crop),
            "top_three": top_three,
            "inputs": {
                "soil_moisture": soil_moisture,
                "temperature": temperature,
                "humidity": humidity
            }
        }), 200

    except (KeyError, ValueError, TypeError) as error:

        return jsonify({
            "error": str(error)
        }), 400

    except Exception:

        current_app.logger.exception(
            "Crop recommendation failed."
        )

        return jsonify({
            "error": "Crop recommendation failed on the server."
        }), 500
