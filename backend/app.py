from flask import Flask, request, jsonify
from flask_cors import CORS
from crop_api import crop_bp

import pandas as pd
import joblib
import os
import math


# ==========================================================
# 1. INITIALIZE FLASK APPLICATION
# ==========================================================

app = Flask(__name__)


# ==========================================================
# 2. CORS CONFIGURATION
# ==========================================================
#
# Local frontend:
# http://localhost:5173
#
# Deployed frontend:
# FRONTEND_URL environment variable on Render
#
# Example:
# https://agrismart.vercel.app
# ==========================================================

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL"
)


allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


if FRONTEND_URL:
    allowed_origins.append(
        FRONTEND_URL.rstrip("/")
    )


CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins
        }
    }
)


# ==========================================================
# 3. REGISTER CROP RECOMMENDATION API
# ==========================================================

app.register_blueprint(
    crop_bp
)


# ==========================================================
# 4. LOAD WATER PREDICTION MODEL
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "water_prediction_model.pkl"
)


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Water prediction model not found: {MODEL_PATH}"
    )


water_model = joblib.load(
    MODEL_PATH
)


print(
    "Water prediction model loaded successfully!"
)


if hasattr(
    water_model,
    "feature_names_in_"
):
    print(
        "Water model features:",
        list(
            water_model.feature_names_in_
        )
    )


# ==========================================================
# 5. DEFINE CROPS AND THEIR GROWTH STAGES
# ==========================================================

CROP_STAGES = {

    "Mungbean": [
        "Germination",
        "Seedling",
        "Vegetative",
        "Flowering",
        "Pod formation",
        "Seed filling",
        "Maturity"
    ],

    "Arhar": [
        "Germination",
        "Seedling",
        "Vegetative",
        "Bud initiation",
        "Flowering",
        "Pod development",
        "Seed filling",
        "Maturity"
    ],

    "Urad": [
        "Germination",
        "Seedling",
        "Vegetative",
        "Flowering",
        "Pod formation",
        "Seed filling",
        "Maturity"
    ],

    "Green chilli": [
        "Germination",
        "Seedling",
        "Transplant establishment",
        "Vegetative",
        "Flowering",
        "Fruit formation",
        "Fruit development",
        "Fruit harvesting"
    ],

    "Mint": [
        "Cutting establishment",
        "Root development",
        "Early leaf growth",
        "Active vegetative growth",
        "Leaf harvesting stage",
        "Regrowth after harvest"
    ]
}


# ==========================================================
# 6. EXPERIMENTAL IRRIGATION SETTINGS
# ==========================================================

THRESHOLDS = {

    "Mungbean": 45,

    "Arhar": 40,

    "Urad": 45,

    "Green chilli": 60,

    "Mint": 55
}


MAX_WATER = {

    "Mungbean": 45,

    "Arhar": 45,

    "Urad": 45,

    "Green chilli": 60,

    "Mint": 50
}


# Assumed experimental flow rate in mL/s
FLOW_RATE = 20.0


# ==========================================================
# 7. PREPARE WATER MODEL INPUT
# ==========================================================

def prepare_water_input(
    crop,
    growth_stage,
    soil_moisture,
    temperature,
    soil_temperature,
    humidity
):

    # ------------------------------------------------------
    # Support either moisture feature name depending
    # on the dataset used during model training.
    # ------------------------------------------------------

    input_values = {

        "soil_moisture":
            soil_moisture,

        "soil_moisture_before":
            soil_moisture,

        "temperature":
            temperature,

        "soil_temperature":
            soil_temperature,

        "humidity":
            humidity,

        "crop":
            crop,

        "growth_stage":
            growth_stage
    }


    default_features = [

        "soil_moisture",

        "temperature",

        "soil_temperature",

        "humidity",

        "crop",

        "growth_stage"
    ]


    # ------------------------------------------------------
    # Read feature names stored in the trained pipeline.
    # ------------------------------------------------------

    if hasattr(
        water_model,
        "feature_names_in_"
    ):

        expected_features = list(
            water_model.feature_names_in_
        )

    else:

        expected_features = (
            default_features
        )


    # ------------------------------------------------------
    # Check whether trained model expects unsupported
    # features.
    # ------------------------------------------------------

    missing_features = [

        feature

        for feature in expected_features

        if feature not in input_values
    ]


    if missing_features:

        raise ValueError(
            "Unsupported model features: "
            f"{missing_features}"
        )


    # ------------------------------------------------------
    # Preserve exactly the same feature order
    # used while training.
    # ------------------------------------------------------

    input_df = pd.DataFrame([
        {

            feature:
                input_values[feature]

            for feature
            in expected_features

        }
    ])


    return input_df


# ==========================================================
# 8. HOME API
# ==========================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "message":
            "AgriSmart API",

        "status":
            "running",

        "services": [

            "Water Prediction",

            "Crop Recommendation"

        ],

        "endpoints": {

            "health":
                "/api/health",

            "water_prediction":
                "/api/predict",

            "water_crops":
                "/api/crops",

            "crop_recommendation":
                "/api/crop/recommend",

            "crop_health":
                "/api/crop/health"

        }

    })


# ==========================================================
# 9. HEALTH API
# ==========================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "status":
            "ok",

        "water_model_loaded":
            True,

        "crop_api_registered":
            True

    })


# ==========================================================
# 10. GET WATER-PREDICTION CROPS
# ==========================================================

@app.route(
    "/api/crops",
    methods=["GET"]
)
def get_crops():

    return jsonify(
        CROP_STAGES
    )


# ==========================================================
# 11. WATER QUANTITY PREDICTION API
# ==========================================================

