import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import "@/App.css";
import axios from "axios";
import { 
  Camera, RefreshCw, Scale, Shield, TrendingUp, BarChart3, Briefcase, X, Plus, Trash2, 
  Watch, ChevronDown, Upload, Download, LineChart, ArrowUpRight, ArrowDownRight, Minus,
  Loader2, CheckCircle, AlertCircle, FileDown, TrendingDown, User, LogOut, Mail, Lock, Eye, EyeOff
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crowntime_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      logout();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API}/auth/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token, user: userData } = response.data;
    localStorage.setItem('crowntime_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('crowntime_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (credential) => {
    const response = await axios.post(`${API}/auth/google`, { credential });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('crowntime_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('crowntime_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Select Component
const CustomSelect = ({ value, onChange, options, placeholder, disabled, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options?.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );
  
  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-left flex items-center justify-between transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-500 hover:bg-teal-900/70 cursor-pointer'}
          ${value ? 'text-white' : 'text-gray-400'}`}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-teal-900 border border-teal-700 rounded-lg shadow-xl max-h-60 overflow-auto animate-fadeIn">
            {options?.map((opt, idx) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = optValue === value;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-teal-800 transition-colors
                    ${isSelected ? 'bg-teal-800 text-amber-400' : 'text-white'}`}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-8 w-full max-w-md animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-400">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Sign in to access your portfolio' : 'Start tracking your watch collection'}
          </p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-amber-400 hover:text-amber-300"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ onOpenTrends, onOpenAuth }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-teal-950 to-teal-900 border-b border-teal-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="text-white">Crowntime</span>
              <span className="text-amber-400 ml-1">AI</span>
            </h1>
            <span className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">Market Intelligence</span>
          </div>
          
          <nav className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={onOpenTrends}
              className="text-gray-300 hover:text-amber-400 cursor-pointer transition-colors text-sm md:text-base"
            >
              Market Trends
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-teal-700 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300 hidden sm:block">Live</span>
            </div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">{user.name[0].toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-white text-sm hidden md:block">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

// Camera Scan Modal Component
const CameraScanModal = ({ isOpen, onClose, onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API}/analyze-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze image');
    }
    setScanning(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleApplyResults = () => {
    if (result) {
      onScanComplete(result);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-amber-400 text-xl font-semibold">AI Watch Scanner</h2>
            <p className="text-gray-400 text-sm">Upload a watch image for AI analysis</p>
          </div>
        </div>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6
            ${dragActive ? 'border-amber-400 bg-amber-500/10' : 'border-teal-700 hover:border-teal-500'}`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
          
          {scanning ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-3" />
              <p className="text-white font-medium">Analyzing watch...</p>
              <p className="text-gray-400 text-sm">AI is identifying details</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-teal-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Drop your watch image here</p>
              <p className="text-gray-400 text-sm mb-4">or click to browse</p>
              <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-600 transition-colors">
                Select Image
              </button>
            </>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Watch Identified!</span>
              <span className="text-gray-400 text-sm">({Math.round(result.confidence * 100)}% confidence)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {result.brand && (
                <div className="bg-teal-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Brand</p>
                  <p className="text-white font-medium">{result.brand}</p>
                </div>
              )}
              {result.model && (
                <div className="bg-teal-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Model</p>
                  <p className="text-white font-medium">{result.model}</p>
                </div>
              )}
              {result.dial_color && (
                <div className="bg-teal-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Dial Color</p>
                  <p className="text-white font-medium">{result.dial_color}</p>
                </div>
              )}
              {result.condition && (
                <div className="bg-teal-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Condition</p>
                  <p className="text-white font-medium">{result.condition}</p>
                </div>
              )}
            </div>
            
            {result.description && (
              <div className="bg-teal-800/30 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">AI Analysis</p>
                <p className="text-gray-300 text-sm">{result.description}</p>
              </div>
            )}
            
            <button onClick={handleApplyResults} className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all">
              Apply to Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Price History Chart Component
const PriceHistoryChart = ({ brand, model, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && brand && model) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/price-history/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
          setData(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      const timeoutId = setTimeout(fetchData, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, brand, model]);

  if (!isOpen) return null;
  const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-6 w-full max-w-3xl animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        
        <div className="flex items-center gap-3 mb-6">
          <LineChart className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-amber-400 text-xl font-semibold">Price History</h2>
            <p className="text-gray-400 text-sm">{brand} {model} - 12 Month Trend</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
        ) : data ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              {data.image && <img src={data.image} alt={`${brand} ${model}`} className="w-24 h-24 object-cover rounded-lg" />}
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-amber-400">{formatCurrency(data.current_price)}</p>
                </div>
                <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">YoY Trend</p>
                  <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${data.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.trend >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    {Math.abs(data.trend)}%
                  </p>
                </div>
                <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Volatility</p>
                  <p className="text-2xl font-bold text-white capitalize">{data.volatility}</p>
                </div>
              </div>
            </div>
            
            <div className="h-64 bg-teal-800/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#134e4a" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d3d3d', border: '1px solid #14b8a6', borderRadius: '8px' }} labelStyle={{ color: '#9ca3af' }} formatter={(value) => [formatCurrency(value), 'Value']} />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p className="text-center text-gray-400 py-20">No data available</p>}
      </div>
    </div>
  );
};

// Market Trends Modal Component
const MarketTrendsModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API}/market-trends`);
          setData(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      const timeoutId = setTimeout(fetchData, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-auto animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-amber-400 text-xl font-semibold">Market Trends</h2>
            <p className="text-gray-400 text-sm">Luxury watch market overview - {data?.market_summary?.total_brands || 0} brands</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Avg Brand Value</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(data.market_summary.average_brand_value)}</p>
              </div>
              <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Market Trend</p>
                <p className={`text-xl font-bold ${data.market_summary.average_trend_yoy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.market_summary.average_trend_yoy >= 0 ? '+' : ''}{data.market_summary.average_trend_yoy}%
                </p>
              </div>
              <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Top Performer</p>
                <p className="text-xl font-bold text-white">{data.market_summary.top_performer}</p>
              </div>
              <div className="bg-teal-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Most Stable</p>
                <p className="text-xl font-bold text-white">{data.market_summary.most_stable}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-teal-800">
                    <th className="pb-3 pr-4">Brand</th>
                    <th className="pb-3 pr-4">Avg Value</th>
                    <th className="pb-3 pr-4">YoY Trend</th>
                    <th className="pb-3 pr-4">Volatility</th>
                    <th className="pb-3">Top Model</th>
                  </tr>
                </thead>
                <tbody>
                  {data.brands.map((brand, idx) => (
                    <tr key={idx} className="border-b border-teal-800/50 hover:bg-teal-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{brand.brand}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-amber-400">{formatCurrency(brand.average_value)}</td>
                      <td className="py-3 pr-4">
                        <span className={`flex items-center gap-1 ${brand.trend_yoy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {brand.trend_yoy > 0 ? <ArrowUpRight className="w-4 h-4" /> : brand.trend_yoy < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          {Math.abs(brand.trend_yoy)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded text-xs capitalize ${brand.volatility === 'low' ? 'bg-green-500/20 text-green-400' : brand.volatility === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {brand.volatility}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">
                        {brand.top_model} <span className="text-gray-500">({formatCurrency(brand.top_model_value)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

// Watch Details Form Component
const WatchDetailsForm = ({ formData, setFormData, options, modelInfo }) => {
  const models = formData.brand && options.brandModels[formData.brand] ? options.brandModels[formData.brand] : [];

  return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6 transition-all duration-300 hover:border-teal-700/50">
      <h2 className="text-amber-400 font-semibold text-lg mb-6">Watch Details</h2>
      
      {modelInfo && (
        <div className="flex items-start gap-4 mb-6 p-4 bg-teal-800/30 rounded-lg">
          {modelInfo.image && <img src={modelInfo.image} alt={modelInfo.name} className="w-20 h-20 object-cover rounded-lg" />}
          <div className="flex-1">
            <p className="text-white font-medium">{formData.brand} {modelInfo.name}</p>
            <p className="text-gray-400 text-sm mt-1">{modelInfo.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-teal-700/50 px-2 py-1 rounded text-teal-300">{modelInfo.case_size}</span>
              {modelInfo.references?.slice(0, 3).map((ref, i) => (
                <span key={i} className="text-xs bg-teal-700/50 px-2 py-1 rounded text-gray-400">{ref}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Brand <span className="text-amber-400">*</span></label>
          <CustomSelect value={formData.brand} onChange={(val) => setFormData(prev => ({ ...prev, brand: val, model: '' }))} options={options.brands} placeholder="Select brand" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Model Family <span className="text-amber-400">*</span></label>
          <CustomSelect value={formData.model} onChange={(val) => setFormData(prev => ({ ...prev, model: val }))} options={models.map(m => typeof m === 'string' ? m : m.name)} placeholder={formData.brand ? "Select model" : "Select brand first"} disabled={!formData.brand} />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Dial Color</label>
          <CustomSelect value={formData.dial_color} onChange={(val) => setFormData(prev => ({ ...prev, dial_color: val }))} options={options.dial_colors} placeholder="Select dial color" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Bezel Type</label>
          <CustomSelect value={formData.bezel_type} onChange={(val) => setFormData(prev => ({ ...prev, bezel_type: val }))} options={options.bezel_types} placeholder="Select bezel type" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Bracelet Type</label>
          <CustomSelect value={formData.bracelet_type} onChange={(val) => setFormData(prev => ({ ...prev, bracelet_type: val }))} options={options.bracelet_types} placeholder="Select bracelet type" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Reference Number</label>
          <input type="text" value={formData.reference_number} onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))} placeholder="e.g., 126610LN" className="w-full px-4 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">Condition</label>
          <CustomSelect value={formData.condition} onChange={(val) => setFormData(prev => ({ ...prev, condition: val }))} options={options.conditions} placeholder="Select condition" />
        </div>
        
        <div className="flex items-center gap-3">
          <input type="checkbox" id="box-papers" checked={formData.has_box_papers} onChange={(e) => setFormData(prev => ({ ...prev, has_box_papers: e.target.checked }))} className="w-5 h-5 rounded border-teal-700 bg-teal-900/50 text-amber-500 focus:ring-amber-500" />
          <label htmlFor="box-papers" className="text-gray-300">Includes Box & Papers</label>
        </div>
      </div>
    </div>
  );
};

// Calibration Mode Component
const CalibrationMode = ({ mode, setMode }) => {
  const modes = [
    { id: 'ultra_conservative', icon: Shield, title: 'Ultra-Conservative', description: 'Maximum safety margin for quick liquidity', color: 'text-blue-400' },
    { id: 'market_neutral', icon: Scale, title: 'Market-Neutral', description: 'Balanced approach reflecting current market', color: 'text-amber-400' },
    { id: 'patient_retail', icon: TrendingUp, title: 'Patient Retail', description: 'Optimistic pricing for patient sellers', color: 'text-green-400' }
  ];

  return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6">
      <h2 className="text-amber-400 font-semibold text-lg mb-4">Dealer Calibration Mode</h2>
      <div className="space-y-3">
        {modes.map(({ id, icon: Icon, title, description, color }) => (
          <button key={id} onClick={() => setMode(id)} className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${mode === id ? 'bg-teal-800/50 border-teal-600 scale-[1.02]' : 'bg-teal-900/30 border-teal-800/50 hover:border-teal-700'}`}>
            <div className="flex items-center gap-3">
              <input type="radio" checked={mode === id} onChange={() => setMode(id)} className="w-4 h-4 text-amber-500" />
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <div className={`font-medium ${color}`}>{title}</div>
                <div className="text-sm text-gray-400">{description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Valuation Results Component
const ValuationResults = ({ valuation, loading, fieldsConfirmed, onViewHistory }) => {
  const formatCurrency = (value, currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CHF: 'CHF ', JPY: '¥', AUD: 'A$', CAD: 'C$', HKD: 'HK$', SGD: 'S$', CNY: '¥' };
    return `${symbols[currency] || '$'}${value?.toLocaleString() || 0}`;
  };

  if (loading) return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6 h-full flex items-center justify-center">
      <div className="text-center"><RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" /><p className="text-gray-400">Calculating valuation...</p></div>
    </div>
  );

  if (!valuation) return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6 h-full">
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="w-16 h-16 bg-teal-800/50 rounded-xl flex items-center justify-center mb-4"><BarChart3 className="w-8 h-8 text-teal-500" /></div>
        <h3 className="text-amber-400 font-semibold text-lg mb-2">Valuation Results</h3>
        <p className="text-gray-400 text-sm max-w-xs">Enter watch details or scan with camera, then click &quot;Get Valuation&quot; to see market estimates.</p>
        <div className="mt-6 w-full max-w-xs">
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Fields Confirmed</span><span className="text-gray-300">{fieldsConfirmed} / 5</span></div>
          <div className="h-2 bg-teal-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-amber-500 transition-all duration-500" style={{ width: `${(fieldsConfirmed / 5) * 100}%` }} /></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-amber-400 font-semibold text-lg">Valuation Results</h3>
        <button onClick={onViewHistory} className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300"><LineChart className="w-4 h-4" />History</button>
      </div>
      
      {valuation.watch_image && <img src={valuation.watch_image} alt={`${valuation.brand} ${valuation.model}`} className="w-full h-32 object-cover rounded-lg mb-4" />}
      
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm mb-1">{valuation.brand}</p>
        <p className="text-white text-2xl font-bold mb-2">{valuation.model}</p>
        <p className="text-4xl font-bold text-amber-400">{formatCurrency(valuation.mid_estimate, valuation.currency)}</p>
        <p className="text-sm text-gray-400 mt-1">Market Neutral Estimate</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-teal-900/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">Low</p><p className="text-green-400 font-semibold">{formatCurrency(valuation.low_estimate, valuation.currency)}</p></div>
        <div className="text-center p-3 bg-teal-800/50 rounded-lg border border-amber-500/30"><p className="text-xs text-gray-400 mb-1">Mid</p><p className="text-amber-400 font-semibold">{formatCurrency(valuation.mid_estimate, valuation.currency)}</p></div>
        <div className="text-center p-3 bg-teal-900/50 rounded-lg"><p className="text-xs text-gray-400 mb-1">High</p><p className="text-blue-400 font-semibold">{formatCurrency(valuation.high_estimate, valuation.currency)}</p></div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm"><span className="text-gray-400">Confidence</span><span className="text-amber-400">{valuation.confidence_score}%</span></div>
        <div className="h-2 bg-teal-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-green-500" style={{ width: `${valuation.confidence_score}%` }} /></div>
      </div>
    </div>
  );
};

// Recent Scans Component
const RecentScans = ({ scans, onClear }) => {
  const formatCurrency = (value, currency) => `${currency === 'EUR' ? '€' : '$'}${value?.toLocaleString() || 0}`;
  const getTimeAgo = (timestamp) => {
    const diffMins = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-teal-900/30 border border-teal-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-amber-400 font-semibold">Recent Scans</h3>
        {scans.length > 0 && <button onClick={onClear} className="text-sm text-gray-400 hover:text-red-400">Clear All</button>}
      </div>
      
      {scans.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">No recent scans</p> : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <div key={scan.id} className="flex items-center gap-3 p-3 bg-teal-800/30 rounded-lg hover:bg-teal-800/50 transition-colors">
              {scan.watch_image ? <img src={scan.watch_image} alt="" className="w-10 h-10 object-cover rounded-lg" /> : <div className="w-10 h-10 bg-teal-700/50 rounded-lg flex items-center justify-center"><Watch className="w-5 h-5 text-teal-400" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{scan.brand} {scan.model}</p>
                <p className="text-amber-400 text-sm">{formatCurrency(scan.valuation, scan.currency)}</p>
              </div>
              <span className="text-xs text-gray-500">{getTimeAgo(scan.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Compare Modal
const CompareModal = ({ isOpen, onClose, brands, brandModels }) => {
  const [watch1, setWatch1] = useState({ brand: '', model: '' });
  const [watch2, setWatch2] = useState({ brand: '', model: '' });
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!watch1.brand || !watch1.model || !watch2.brand || !watch2.model) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API}/compare`, { params: { brand1: watch1.brand, model1: watch1.model, brand2: watch2.brand, model2: watch2.model } });
      setComparison(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        <h2 className="text-amber-400 text-xl font-semibold mb-6">Watch Comparison</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-3 text-center">Watch 1</h3>
            <CustomSelect value={watch1.brand} onChange={(val) => setWatch1({ brand: val, model: '' })} options={brands} placeholder="Select brand" className="mb-3" />
            <CustomSelect value={watch1.model} onChange={(val) => setWatch1(prev => ({ ...prev, model: val }))} options={(brandModels[watch1.brand] || []).map(m => typeof m === 'string' ? m : m.name)} placeholder="Select model" disabled={!watch1.brand} />
            {comparison && (
              <div className="mt-4 p-4 bg-teal-800/50 rounded-xl text-center">
                {comparison.watch1.image && <img src={comparison.watch1.image} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />}
                <p className="text-gray-400 text-sm">{comparison.watch1.brand}</p>
                <p className="text-white font-bold">{comparison.watch1.model}</p>
                <p className="text-2xl font-bold text-amber-400 mt-2">{formatCurrency(comparison.watch1.mid_estimate)}</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-medium mb-3 text-center">Watch 2</h3>
            <CustomSelect value={watch2.brand} onChange={(val) => setWatch2({ brand: val, model: '' })} options={brands} placeholder="Select brand" className="mb-3" />
            <CustomSelect value={watch2.model} onChange={(val) => setWatch2(prev => ({ ...prev, model: val }))} options={(brandModels[watch2.brand] || []).map(m => typeof m === 'string' ? m : m.name)} placeholder="Select model" disabled={!watch2.brand} />
            {comparison && (
              <div className="mt-4 p-4 bg-teal-800/50 rounded-xl text-center">
                {comparison.watch2.image && <img src={comparison.watch2.image} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />}
                <p className="text-gray-400 text-sm">{comparison.watch2.brand}</p>
                <p className="text-white font-bold">{comparison.watch2.model}</p>
                <p className="text-2xl font-bold text-amber-400 mt-2">{formatCurrency(comparison.watch2.mid_estimate)}</p>
              </div>
            )}
          </div>
        </div>
        
        {comparison && (
          <div className="mt-6 p-4 bg-teal-800/30 rounded-xl text-center">
            <p className="text-gray-400 text-sm">Price Difference</p>
            <p className={`text-2xl font-bold ${comparison.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {comparison.difference >= 0 ? '+' : ''}{formatCurrency(comparison.difference)}
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button onClick={handleCompare} disabled={!watch1.brand || !watch1.model || !watch2.brand || !watch2.model || loading} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all">
            {loading ? 'Comparing...' : 'Compare Watches'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Portfolio Modal
const PortfolioModal = ({ isOpen, onClose, brands, brandModels, options }) => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWatch, setNewWatch] = useState({ brand: '', model: '', condition: 'Very Good', has_box_papers: false, purchase_price: '', purchase_date: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      const [portfolioRes, summaryRes] = await Promise.all([axios.get(`${API}/portfolio`), axios.get(`${API}/portfolio/summary`)]);
      setPortfolio(portfolioRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(fetchPortfolio, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, fetchPortfolio]);

  const handleAddWatch = async () => {
    if (!newWatch.brand || !newWatch.model) return;
    setLoading(true);
    try {
      await axios.post(`${API}/portfolio`, { ...newWatch, purchase_price: newWatch.purchase_price ? parseFloat(newWatch.purchase_price) : null });
      setShowAddForm(false);
      setNewWatch({ brand: '', model: '', condition: 'Very Good', has_box_papers: false, purchase_price: '', purchase_date: '', notes: '' });
      fetchPortfolio();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleRemoveWatch = async (watchId) => {
    try {
      await axios.delete(`${API}/portfolio/${watchId}`);
      fetchPortfolio();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const response = await axios.get(`${API}/portfolio/export?format=csv`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'portfolio.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const response = await axios.get(`${API}/portfolio/export?format=json`);
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'portfolio.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-teal-900 border border-teal-700 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto animate-slideUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-amber-400 text-xl font-semibold">Watch Portfolio</h2>
            <p className="text-gray-400 text-sm">{user ? `${user.name}'s collection` : 'Track your collection'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="flex items-center gap-1 px-3 py-2 border border-teal-600 text-gray-300 rounded-lg hover:bg-teal-800 text-sm"><FileDown className="w-4 h-4" />CSV</button>
            <button onClick={() => handleExport('json')} className="flex items-center gap-1 px-3 py-2 border border-teal-600 text-gray-300 rounded-lg hover:bg-teal-800 text-sm"><Download className="w-4 h-4" />JSON</button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400"><Plus className="w-4 h-4" />Add</button>
          </div>
        </div>
        
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-teal-800/50 rounded-xl p-4 text-center"><p className="text-gray-400 text-sm">Watches</p><p className="text-2xl font-bold text-white">{summary.total_watches}</p></div>
            <div className="bg-teal-800/50 rounded-xl p-4 text-center"><p className="text-gray-400 text-sm">Value</p><p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.total_value)}</p></div>
            <div className="bg-teal-800/50 rounded-xl p-4 text-center"><p className="text-gray-400 text-sm">Cost</p><p className="text-2xl font-bold text-white">{formatCurrency(summary.total_cost)}</p></div>
            <div className="bg-teal-800/50 rounded-xl p-4 text-center"><p className="text-gray-400 text-sm">Gain/Loss</p><p className={`text-2xl font-bold flex items-center justify-center gap-1 ${summary.total_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>{summary.total_gain_loss >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}{formatCurrency(Math.abs(summary.total_gain_loss))}</p></div>
          </div>
        )}
        
        {showAddForm && (
          <div className="bg-teal-800/30 rounded-xl p-4 mb-6 animate-fadeIn">
            <h3 className="text-white font-medium mb-4">Add New Watch</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <CustomSelect value={newWatch.brand} onChange={(val) => setNewWatch(prev => ({ ...prev, brand: val, model: '' }))} options={brands} placeholder="Select brand" />
              <CustomSelect value={newWatch.model} onChange={(val) => setNewWatch(prev => ({ ...prev, model: val }))} options={(brandModels[newWatch.brand] || []).map(m => typeof m === 'string' ? m : m.name)} placeholder="Select model" disabled={!newWatch.brand} />
              <CustomSelect value={newWatch.condition} onChange={(val) => setNewWatch(prev => ({ ...prev, condition: val }))} options={options.conditions} placeholder="Condition" />
              <input type="number" value={newWatch.purchase_price} onChange={(e) => setNewWatch(prev => ({ ...prev, purchase_price: e.target.value }))} placeholder="Purchase Price (USD)" className="px-4 py-3 bg-teal-900/50 border border-teal-700/50 rounded-lg text-white placeholder-gray-500" />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleAddWatch} disabled={!newWatch.brand || !newWatch.model || loading} className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50">{loading ? 'Adding...' : 'Add to Portfolio'}</button>
              <button onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-teal-700 text-gray-300 rounded-lg hover:bg-teal-800">Cancel</button>
            </div>
          </div>
        )}
        
        {portfolio.length === 0 ? (
          <div className="text-center py-12"><Briefcase className="w-12 h-12 text-teal-600 mx-auto mb-3" /><p className="text-gray-400">Your portfolio is empty</p></div>
        ) : (
          <div className="space-y-3">
            {portfolio.map((watch) => (
              <div key={watch.id} className="flex items-center gap-4 p-4 bg-teal-800/30 rounded-xl hover:bg-teal-800/50 transition-colors group">
                {watch.watch_image ? <img src={watch.watch_image} alt="" className="w-12 h-12 object-cover rounded-xl" /> : <div className="w-12 h-12 bg-teal-700/50 rounded-xl flex items-center justify-center"><Watch className="w-6 h-6 text-teal-400" /></div>}
                <div className="flex-1"><p className="text-white font-medium">{watch.brand} {watch.model}</p><div className="flex gap-4 text-sm text-gray-400"><span>{watch.condition}</span>{watch.has_box_papers && <span>• Box & Papers</span>}</div></div>
                <div className="text-right"><p className="text-amber-400 font-semibold">{formatCurrency(watch.current_valuation)}</p>{watch.purchase_price && <p className="text-xs text-gray-500">Paid: {formatCurrency(watch.purchase_price)}</p>}</div>
                <button onClick={() => handleRemoveWatch(watch.id)} className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [options, setOptions] = useState({ brands: [], brandModels: {}, dial_colors: [], bezel_types: [], bracelet_types: [], conditions: [], currencies: [] });
  const [formData, setFormData] = useState({ brand: '', model: '', dial_color: '', bezel_type: '', bracelet_type: '', reference_number: '', condition: 'Very Good', has_box_papers: false, calibration_mode: 'market_neutral', currency: 'USD' });
  const [modelInfo, setModelInfo] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${API}/options`);
        const data = response.data;
        const brandModels = {};
        for (const brand of data.brands) {
          try {
            const modelsRes = await axios.get(`${API}/brands/${encodeURIComponent(brand)}/models`);
            brandModels[brand] = modelsRes.data.models;
          } catch (e) {
            brandModels[brand] = [];
          }
        }
        setOptions({ brands: data.brands, brandModels, dial_colors: data.dial_colors, bezel_types: data.bezel_types, bracelet_types: data.bracelet_types, conditions: data.conditions, currencies: data.currencies });
      } catch (error) {
        console.error(error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData.brand && formData.model && options.brandModels[formData.brand]) {
      const model = options.brandModels[formData.brand].find(m => (typeof m === 'string' ? m : m.name) === formData.model);
      setModelInfo(typeof model === 'object' ? model : null);
    } else {
      setModelInfo(null);
    }
  }, [formData.brand, formData.model, options.brandModels]);

  const fetchRecentScans = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/recent-scans`);
      setRecentScans(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchRecentScans, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchRecentScans]);

  const handleValuate = async () => {
    if (!formData.brand || !formData.model) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/valuate`, formData);
      setValuation(response.data);
      fetchRecentScans();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFormData({ brand: '', model: '', dial_color: '', bezel_type: '', bracelet_type: '', reference_number: '', condition: 'Very Good', has_box_papers: false, calibration_mode: 'market_neutral', currency: 'USD' });
    setValuation(null);
    setModelInfo(null);
  };

  const handleClearScans = async () => {
    try {
      await axios.delete(`${API}/recent-scans`);
      setRecentScans([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScanComplete = (result) => {
    setFormData(prev => ({ ...prev, brand: result.brand || prev.brand, model: result.model || prev.model, dial_color: result.dial_color || prev.dial_color, bezel_type: result.bezel_type || prev.bezel_type, bracelet_type: result.bracelet_type || prev.bracelet_type, reference_number: result.reference_number || prev.reference_number, condition: result.condition || prev.condition }));
  };

  const fieldsConfirmed = [formData.brand, formData.model, formData.dial_color, formData.bezel_type, formData.bracelet_type].filter(Boolean).length;

  return (
    <AuthProvider>
      <AppContent 
        options={options} formData={formData} setFormData={setFormData} modelInfo={modelInfo}
        valuation={valuation} recentScans={recentScans} loading={loading} fieldsConfirmed={fieldsConfirmed}
        showCompare={showCompare} setShowCompare={setShowCompare}
        showPortfolio={showPortfolio} setShowPortfolio={setShowPortfolio}
        showCamera={showCamera} setShowCamera={setShowCamera}
        showPriceHistory={showPriceHistory} setShowPriceHistory={setShowPriceHistory}
        showTrends={showTrends} setShowTrends={setShowTrends}
        showAuth={showAuth} setShowAuth={setShowAuth}
        handleValuate={handleValuate} handleReset={handleReset}
        handleClearScans={handleClearScans} handleScanComplete={handleScanComplete}
      />
    </AuthProvider>
  );
}

const AppContent = ({ options, formData, setFormData, modelInfo, valuation, recentScans, loading, fieldsConfirmed, showCompare, setShowCompare, showPortfolio, setShowPortfolio, showCamera, setShowCamera, showPriceHistory, setShowPriceHistory, showTrends, setShowTrends, showAuth, setShowAuth, handleValuate, handleReset, handleClearScans, handleScanComplete }) => {
  const { loading: authLoading } = useAuth();

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950">
      <Header onOpenTrends={() => setShowTrends(true)} onOpenAuth={() => setShowAuth(true)} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 italic mb-3">Watch Market Intelligence</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Conservative, liquidity-first valuations anchored from trade-level pricing.</p>
          <p className="text-amber-500 text-sm mt-1">15 premium brands • 100+ models • AI-powered analysis</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 px-6 py-2.5 border border-teal-600 text-white rounded-lg hover:bg-teal-800 hover:border-teal-500 transition-all"><BarChart3 className="w-4 h-4" />Compare</button>
          <button onClick={() => setShowPortfolio(true)} className="flex items-center gap-2 px-6 py-2.5 border border-teal-600 text-white rounded-lg hover:bg-teal-800 hover:border-teal-500 transition-all"><Briefcase className="w-4 h-4" />Portfolio</button>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Currency:</span>
            <CustomSelect value={formData.currency} onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))} options={options.currencies.map(c => ({ value: c, label: `${c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : ''} ${c}` }))} className="w-32" />
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <button onClick={() => setShowCamera(true)} className="w-full py-4 bg-gradient-to-r from-teal-700 to-teal-600 border border-teal-500 rounded-xl flex items-center justify-center gap-3 text-white hover:from-teal-600 hover:to-teal-500 transition-all group">
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Scan Watch with Camera</span>
            <span className="text-teal-300 text-sm">AI-powered auto-detect</span>
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WatchDetailsForm formData={formData} setFormData={setFormData} options={options} modelInfo={modelInfo} />
            <CalibrationMode mode={formData.calibration_mode} setMode={(mode) => setFormData(prev => ({ ...prev, calibration_mode: mode }))} />
            <div className="flex gap-4">
              <button onClick={handleValuate} disabled={!formData.brand || !formData.model || loading} className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Calculating...</span> : 'Get Valuation'}
              </button>
              <button onClick={handleReset} className="px-8 py-4 border border-teal-600 text-white rounded-xl hover:bg-teal-800 hover:border-teal-500 transition-all">Reset</button>
            </div>
          </div>
          
          <div className="space-y-6">
            <ValuationResults valuation={valuation} loading={loading} fieldsConfirmed={fieldsConfirmed} onViewHistory={() => setShowPriceHistory(true)} />
            <RecentScans scans={recentScans} onClear={handleClearScans} />
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 max-w-3xl mx-auto">
            <span className="font-semibold">Disclaimer:</span> Crowntime AI provides market intelligence estimates only. These are not appraisals and should not be used as such.
          </p>
        </div>
      </main>
      
      <CompareModal isOpen={showCompare} onClose={() => setShowCompare(false)} brands={options.brands} brandModels={options.brandModels} />
      <PortfolioModal isOpen={showPortfolio} onClose={() => setShowPortfolio(false)} brands={options.brands} brandModels={options.brandModels} options={options} />
      <CameraScanModal isOpen={showCamera} onClose={() => setShowCamera(false)} onScanComplete={handleScanComplete} />
      <PriceHistoryChart brand={valuation?.brand} model={valuation?.model} isOpen={showPriceHistory} onClose={() => setShowPriceHistory(false)} />
      <MarketTrendsModal isOpen={showTrends} onClose={() => setShowTrends(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default App;
