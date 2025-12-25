import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ValuationTool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
    location: ""
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
    setLoading(true);
    setResult(null);

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

      setResult(response.data);
    } catch (error) {
      console.error("Valuation error:", error);
      alert("Failed to process valuation. Please try again.");
    } finally {
      setLoading(false);
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
      {/* Header */}
      <header className="backdrop-blur-xl bg-background/70 border-b border-white/10" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="font-heading text-3xl tracking-tight text-primary cursor-pointer" onClick={() => navigate("/")} data-testid="logo">
            Crowntime AI
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
            <p className="text-muted-foreground text-lg" data-testid="page-subtitle">
              Provide detailed information for accurate market intelligence
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto" data-testid="valuation-form">
              <div className="bg-card/50 backdrop-blur-sm border border-white/5 rounded-sm p-8 md:p-12">
                {/* Image Upload */}
                <div className="mb-12">
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-4">
                    Watch Image (Optional)
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
                        <img src={imagePreview} alt="Preview" className="h-full w-auto object-contain" />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                          <span className="text-sm text-muted-foreground">Click to upload watch image</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required
                      data-testid="input-brand"
                      className="w-full bg-transparent border-b border-white/20 rounded-none px-0 py-4 focus:border-primary focus:outline-none placeholder:text-white/20 transition-all"
                      placeholder="e.g., Rolex"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
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
                    className="rounded-none uppercase tracking-widest text-xs font-bold px-16 py-5 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Analyzing..." : "Get Valuation"}
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
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Valuation Range</div>
                  <div className="font-heading text-5xl md:text-6xl tracking-tight text-primary mb-6" data-testid="valuation-fair-price">
                    {result.valuation_range.fair}
                  </div>
                  <div className="flex justify-center gap-8 text-sm tabular-nums">
                    <div>
                      <div className="text-muted-foreground mb-1">Low</div>
                      <div className="font-semibold" data-testid="valuation-low-price">{result.valuation_range.low}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">High</div>
                      <div className="font-semibold" data-testid="valuation-high-price">{result.valuation_range.high}</div>
                    </div>
                  </div>
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
              <div className="text-center text-xs text-muted-foreground mb-8" data-testid="disclaimer">
                Indicative market intelligence only. Not a certified appraisal.
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
                      location: ""
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