@app.route(
    "/api/predict",
    methods=["POST"]
)
def predict_water():

    try:

        # --------------------------------------------------
        # RECEIVE REACT FORM DATA
        # --------------------------------------------------

        data = request.get_json(
            silent=True
        )


        if not isinstance(
            data,
            dict
        ):

            return jsonify({

                "error":
                    "A valid JSON object is required."

            }), 400


        # --------------------------------------------------
        # REQUIRED FIELDS
        # --------------------------------------------------

        required_fields = [

            "crop",

            "growth_stage",

            "soil_moisture_before",

            "temperature",

            "soil_temperature",

            "humidity"

        ]


        missing_fields = [

            field

            for field
            in required_fields

            if field not in data

        ]


        if missing_fields:

            return jsonify({

                "error":
                    "Missing required fields: "
                    + ", ".join(
                        missing_fields
                    )

            }), 400


        # --------------------------------------------------
        # READ VALUES
        # --------------------------------------------------

        crop = str(
            data["crop"]
        ).strip()


        growth_stage = str(
            data["growth_stage"]
        ).strip()


        soil_moisture = float(
            data[
                "soil_moisture_before"
            ]
        )


        temperature = float(
            data[
                "temperature"
            ]
        )


        soil_temperature = float(
            data[
                "soil_temperature"
            ]
        )


        humidity = float(
            data[
                "humidity"
            ]
        )


        # --------------------------------------------------
        # VALIDATE CROP
        # --------------------------------------------------

        if crop not in CROP_STAGES:

            raise ValueError(
                "Invalid crop selected."
            )


        # --------------------------------------------------
        # VALIDATE GROWTH STAGE
        # --------------------------------------------------

        if (
            growth_stage
            not in
            CROP_STAGES[crop]
        ):

            raise ValueError(
                "Invalid growth stage "
                "for the selected crop."
            )


        # --------------------------------------------------
        # VALIDATE SENSOR VALUES
        # --------------------------------------------------

        values = [

            soil_moisture,

            temperature,

            soil_temperature,

            humidity

        ]


        if not all(
            math.isfinite(value)
            for value in values
        ):

            raise ValueError(
                "Sensor values must "
                "be finite numbers."
            )


        if not (
            0
            <= soil_moisture
            <= 100
        ):

            raise ValueError(
                "Soil moisture must "
                "be between 0 and 100%."
            )


        if not (
            0
            <= humidity
            <= 100
        ):

            raise ValueError(
                "Humidity must be "
                "between 0 and 100%."
            )


        if not (
            0
            <= temperature
            <= 60
        ):

            raise ValueError(
                "Air temperature must "
                "be between 0 and 60°C."
            )


        if not (
            0
            <= soil_temperature
            <= 60
        ):

            raise ValueError(
                "Soil temperature must "
                "be between 0 and 60°C."
            )


        # --------------------------------------------------
        # PREPARE INPUT FOR ML MODEL
        # --------------------------------------------------

        input_df = prepare_water_input(

            crop=crop,

            growth_stage=growth_stage,

            soil_moisture=soil_moisture,

            temperature=temperature,

            soil_temperature=
                soil_temperature,

            humidity=humidity

        )


        # --------------------------------------------------
        # ML WATER PREDICTION
        # --------------------------------------------------

        raw_prediction = float(

            water_model.predict(
                input_df
            )[0]

        )


        if not math.isfinite(
            raw_prediction
        ):

            raise ValueError(
                "The water model returned "
                "an invalid prediction."
            )


        # --------------------------------------------------
        # EXPERIMENTAL SAFETY RULE
        # --------------------------------------------------

        threshold = (
            THRESHOLDS[crop]
        )


        maximum_water = (
            MAX_WATER[crop]
        )


        if (
            soil_moisture
            >= threshold
        ):

            predicted_water = 0.0


            message = (

                "No irrigation indicated "
                "under the experimental "
                "moisture rule."

            )


        else:

            predicted_water = max(

                0.0,

                min(
                    raw_prediction,
                    maximum_water
                )

            )


            message = (

                "Water quantity estimated "
                "by the machine-learning "
                "model."

            )


        # --------------------------------------------------
        # ESTIMATED PUMP RUNTIME
        # --------------------------------------------------

        if FLOW_RATE > 0:

            pump_runtime = (
                predicted_water
                /
                FLOW_RATE
            )

        else:

            pump_runtime = 0.0


        # --------------------------------------------------
        # RETURN RESULT TO REACT
        # --------------------------------------------------

        return jsonify({

            "crop":
                crop,

            "growth_stage":
                growth_stage,

            "predicted_water_ml":
                round(
                    predicted_water,
                    2
                ),

            "irrigation_required":
                predicted_water > 0,

            "soil_moisture":
                soil_moisture,

            "moisture_threshold":
                threshold,

            "pump_runtime_sec":
                round(
                    pump_runtime,
                    2
                ),

            "message":
                message

        }), 200


    # ======================================================
    # BAD USER INPUT
    # ======================================================

    except (
        KeyError,
        TypeError,
        ValueError
    ) as error:

        return jsonify({

            "error":
                str(error)

        }), 400


    # ======================================================
    # SERVER ERROR
    # ======================================================

    except Exception:

        app.logger.exception(
            "Water prediction failed."
        )


        return jsonify({

            "error":
                "Water prediction failed "
                "on the server."

        }), 500


# ==========================================================
# 12. START LOCAL FLASK SERVER
# ==========================================================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )


    app.run(

        host="0.0.0.0",

        port=port,

        debug=True

    )