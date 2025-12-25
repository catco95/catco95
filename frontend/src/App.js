import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ValuationTool from "./pages/ValuationTool";
import AccessGate from "./components/AccessGate";
import "@/App.css";

function App() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has access
    const access = localStorage.getItem('crowntime_access');
    if (access === 'granted') {
      setHasAccess(true);
    }
    setLoading(false);
  }, []);

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

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