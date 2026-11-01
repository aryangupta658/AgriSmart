import { useState } from "react";

import { Leaf, Sprout } from "lucide-react";

import { recommendCrop } from "../services/api";

const initialForm = {
  soil_moisture: "",

  temperature: "",

  humidity: "",
};

function CropRecommendation() {
  const [form, setForm] = useState(initialForm);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setResult(null);

    setError("");
  };

  // ==========================================
  // RECOMMEND CROP
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    setResult(null);

    setError("");

    try {
      const payload = {
        soil_moisture: Number(form.soil_moisture),

        temperature: Number(form.temperature),

        humidity: Number(form.humidity),
      };

      const response = await recommendCrop(payload);

      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to get crop recommendation.",
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

      <section className="page-hero crop-hero">
        <div className="hero-content">
          <p className="eyebrow">SMART FARMING</p>

          <h1>
            Crop
            <span> Recommendation</span>
          </h1>

          <p className="hero-description">
            Get the most suitable crop for your field based on environmental
            conditions.
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
            <h2>Enter Environmental Conditions</h2>

            <p>Provide the current environmental and soil readings.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="crop-form-grid">
              {/* Soil Moisture */}

              <div className="field">
                <label htmlFor="crop-moisture">Soil Moisture (%)</label>

                <input
                  id="crop-moisture"
                  name="soil_moisture"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 40"
                  value={form.soil_moisture}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Air Temperature */}

              <div className="field">
                <label htmlFor="crop-temperature">Air Temperature (°C)</label>

                <input
                  id="crop-temperature"
                  name="temperature"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 26"
                  value={form.temperature}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* HUMIDITY */}

              <div className="field">
                <label htmlFor="crop-humidity">Humidity (%)</label>

                <input
                  id="crop-humidity"
                  name="humidity"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 55"
                  value={form.humidity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Finding Suitable Crop..." : "Recommend Crop"}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* RESULT */}

        <div className="main-card result-card">
          <div className="card-heading">
            <h2>Recommendation Result</h2>

            <p>
              Most suitable crop based on the given environmental conditions.
            </p>
          </div>

          {!result ? (
            <div className="result-empty">
              <div
                className="
                  result-icon
                  crop-result-icon
                "
              >
                <Sprout size={38} strokeWidth={1.8} />
              </div>

              <h3>Awaiting Input</h3>

              <p>
                Enter the environmental readings to receive a crop
                recommendation.
              </p>
            </div>
          ) : (
            <div className="result-content">
              <div
                className="
                  result-icon
                  crop-result-icon
                "
              >
                <Sprout size={42} strokeWidth={1.8} />
              </div>

              <p className="recommended-label">Recommended Crop</p>

              <div className="crop-main-result">{result.recommended_crop}</div>

              <div className="result-divider" />

              <div className="crop-result-description">
                <p>
                  <strong>{result.recommended_crop}</strong> is recommended by
                  the trained model for the entered soil moisture, temperature
                  and humidity conditions.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================
          PARAMETERS
      ====================================== */}

      <section className="info-strip">
        <div className="info-strip-title">
          <Leaf size={21} strokeWidth={1.8} />

          <h3>Prediction Parameters</h3>
        </div>

        <div className="info-items">
          <div className="info-item">
            <strong>Soil Moisture</strong>

            <p>Represents the current water condition of the soil.</p>
          </div>

          <div className="info-item">
            <strong>Air Temperature</strong>

            <p>Represents the current environmental temperature.</p>
          </div>

          <div className="info-item">
            <strong>Humidity</strong>

            <p>Represents the amount of moisture present in the air.</p>
          </div>
        </div>
      </section>

      <footer>
        IoT Driven Smart Water Management and Crop Recommendation System
      </footer>
    </main>
  );
}

export default CropRecommendation;
