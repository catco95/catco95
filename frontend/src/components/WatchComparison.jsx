import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WatchComparison = ({ isOpen, onClose, currency, currencies }) => {
  const [watches, setWatches] = useState([
    { brand: '', model: '', valuation: null },
    { brand: '', model: '', valuation: null }
  ]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([[], []]);
  const [isLoading, setIsLoading] = useState([false, false]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API}/watch-data/brands`);
        setBrands(res.data.brands);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };
    if (isOpen) fetchBrands();
  }, [isOpen]);

  const handleBrandChange = async (index, brand) => {
    const newWatches = [...watches];
    newWatches[index] = { brand, model: '', valuation: null };
    setWatches(newWatches);

    try {
      const res = await axios.get(`${API}/watch-data/models/${brand}`);
      const newModels = [...models];
      newModels[index] = res.data.models;
      setModels(newModels);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleModelChange = async (index, model) => {
    const newWatches = [...watches];
    newWatches[index] = { ...newWatches[index], model };
    setWatches(newWatches);

    // Auto-calculate valuation
    const newLoading = [...isLoading];
    newLoading[index] = true;
    setIsLoading(newLoading);

    try {
      const res = await axios.post(`${API}/valuation`, {
        watch: {
          brand: newWatches[index].brand,
          model_family: model,
          condition: 'Very Good',
          box_papers: false
        },
        calibration_mode: 'market_neutral',
        confirmed_fields: ['brand', 'model_family']
      });
      
      newWatches[index].valuation = res.data;
      setWatches([...newWatches]);
    } catch (error) {
      console.error('Failed to get valuation:', error);
    } finally {
      newLoading[index] = false;
      setIsLoading(newLoading);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  const calculateDifference = () => {
    if (!watches[0].valuation || !watches[1].valuation) return null;
    const diff = watches[0].valuation.fair_estimate - watches[1].valuation.fair_estimate;
    const percentage = ((diff / watches[1].valuation.fair_estimate) * 100).toFixed(1);
    return { diff, percentage };
  };

  const difference = calculateDifference();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" data-testid="comparison-modal">
      <div className="bg-emerald-950 border border-emerald-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-800">
          <div>
            <h2 className="text-xl font-serif text-gold">Watch Comparison</h2>
            <p className="text-emerald-100/50 text-sm">Compare two watches side by side</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-emerald-900 text-emerald-100/70 hover:bg-emerald-800 transition-colors"
            data-testid="close-comparison-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-6 p-6">
          {watches.map((watch, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-gold font-medium text-center">Watch {index + 1}</h3>
              
              {/* Brand Select */}
              <Select value={watch.brand} onValueChange={(v) => handleBrandChange(index, v)}>
                <SelectTrigger className="bg-emerald-900/50 border-emerald-700 text-emerald-100">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-800 max-h-60">
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand} className="text-emerald-100 focus:bg-gold/20 focus:text-gold">
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Model Select */}
              <Select 
                value={watch.model} 
                onValueChange={(v) => handleModelChange(index, v)}
                disabled={!watch.brand}
              >
                <SelectTrigger className="bg-emerald-900/50 border-emerald-700 text-emerald-100 disabled:opacity-50">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950 border-emerald-800 max-h-60">
                  {models[index].map(model => (
                    <SelectItem key={model} value={model} className="text-emerald-100 focus:bg-gold/20 focus:text-gold">
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Valuation Display */}
              <div className="bg-emerald-900/30 rounded-xl p-4 min-h-[200px]">
                {isLoading[index] ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : watch.valuation ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-emerald-100/50 text-xs">Fair Market Value</p>
                      <p className="text-2xl font-bold text-gold">{formatCurrency(watch.valuation.fair_estimate)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-emerald-900/50 rounded-lg p-2">
                        <p className="text-emerald-100/40 text-xs">Low</p>
                        <p className="text-teal-400 font-medium">{formatCurrency(watch.valuation.low_estimate)}</p>
                      </div>
                      <div className="bg-emerald-900/50 rounded-lg p-2">
                        <p className="text-emerald-100/40 text-xs">High</p>
                        <p className="text-emerald-400 font-medium">{formatCurrency(watch.valuation.high_estimate)}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        watch.valuation.confidence_level === 'high' ? 'bg-teal-500/20 text-teal-400' :
                        watch.valuation.confidence_level === 'medium' ? 'bg-gold/20 text-gold' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {watch.valuation.confidence_level} confidence
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-emerald-100/30 text-sm">
                    Select brand & model
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Difference Summary */}
        {difference && (
          <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-gold/10 to-yellow-600/10 border border-gold/30 rounded-xl">
            <div className="text-center">
              <p className="text-emerald-100/60 text-sm mb-2">Value Difference</p>
              <p className={`text-2xl font-bold ${difference.diff >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {difference.diff >= 0 ? '+' : ''}{formatCurrency(Math.abs(difference.diff))}
              </p>
              <p className="text-emerald-100/50 text-sm">
                Watch 1 is <span className={difference.diff >= 0 ? 'text-emerald-400' : 'text-orange-400'}>
                  {Math.abs(parseFloat(difference.percentage))}% {difference.diff >= 0 ? 'higher' : 'lower'}
                </span> than Watch 2
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-emerald-800 text-center">
          <p className="text-emerald-100/30 text-xs">
            Valuations based on Market-Neutral mode with standard condition assumptions
          </p>
        </div>
      </div>
    </div>
  );
};

export default WatchComparison;
