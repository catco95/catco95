import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import axios from "axios";
import BetaBadge from "../components/BetaBadge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ValuationTool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [valuationsUsed, setValuationsUsed] = useState(
    parseInt(localStorage.getItem('crowntime_valuations_used') || '0')
  );

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    reference: "",
    year: "",
    case_size: "",
    case_material: "",
    bezel_type: "",
    dial_description: "",
    bracelet_strap: "",
    condition: "",
    box_papers: "",
    modifications: "",
    location: "",
    currency: "USD"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check valuation limit
    const currentUsed = parseInt(localStorage.getItem('crowntime_valuations_used') || '0');
    if (currentUsed >= 5) {
      alert("You've reached the 5 valuation limit for this beta test. Please contact Crowntime for full access.");
      return;
    }
    
    // Check if we have either text data or image
    const hasTextData = Object.values(formData).some(value => value.trim() !== "");
    
    if (!hasTextData && !selectedImage) {
      alert("Please provide either watch details or upload an image");
      return;
    }
    
    setLoading(true);
    setLoadingProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 800);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await axios.post(`${API}/valuate`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Increment valuation count
      const newCount = currentUsed + 1;
      localStorage.setItem('crowntime_valuations_used', newCount.toString());
      setValuationsUsed(newCount);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => {
        setResult(response.data);
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Valuation error:", error);
      alert(error.response?.data?.detail || "Failed to process valuation. Please try again.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment.toLowerCase().includes('rising')) return <TrendingUp className="w-5 h-5" />;
    if (sentiment.toLowerCase().includes('softening')) return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const getSignalColor = (signal) => {
    if (signal.toLowerCase() === 'buy') return 'text-green-400';
    if (signal.toLowerCase() === 'avoid') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BetaBadge valuationsUsed={valuationsUsed} valuationsLimit={5} />
      
      {/* Header */}
      <header className="backdrop-blur-xl bg-background/70 border-b border-white/10" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/")} data-testid="logo">
            <img 
              src="https://customer-assets.emergentagent.com/job_crown-valuer/artifacts/5rhwovc5_4550EE2A-9235-4151-9654-A005E42CC362.png" 
              alt="Crowntime" 
              className="h-20 w-auto"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'top',
                clipPath: 'inset(0 0 35% 0)',
                filter: 'brightness(1.5) contrast(1.1)',
                mixBlendMode: 'screen'
              }}
            />
            <span className="text-xs text-primary font-semibold" style={{ marginTop: '-40px' }}>TM</span>
          </div>
          <button
            onClick={() => navigate("/")}
            data-testid="back-button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight mb-4" data-testid="page-title">
              Watch Valuation Tool
            </h1>
            <p className="text-muted-foreground text-lg mb-2" data-testid="page-subtitle">
              Provide detailed information for accurate market intelligence
            </p>
            <p className="text-muted-foreground text-sm" data-testid="image-only-hint">
              Or simply upload a photo for instant AI analysis
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto" data-testid="valuation-form">
              <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8 md:p-12">
                {/* Image Upload */}
                <div className="mb-12">
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    Watch Image {imagePreview ? "(Required for image-only mode)" : "(Optional - or use image-only mode)"}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      data-testid="image-upload"
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-sm cursor-pointer hover:border-primary/50 transition-all"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-4" />
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-sm">
                            Image uploaded ✓
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                          <span className="text-sm text-muted-foreground mb-2">Click to upload watch image</span>
                          <span className="text-xs text-muted-foreground/60">Upload just a photo to skip the form below</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="mb-8 bg-card/30 border border-white/5 rounded-sm p-6">
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    Valuation Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    data-testid="currency-select"
                    className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none text-foreground"
                  >
                    <option value="USD" className="bg-card text-foreground">USD - US Dollar ($)</option>
                    <option value="EUR" className="bg-card text-foreground">EUR - Euro (€)</option>
                    <option value="GBP" className="bg-card text-foreground">GBP - British Pound (£)</option>
                    <option value="CHF" className="bg-card text-foreground">CHF - Swiss Franc (Fr)</option>
                    <option value="AUD" className="bg-card text-foreground">AUD - Australian Dollar (A$)</option>
                    <option value="CAD" className="bg-card text-foreground">CAD - Canadian Dollar (C$)</option>
                    <option value="JPY" className="bg-card text-foreground">JPY - Japanese Yen (¥)</option>
                    <option value="HKD" className="bg-card text-foreground">HKD - Hong Kong Dollar (HK$)</option>
                    <option value="SGD" className="bg-card text-foreground">SGD - Singapore Dollar (S$)</option>
                  </select>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Brand {!selectedImage && "*"}
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required={!selectedImage}
                      data-testid="input-brand"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Rolex"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Model {!selectedImage && "*"}
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required={!selectedImage}
                      data-testid="input-model"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Submariner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      data-testid="input-reference"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., 116610LN"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Year or Era
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      data-testid="input-year"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., 2018"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Case Size
                    </label>
                    <input
                      type="text"
                      name="case_size"
                      value={formData.case_size}
                      onChange={handleChange}
                      data-testid="input-case-size"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., 40mm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Case Material
                    </label>
                    <input
                      type="text"
                      name="case_material"
                      value={formData.case_material}
                      onChange={handleChange}
                      data-testid="input-case-material"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Stainless Steel"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Bezel Type
                    </label>
                    <input
                      type="text"
                      name="bezel_type"
                      value={formData.bezel_type}
                      onChange={handleChange}
                      data-testid="input-bezel-type"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Ceramic"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Dial Description
                    </label>
                    <input
                      type="text"
                      name="dial_description"
                      value={formData.dial_description}
                      onChange={handleChange}
                      data-testid="input-dial-description"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Bracelet / Strap
                    </label>
                    <input
                      type="text"
                      name="bracelet_strap"
                      value={formData.bracelet_strap}
                      onChange={handleChange}
                      data-testid="input-bracelet-strap"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Oyster Bracelet"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Condition
                    </label>
                    <input
                      type="text"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      data-testid="input-condition"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Excellent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Box & Papers
                    </label>
                    <input
                      type="text"
                      name="box_papers"
                      value={formData.box_papers}
                      onChange={handleChange}
                      data-testid="input-box-papers"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Full Set"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Modifications
                    </label>
                    <input
                      type="text"
                      name="modifications"
                      value={formData.modifications}
                      onChange={handleChange}
                      data-testid="input-modifications"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., None"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Location / Market
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      data-testid="input-location"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., USA"
                    />
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="submit-valuation-button"
                    className="rounded-none uppercase tracking-widest text-xs font-bold px-16 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing Market Data...
                        </div>
                        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-foreground transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      "Get Valuation"
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto"
              data-testid="valuation-result"
            >
              {/* Valuation Header */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8 md:p-12 mb-8">
                <div className="text-center mb-8">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Market Valuation Range</div>
                  <div className="font-heading text-5xl md:text-6xl tracking-tight text-primary mb-6" data-testid="valuation-fair-price">
                    {result.valuation_range.fair}
                  </div>
                  <div className="flex justify-center gap-8 text-sm tabular-nums mb-6">
                    <div>
                      <div className="text-muted-foreground mb-1">Low</div>
                      <div className="font-semibold" data-testid="valuation-low-price">{result.valuation_range.low}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">High</div>
                      <div className="font-semibold" data-testid="valuation-high-price">{result.valuation_range.high}</div>
                    </div>
                  </div>
                  
                  {/* Retail Price */}
                  {result.retail_price && (
                    <div className="pt-6 border-t border-white/10">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recommended Retail Price</div>
                      <div className="text-2xl font-semibold text-foreground mb-2" data-testid="retail-price">
                        {result.retail_price}
                      </div>
                      {result.retail_relationship && (
                        <div className="text-sm text-muted-foreground" data-testid="retail-relationship">
                          {result.retail_relationship}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confidence & Sentiment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Confidence</div>
                    <div className="text-2xl font-semibold tabular-nums" data-testid="confidence-score">
                      {(result.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Market</div>
                    <div className="text-2xl font-semibold flex items-center justify-center gap-2" data-testid="market-sentiment">
                      {getSentimentIcon(result.market_sentiment)}
                      {result.market_sentiment}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Signal</div>
                    <div className={`text-2xl font-bold uppercase ${getSignalColor(result.signal)}`} data-testid="signal">
                      {result.signal}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8" data-testid="value-drivers">
                  <h3 className="font-heading text-xl mb-6">Value Drivers</h3>
                  <ul className="space-y-3">
                    {result.value_drivers.map((driver, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8" data-testid="risk-factors">
                  <h3 className="font-heading text-xl mb-6">Risk Factors</h3>
                  <ul className="space-y-3">
                    {result.risk_factors.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-destructive mt-1">•</span>
                        <span className="text-muted-foreground">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Full Analysis */}
              <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8 mb-8" data-testid="full-analysis">
                <h3 className="font-heading text-xl mb-6">Analysis</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {result.full_analysis}
                </p>
                <div className="pt-6 border-t border-white/10">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Recommendation: </span>
                    <span className={`font-semibold ${getSignalColor(result.signal)}`}>{result.signal}</span>
                    <span className="text-muted-foreground"> — {result.signal_justification}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-card/30 border border-white/5 rounded-sm p-6 mb-8" data-testid="disclaimer">
                <h4 className="text-xs uppercase tracking-widest text-primary font-semibold mb-3 text-center">
                  Important Legal Disclaimer
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
                  This valuation is provided as indicative market intelligence only and is not a certified appraisal. 
                  The analysis is generated by artificial intelligence based on available market data and should be 
                  treated as an estimate. Actual values may differ significantly. Crowntime assumes no liability for 
                  decisions made based on this information. For certified appraisals or authentication, please consult 
                  a qualified professional watch appraiser.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setFormData({
                      brand: "",
                      model: "",
                      reference: "",
                      year: "",
                      case_size: "",
                      case_material: "",
                      bezel_type: "",
                      dial_description: "",
                      bracelet_strap: "",
                      condition: "",
                      box_papers: "",
                      modifications: "",
                      location: "",
                      currency: "USD"
                    });
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  data-testid="new-valuation-button"
                  className="rounded-none uppercase tracking-widest text-xs font-bold px-12 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300"
                >
                  New Valuation
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ValuationTool;