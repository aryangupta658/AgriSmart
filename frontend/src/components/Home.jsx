import React from "react";

import {
  ArrowRight,
  Wifi,
  Database,
  BarChart3,
  Sprout,
  Droplets,
  ChartNoAxesCombined,
  CircleCheck,
} from "lucide-react";

const Home = ({ setActivePage }) => {
  const changePage = (page) => {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="home-page">
      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="home-hero">
        <div className="home-hero-overlay">
          <div className="home-hero-content">
            <p className="home-eyebrow">
              SMART AGRICULTURE FOR A SUSTAINABLE FUTURE
            </p>

            <div className="home-small-line"></div>

            <h1 className="home-title">
              Agri<span>Smart</span>
            </h1>

            <h2 className="home-subtitle">
              IoT Driven Smart Water Management
              <br />
              &amp; Crop Recommendation System
            </h2>

            <p className="home-description">
              Make informed farming decisions using real-time environmental
              conditions and machine learning models to improve crop yield and
              optimize water usage.
            </p>

            <button
              type="button"
              className="home-get-started"
              onClick={() => changePage("water")}
            >
              Get Started
              <ArrowRight size={19} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURE CARDS
      ====================================================== */}

      <section className="home-feature-grid">
        {/* ===================================================
            WATER REQUIREMENT CARD
        =================================================== */}

        <article className="home-feature-card">
          <div className="home-feature-text">
            <div className="home-feature-heading-row">
              {/* NEW WATER + ANALYTICS ICON */}

              <div
                className="
                  home-feature-icon
                  water-feature-icon
                  smart-water-icon
                "
              >
                <div className="combined-feature-icon">
                  <ChartNoAxesCombined
                    className="water-chart-icon"
                    size={31}
                    strokeWidth={2.1}
                  />

                  <Droplets
                    className="water-drop-overlay"
                    size={20}
                    strokeWidth={2.3}
                  />
                </div>
              </div>

              <h2>
                Water Requirement
                <span>Prediction</span>
              </h2>
            </div>

            <p>
              Estimate the amount of water required for your crop based on crop
              type, growth stage, soil moisture, temperature, soil temperature
              and humidity.
            </p>

            <button
              type="button"
              className="feature-button"
              onClick={() => changePage("water")}
            >
              Start Prediction
              <ArrowRight size={17} strokeWidth={2} />
            </button>
          </div>

          <div className="home-feature-image-box">
            <img
              src="/water.png"
              alt="Smart irrigation"
              className="home-feature-image"
            />
          </div>
        </article>

        {/* ===================================================
            CROP RECOMMENDATION CARD
        =================================================== */}

        <article className="home-feature-card">
          <div className="home-feature-text">
            <div className="home-feature-heading-row">
              {/* NEW PLANT + CHECK ICON */}

              <div
                className="
                  home-feature-icon
                  crop-feature-icon
                  smart-crop-icon
                "
              >
                <div className="combined-feature-icon">
                  <Sprout
                    className="crop-sprout-icon"
                    size={34}
                    strokeWidth={2.2}
                  />

                  <CircleCheck
                    className="crop-check-overlay"
                    size={18}
                    strokeWidth={2.4}
                  />
                </div>
              </div>

              <h2>
                Crop
                <span>Recommendation</span>
              </h2>
            </div>

            <p>
              Get the most suitable crop for your field based on current soil
              moisture, air temperature and humidity conditions using machine
              learning.
            </p>

            <button
              type="button"
              className="feature-button"
              onClick={() => changePage("crop")}
            >
              Recommend Crop
              <ArrowRight size={17} strokeWidth={2} />
            </button>
          </div>

          <div className="home-feature-image-box">
            <img
              src="/crop.png"
              alt="Crop recommendation"
              className="home-feature-image"
            />
          </div>
        </article>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="how-it-works">
        <div className="how-heading">
          <h2>How It Works</h2>

          <p>From real-time sensor data to smart farming decisions</p>
        </div>

        <div className="how-steps">
          {/* SENSOR DATA */}

          <div className="how-step">
            <div className="how-icon sensor-icon">
              <Wifi size={27} strokeWidth={2} />
            </div>

            <div className="how-text">
              <strong>1. Sensor Data</strong>

              <p>Collect soil and environmental data using IoT sensors.</p>
            </div>
          </div>

          <ArrowRight className="how-arrow" size={23} />

          {/* ML MODEL */}

          <div className="how-step">
            <div className="how-icon model-icon">
              <Database size={26} strokeWidth={2} />
            </div>

            <div className="how-text">
              <strong>2. ML Model</strong>

              <p>Process the data using trained machine learning models.</p>
            </div>
          </div>

          <ArrowRight className="how-arrow" size={23} />

          {/* PREDICTION */}

          <div className="how-step">
            <div className="how-icon prediction-icon">
              <BarChart3 size={26} strokeWidth={2} />
            </div>

            <div className="how-text">
              <strong>3. Prediction</strong>

              <p>Estimate water requirement or recommend the best crop.</p>
            </div>
          </div>

          <ArrowRight className="how-arrow" size={23} />

          {/* SMART DECISION */}

          <div className="how-step">
            <div className="how-icon decision-icon">
              <Sprout size={27} strokeWidth={2} />
            </div>

            <div className="how-text">
              <strong>4. Smart Decision</strong>

              <p>
                Make informed decisions for better crop yield and water usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="home-footer">
        IoT Driven Smart Water Management &amp; Crop Recommendation System
      </footer>
    </main>
  );
};

export default Home;
