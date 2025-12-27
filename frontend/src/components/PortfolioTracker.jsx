import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PortfolioTracker = ({ isOpen, onClose, currency, currencies }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [priceTrend, setPriceTrend] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWatch, setNewWatch] = useState({
    brand: '',
    model_family: '',
    purchase_price: '',
    purchase_date: '',
    condition: 'Very Good',
    notes: ''
  });
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPortfolio();
      fetchBrands();
    }
  }, [isOpen]);

  const fetchPortfolio = async () => {
    try {
      const [portfolioRes, summaryRes] = await Promise.all([
        axios.get(`${API}/portfolio`),
        axios.get(`${API}/portfolio/summary/stats`)
      ]);
      setPortfolio(portfolioRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/watch-data/brands`);
      setBrands(res.data.brands);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchModels = async (brand) => {
    try {
      const res = await axios.get(`${API}/watch-data/models/${brand}`);
      setModels(res.data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const fetchPriceTrend = async (brand, model) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/price-trends/${brand}/${model}?months=12`);
      setPriceTrend(res.data);
    } catch (error) {
      console.error('Failed to fetch price trend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWatch = async () => {
    if (!newWatch.brand || !newWatch.model_family) {
      toast.error('Please select brand and model');
      return;
    }
    
    try {
      await axios.post(`${API}/portfolio`, {
        ...newWatch,
        purchase_price: newWatch.purchase_price ? parseInt(newWatch.purchase_price) : null,
        purchase_currency: currency
      });
      toast.success('Watch added to portfolio');
      setShowAddForm(false);
      setNewWatch({ brand: '', model_family: '', purchase_price: '', purchase_date: '', condition: 'Very Good', notes: '' });
      fetchPortfolio();
    } catch (error) {
      toast.error('Failed to add watch');
    }
  };

  const handleRemoveWatch = async (watchId) => {
    try {
      await axios.delete(`${API}/portfolio/${watchId}`);
      toast.success('Watch removed from portfolio');
      fetchPortfolio();
      if (selectedWatch?.id === watchId) {
        setSelectedWatch(null);
        setPriceTrend(null);
      }
    } catch (error) {
      toast.error('Failed to remove watch');
    }
  };

  const handleSelectWatch = async (watch) => {
    setSelectedWatch(watch);
    fetchPriceTrend(watch.brand, watch.model_family);
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-emerald-950 border border-gold/30 rounded-lg p-3 shadow-lg">
          <p className="text-emerald-100/60 text-xs mb-1">{label}</p>
          <p className="text-gold font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" data-testid="portfolio-modal">
      <div className="bg-emerald-950 border border-emerald-800 rounded-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-800">
          <div>
            <h2 className="text-xl font-serif text-gold">Watch Portfolio</h2>
            <p className="text-emerald-100/50 text-sm">Track your collection's value</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gold/20 border border-gold/40 text-gold rounded-lg hover:bg-gold/30 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Watch
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-emerald-900 text-emerald-100/70 hover:bg-emerald-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Portfolio List */}
          <div className="w-1/3 border-r border-emerald-800 overflow-y-auto p-4">
            {/* Summary Card */}
            {summary && summary.total_watches > 0 && (
              <div className="bg-gradient-to-r from-gold/10 to-yellow-600/10 border border-gold/30 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-emerald-100/60 text-xs">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-gold">{formatCurrency(summary.total_current_value)}</p>
                  {summary.total_purchase_value > 0 && (
                    <p className={`text-sm ${summary.total_gain_loss >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {summary.total_gain_loss >= 0 ? '+' : ''}{formatCurrency(summary.total_gain_loss)} ({summary.total_gain_loss_percentage}%)
                    </p>
                  )}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gold/20">
                  <div className="text-center">
                    <p className="text-emerald-100/40 text-xs">Watches</p>
                    <p className="text-gold font-bold">{summary.total_watches}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-100/40 text-xs">Brands</p>
                    <p className="text-gold font-bold">{Object.keys(summary.watches_by_brand || {}).length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Watch List */}
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-800/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-emerald-100/50">No watches yet</p>
                <p className="text-emerald-100/30 text-sm">Add watches to track their value</p>
              </div>
            ) : (
              <div className="space-y-2">
                {portfolio.map(watch => (
                  <div
                    key={watch.id}
                    onClick={() => handleSelectWatch(watch)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedWatch?.id === watch.id
                        ? 'bg-gold/20 border border-gold/40'
                        : 'bg-emerald-900/30 border border-emerald-800/50 hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gold font-medium text-sm">{watch.brand}</p>
                        <p className="text-emerald-100/70 text-xs">{watch.model_family}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveWatch(watch.id); }}
                        className="p-1 rounded text-emerald-100/30 hover:text-orange-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedWatch && priceTrend ? (
              <div className="space-y-6">
                {/* Watch Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif text-gold">{selectedWatch.brand}</h3>
                    <p className="text-emerald-100/70">{selectedWatch.model_family}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100/50 text-sm">Current Value</p>
                    <p className="text-2xl font-bold text-gold">{formatCurrency(priceTrend.current_value)}</p>
                  </div>
                </div>

                {/* Price Trend Chart */}
                <div className="bg-emerald-900/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-emerald-100/70">12-Month Price Trend</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      priceTrend.trend_direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                      priceTrend.trend_direction === 'down' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gold/20 text-gold'
                    }`}>
                      {priceTrend.trend_direction === 'up' ? '↑' : priceTrend.trend_direction === 'down' ? '↓' : '→'} {priceTrend.price_change_percentage}%
                    </span>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceTrend.data.map(d => ({ ...d, fair: d.fair * (currencies[currency]?.rate || 1) }))}>
                        <defs>
                          <linearGradient id="colorFair" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(v) => `${currencies[currency]?.symbol || '$'}${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="fair" stroke="#d4af37" strokeWidth={2} fill="url(#colorFair)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-900/30 rounded-xl p-4 text-center">
                    <p className="text-emerald-100/50 text-xs">Period Change</p>
                    <p className={`text-lg font-bold ${priceTrend.price_change >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {priceTrend.price_change >= 0 ? '+' : ''}{formatCurrency(priceTrend.price_change)}
                    </p>
                  </div>
                  <div className="bg-emerald-900/30 rounded-xl p-4 text-center">
                    <p className="text-emerald-100/50 text-xs">Volatility</p>
                    <p className="text-lg font-bold text-gold">{priceTrend.volatility_percentage}%</p>
                  </div>
                  <div className="bg-emerald-900/30 rounded-xl p-4 text-center">
                    <p className="text-emerald-100/50 text-xs">Trend</p>
                    <p className={`text-lg font-bold capitalize ${
                      priceTrend.trend_direction === 'up' ? 'text-emerald-400' :
                      priceTrend.trend_direction === 'down' ? 'text-orange-400' : 'text-gold'
                    }`}>{priceTrend.trend_direction}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-800/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-emerald-100/50">Select a watch to view trends</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Watch Modal */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-serif text-gold mb-4">Add Watch to Portfolio</h3>
              
              <div className="space-y-4">
                <select
                  value={newWatch.brand}
                  onChange={(e) => { setNewWatch({...newWatch, brand: e.target.value, model_family: ''}); fetchModels(e.target.value); }}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-100"
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                
                <select
                  value={newWatch.model_family}
                  onChange={(e) => setNewWatch({...newWatch, model_family: e.target.value})}
                  disabled={!newWatch.brand}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-100 disabled:opacity-50"
                >
                  <option value="">Select Model</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                
                <input
                  type="number"
                  placeholder="Purchase Price (optional)"
                  value={newWatch.purchase_price}
                  onChange={(e) => setNewWatch({...newWatch, purchase_price: e.target.value})}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-100 placeholder:text-emerald-100/30"
                />
                
                <input
                  type="date"
                  value={newWatch.purchase_date}
                  onChange={(e) => setNewWatch({...newWatch, purchase_date: e.target.value})}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-100"
                />
                
                <textarea
                  placeholder="Notes (optional)"
                  value={newWatch.notes}
                  onChange={(e) => setNewWatch({...newWatch, notes: e.target.value})}
                  className="w-full p-3 bg-emerald-900/50 border border-emerald-700 rounded-lg text-emerald-100 placeholder:text-emerald-100/30 h-20"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-emerald-700 text-emerald-100/70 rounded-lg hover:bg-emerald-800/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWatch}
                  className="flex-1 py-3 btn-gold rounded-lg font-medium"
                >
                  Add Watch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTracker;
