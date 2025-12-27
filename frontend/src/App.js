import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Components
import Header from "@/components/Header";
import WatchForm from "@/components/WatchForm";
import ValuationDisplay from "@/components/ValuationDisplay";
import CameraScanner from "@/components/CameraScanner";
import CalibrationSelector from "@/components/CalibrationSelector";
import ScanHistory from "@/components/ScanHistory";
import CurrencySelector from "@/components/CurrencySelector";
import WatchComparison from "@/components/WatchComparison";
import MarketInsights from "@/components/MarketInsights";
import PortfolioTracker from "@/components/PortfolioTracker";
import { generateValuationPDF } from "@/utils/pdfExport";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  // State management
  const [watchData, setWatchData] = useState({
    brand: "",
    model_family: "",
    dial_color: "",
    bezel_type: "",
    bracelet_type: "",
    reference_number: "",
    condition: "Very Good",
    box_papers: false
  });
  
  const [fieldStatus, setFieldStatus] = useState({
    brand: "manual",
    model_family: "manual",
    dial_color: "manual",
    bezel_type: "manual",
    bracelet_type: "manual"
  });
  
  const [confirmedFields, setConfirmedFields] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [calibrationMode, setCalibrationMode] = useState("market_neutral");
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState({});
  const [exchangeRateInfo, setExchangeRateInfo] = useState(null);
  const [referenceData, setReferenceData] = useState({
    brands: [],
    models: [],
    attributes: {},
    conditions: []
  });

  // PDF Export handler
  const handleExportPDF = () => {
    if (!valuation || !watchData.brand) {
      toast.error("Please calculate a valuation first");
      return;
    }
    try {
      const filename = generateValuationPDF(watchData, valuation, selectedCurrency, currencies);
      toast.success(`PDF exported: ${filename}`);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Fetch reference data and scan history
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [brandsRes, conditionsRes, historyRes, currenciesRes] = await Promise.all([
          axios.get(`${API}/watch-data/brands`),
          axios.get(`${API}/watch-data/conditions`),
          axios.get(`${API}/scan-history?limit=10`),
          axios.get(`${API}/currencies/live`)
        ]);
        setReferenceData(prev => ({
          ...prev,
          brands: brandsRes.data.brands,
          conditions: conditionsRes.data.conditions
        }));
        setScanHistory(historyRes.data || []);
        setCurrencies(currenciesRes.data.currencies || {});
        setExchangeRateInfo({
          cached: currenciesRes.data.cached,
          lastUpdated: currenciesRes.data.last_updated
        });
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
      }
    };
    fetchReferenceData();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (watchData.brand) {
        try {
          const res = await axios.get(`${API}/watch-data/models/${watchData.brand}`);
          setReferenceData(prev => ({ ...prev, models: res.data.models }));
        } catch (error) {
          console.error("Failed to fetch models:", error);
        }
      } else {
        setReferenceData(prev => ({ ...prev, models: [], attributes: {} }));
      }
    };
    fetchModels();
  }, [watchData.brand]);

  // Fetch attributes when model changes
  useEffect(() => {
    const fetchAttributes = async () => {
      if (watchData.brand && watchData.model_family) {
        try {
          const res = await axios.get(`${API}/watch-data/attributes/${watchData.brand}/${watchData.model_family}`);
          setReferenceData(prev => ({ ...prev, attributes: res.data }));
        } catch (error) {
          console.error("Failed to fetch attributes:", error);
        }
      } else {
        setReferenceData(prev => ({ ...prev, attributes: {} }));
      }
    };
    fetchAttributes();
  }, [watchData.brand, watchData.model_family]);

  // Handle field change
  const handleFieldChange = useCallback((field, value) => {
    setWatchData(prev => ({ ...prev, [field]: value }));
    
    // If field was detected but user manually changes it, update status
    if (fieldStatus[field] === "detected" || fieldStatus[field] === "suggested") {
      setFieldStatus(prev => ({ ...prev, [field]: "manual" }));
      setConfirmedFields(prev => prev.filter(f => f !== field));
    }
  }, [fieldStatus]);

  // Handle field confirmation
  const handleConfirmField = useCallback((field) => {
    if (!confirmedFields.includes(field)) {
      setConfirmedFields(prev => [...prev, field]);
      setFieldStatus(prev => ({ ...prev, [field]: "confirmed" }));
      toast.success(`${field.replace('_', ' ')} confirmed`);
    }
  }, [confirmedFields]);

  // Handle field rejection
  const handleRejectField = useCallback((field) => {
    setWatchData(prev => ({ ...prev, [field]: "" }));
    setFieldStatus(prev => ({ ...prev, [field]: "manual" }));
    setConfirmedFields(prev => prev.filter(f => f !== field));
    toast.info(`${field.replace('_', ' ')} cleared`);
  }, []);

  // Handle camera scan results
  const handleScanComplete = useCallback((detectedFields) => {
    const newWatchData = { ...watchData };
    const newFieldStatus = { ...fieldStatus };
    
    detectedFields.forEach(field => {
      const fieldName = field.field_name;
      if (field.confidence >= 0.5) {
        newWatchData[fieldName] = field.detected_value;
        newFieldStatus[fieldName] = field.confidence >= 0.7 ? "detected" : "suggested";
      }
    });
    
    setWatchData(newWatchData);
    setFieldStatus(newFieldStatus);
    setShowCamera(false);
    
    const detectedCount = detectedFields.filter(f => f.confidence >= 0.5).length;
    if (detectedCount > 0) {
      toast.success(`Detected ${detectedCount} watch attributes. Please confirm each field.`);
    } else {
      toast.warning("Could not detect watch details. Please enter manually.");
    }
  }, [watchData, fieldStatus]);

  // Calculate valuation
  const calculateValuation = async () => {
    if (!watchData.brand || !watchData.model_family) {
      toast.error("Please select at least brand and model");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/valuation`, {
        watch: watchData,
        calibration_mode: calibrationMode,
        confirmed_fields: confirmedFields
      });
      setValuation(response.data);
      
      // Save to history
      try {
        await axios.post(`${API}/scan-history`, {
          watch: watchData,
          valuation: response.data
        });
        // Refresh history
        const historyRes = await axios.get(`${API}/scan-history?limit=10`);
        setScanHistory(historyRes.data || []);
      } catch (historyError) {
        console.error("Failed to save to history:", historyError);
      }
    } catch (error) {
      console.error("Valuation error:", error);
      toast.error("Failed to calculate valuation");
    } finally {
      setIsLoading(false);
    }
  };

  // Save scan to history
  const saveScanToHistory = async () => {
    if (!watchData.brand) return;
    
    try {
      await axios.post(`${API}/scan-history`, {
        watch: watchData,
        valuation: valuation
      });
      const historyRes = await axios.get(`${API}/scan-history?limit=10`);
      setScanHistory(historyRes.data || []);
      toast.success("Scan saved to history");
    } catch (error) {
      console.error("Failed to save scan:", error);
    }
  };

  // Delete scan from history
  const deleteScan = async (scanId) => {
    try {
      await axios.delete(`${API}/scan-history/${scanId}`);
      setScanHistory(prev => prev.filter(s => s.id !== scanId));
      toast.success("Scan removed from history");
    } catch (error) {
      console.error("Failed to delete scan:", error);
    }
  };

  // Clear all history
  const clearHistory = async () => {
    try {
      await axios.delete(`${API}/scan-history`);
      setScanHistory([]);
      toast.success("History cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  // Load scan from history
  const loadScanFromHistory = (scan) => {
    setWatchData({
      brand: scan.brand || "",
      model_family: scan.model_family || "",
      dial_color: scan.dial_color || "",
      bezel_type: scan.bezel_type || "",
      bracelet_type: scan.bracelet_type || "",
      reference_number: "",
      condition: "Very Good",
      box_papers: false
    });
    setFieldStatus({
      brand: "manual",
      model_family: "manual",
      dial_color: "manual",
      bezel_type: "manual",
      bracelet_type: "manual"
    });
    setConfirmedFields([]);
    if (scan.valuation_fair) {
      setValuation({
        low_estimate: scan.valuation_low,
        fair_estimate: scan.valuation_fair,
        high_estimate: scan.valuation_high,
        confidence_level: scan.confidence_level || "low",
        confidence_percentage: 0,
        calibration_mode: "Market-Neutral",
        notes: ["Loaded from history - recalculate for current values"],
        breakdown: {}
      });
    }
    toast.success("Loaded from history");
  };

  // Reset form
  const resetForm = () => {
    setWatchData({
      brand: "",
      model_family: "",
      dial_color: "",
      bezel_type: "",
      bracelet_type: "",
      reference_number: "",
      condition: "Very Good",
      box_papers: false
    });
    setFieldStatus({
      brand: "manual",
      model_family: "manual",
      dial_color: "manual",
      bezel_type: "manual",
      bracelet_type: "manual"
    });
    setConfirmedFields([]);
    setValuation(null);
  };

  return (
    <div className="min-h-screen racing-green-gradient" data-testid="home-page">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4" data-testid="main-title">
            <span className="gold-gradient">Watch Market Intelligence</span>
          </h1>
          <p className="text-emerald-100/70 text-lg max-w-2xl mx-auto">
            Conservative, liquidity-first valuations anchored from trade-level pricing.
            <span className="text-gold block mt-1">Not an appraisal service.</span>
          </p>
        </div>

        {/* Currency Selector - Top Right */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900/50 border border-emerald-700/50 text-emerald-100/70 rounded-lg hover:bg-emerald-800/50 hover:text-gold transition-colors"
            data-testid="compare-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare Watches
          </button>
          <CurrencySelector
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </div>

        {/* Camera Scanner Modal */}
        {showCamera && (
          <CameraScanner
            onClose={() => setShowCamera(false)}
            onScanComplete={handleScanComplete}
            apiEndpoint={`${API}/analyze-image-base64`}
          />
        )}

        {/* Watch Comparison Modal */}
        <WatchComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          currency={selectedCurrency}
          currencies={currencies}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Scan Button */}
            <button
              onClick={() => setShowCamera(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-800/30 to-emerald-700/30 border border-gold/30 rounded-xl text-gold-light font-medium hover:from-emerald-800/50 hover:to-emerald-700/50 hover:border-gold/50 transition-all duration-300 flex items-center justify-center gap-3 group"
              data-testid="open-camera-btn"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Scan Watch with Camera</span>
              <span className="text-xs text-gold/60 ml-2">Auto-detect details</span>
            </button>

            {/* Watch Form */}
            <WatchForm
              watchData={watchData}
              fieldStatus={fieldStatus}
              confirmedFields={confirmedFields}
              referenceData={referenceData}
              onFieldChange={handleFieldChange}
              onConfirmField={handleConfirmField}
              onRejectField={handleRejectField}
            />

            {/* Calibration Mode */}
            <CalibrationSelector
              selectedMode={calibrationMode}
              onModeChange={setCalibrationMode}
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={calculateValuation}
                disabled={isLoading || !watchData.brand || !watchData.model_family}
                className="flex-1 py-4 px-6 btn-gold font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                data-testid="calculate-valuation-btn"
              >
                {isLoading ? "Calculating..." : "Get Valuation"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-4 border border-emerald-700/50 text-emerald-100/70 rounded-xl hover:bg-emerald-800/30 hover:text-emerald-100 transition-all duration-300"
                data-testid="reset-form-btn"
              >
                Reset
              </button>
            </div>

            {/* Export PDF Button */}
            {valuation && (
              <button
                onClick={handleExportPDF}
                className="w-full py-3 px-4 bg-emerald-900/50 border border-emerald-700/50 text-emerald-100/70 rounded-xl hover:bg-emerald-800/50 hover:text-gold hover:border-gold/30 transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="export-pdf-btn"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Valuation Report (PDF)
              </button>
            )}
          </div>

          {/* Right Column - Valuation Display */}
          <div className="space-y-6">
            <ValuationDisplay 
              valuation={valuation}
              confirmedFields={confirmedFields}
              totalFields={5}
              currency={selectedCurrency}
              currencies={currencies}
            />

            {/* Market Insights */}
            <MarketInsights
              valuation={valuation}
              watchData={watchData}
              currency={selectedCurrency}
              currencies={currencies}
            />
            
            {/* Scan History */}
            <ScanHistory
              history={scanHistory}
              onSelectScan={loadScanFromHistory}
              onDeleteScan={deleteScan}
              onClearHistory={clearHistory}
              currency={selectedCurrency}
              currencies={currencies}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-sm text-emerald-100/40 max-w-3xl mx-auto">
          <p className="border-t border-emerald-800/50 pt-6">
            <strong className="text-emerald-100/60">Disclaimer:</strong> Crowntime AI provides market intelligence estimates only. 
            These are not appraisals and should not be used as such. Values are based on recent trade-level data 
            and may not reflect your specific watch&apos;s condition, provenance, or current market dynamics.
          </p>
        </div>
      </main>
      
      <Toaster position="top-right" theme="dark" />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
