import { useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import WaterPrediction from "./components/WaterPrediction";
import CropRecommendation from "./components/CropRecommendation";

import "./index.css";

function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    if (activePage === "water") {
      return <WaterPrediction />;
    }

    if (activePage === "crop") {
      return <CropRecommendation />;
    }

    return <Home onNavigate={setActivePage} />;
  };

  return (
    <div className="app">
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {renderPage()}
    </div>
  );
}

export default App;
