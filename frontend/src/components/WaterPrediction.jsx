import { useEffect, useState } from "react";

import { Droplets, Info, Leaf } from "lucide-react";

import { getCrops, predictWater } from "../services/api";

const initialForm = {
  crop: "",
  growth_stage: "",
  soil_moisture_before: "",
  temperature: "",
  soil_temperature: "",
  humidity: "",
};

function WaterPrediction() {
  const [crops, setCrops] = useState({});

  const [form, setForm] = useState(initialForm);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD CROPS
  // ==========================================

  useEffect(() => {
    async function loadCrops() {
      try {
        const data = await getCrops();

        setCrops(data);

        const firstCrop = Object.keys(data)[0];

        if (firstCrop) {
          setForm((previous) => ({
            ...previous,
            crop: firstCrop,
            growth_stage: data[firstCrop]?.[0] || "",
          }));
        }
      } catch (err) {
        setError("Unable to connect to the backend.");
      }
    }

    loadCrops();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "crop") {
      setForm((previous) => ({
        ...previous,

        crop: value,

        growth_stage: crops[value]?.[0] || "",
      }));
    } else {
      setForm((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setResult(null);

    setError("");
  };

  // ==========================================
  // PREDICT WATER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    setResult(null);

    setError("");

    try {
      const payload = {
        crop: form.crop,

        growth_stage: form.growth_stage,

        soil_moisture_before: Number(form.soil_moisture_before),

        temperature: Number(form.temperature),

        soil_temperature: Number(form.soil_temperature),

        humidity: Number(form.humidity),
      };

      const response = await predictWater(payload);

      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to predict water requirement.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      {/* ======================================
          HERO
      ====================================== */}

      <section className="page-hero water-hero">
        <div className="hero-content">
          <p className="eyebrow">SMART IRRIGATION</p>

          <h1>
            Water Requirement
            <span> Prediction</span>
          </h1>

          <p className="hero-description">
            Estimate the amount of water required for your crop using
            environmental and soil conditions.
          </p>
        </div>
      </section>

      {/* ======================================
          FORM + RESULT
      ====================================== */}

      <section className="prediction-layout">
        {/* FORM */}

        <div className="main-card form-card">
          <div className="card-heading">
            <h2>Enter Details</h2>

            <p>Provide crop information and current sensor readings.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="water-form-grid">
              {/* Crop Type */}

              <div className="field">
                <label htmlFor="crop">Crop Type</label>

                <select
                  id="crop"
                  name="crop"
                  value={form.crop}
                  onChange={handleChange}
                  required
                >
                  {Object.keys(crops).map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {/* Growth Stage */}

              <div className="field">
                <label htmlFor="growth_stage">Growth Stage</label>

                <select
                  id="growth_stage"
                  name="growth_stage"
                  value={form.growth_stage}
                  onChange={handleChange}
                  required
                >
                  {(crops[form.crop] || []).map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil Moisture */}

              <div className="field">
                <label htmlFor="soil_moisture_before">Soil Moisture (%)</label>

                <input
                  id="soil_moisture_before"
                  name="soil_moisture_before"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 25"
                  value={form.soil_moisture_before}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Air Temperature */}

              <div className="field">
                <label htmlFor="temperature">Air Temperature (°C)</label>

                <input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 30"
                  value={form.temperature}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Soil Temperature */}

              <div className="field">
                <label htmlFor="soil_temperature">Soil Temperature (°C)</label>

                <input
                  id="soil_temperature"
                  name="soil_temperature"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 29"
                  value={form.soil_temperature}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* HUMIDITY */}

              <div className="field">
                <label htmlFor="humidity">Humidity (%)</label>

                <input
                  id="humidity"
                  name="humidity"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 70"
                  value={form.humidity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Predicting..." : "Predict Water Requirement"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* RESULT */}

        <div className="main-card result-card">
          <div className="card-heading">
            <h2>Prediction Result</h2>

            <p>Estimated irrigation requirement for the given conditions.</p>
          </div>

          {!result ? (
            <div className="result-empty">
              <div
                className="
                  result-icon
                  water-result-icon
                "
              >
                <Droplets size={38} strokeWidth={1.8} />
              </div>

              <h3>Awaiting Input</h3>

              <p>
                Enter your crop and sensor readings to predict the water
                requirement.
              </p>
            </div>
          ) : (
            <div className="result-content">
              <div
                className="
                  result-icon
                  water-result-icon
                "
              >
                <Droplets size={38} strokeWidth={1.8} />
              </div>

              <div className="main-result">
                {result.predicted_water_ml}

                <span>mL</span>
              </div>

              <p className="result-title">Predicted Water Requirement</p>

              <div className="result-divider" />

              <div className="result-note">
                <Info size={18} strokeWidth={1.8} />

                <p>
                  {result.irrigation_required
                    ? "This is the recommended irrigation amount for the current crop and environmental conditions."
                    : "No irrigation is required under the current conditions."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================
          INFORMATION
      ====================================== */}

      <section className="info-strip">
        <div className="info-strip-title">
          <Leaf size={21} strokeWidth={1.8} />

          <h3>Tips for Better Irrigation</h3>
        </div>

        <div className="info-items">
          <div className="info-item">
            <strong>Use Recent Readings</strong>

            <p>Current sensor values provide more meaningful predictions.</p>
          </div>

          <div className="info-item">
            <strong>Monitor Soil Moisture</strong>

            <p>
              Soil moisture is an important factor in irrigation requirement.
            </p>
          </div>

          <div className="info-item">
            <strong>Observe Environment</strong>

            <p>Temperature and humidity can change throughout the day.</p>
          </div>
        </div>
      </section>

      <footer>
        IoT Driven Smart Water Management and Crop Recommendation System
      </footer>
    </main>
  );
}

export default WaterPrediction;
