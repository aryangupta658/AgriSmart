function Navbar({ activePage, onNavigate }) {
  return (
    <header className="topbar">
      <div className="navbar">
        <button
          type="button"
          className="brand brand-button"
          onClick={() => onNavigate("home")}
        >
          <div className="brand-logo-box">
            <img src="/logo.png" alt="AgriSmart Logo" className="brand-logo" />
          </div>

          <div className="brand-text">
            <h1>
              Agri<span>Smart</span>
            </h1>

            <p>
              IoT Driven Smart Water Management & Crop Recommendation System
            </p>
          </div>
        </button>

        <nav className="nav-menu">
          <button
            type="button"
            className={activePage === "home" ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate("home")}
          >
            Home
          </button>

          <button
            type="button"
            className={activePage === "water" ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate("water")}
          >
            Water Prediction
          </button>

          <button
            type="button"
            className={activePage === "crop" ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate("crop")}
          >
            Crop Recommendation
          </button>

          <button
            type="button"
            className="nav-get-started"
            onClick={() => onNavigate("water")}
          >
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
