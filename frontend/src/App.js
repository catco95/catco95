import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ValuationTool from "./pages/ValuationTool";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/valuate" element={<ValuationTool />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;