import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CameraCapture = ({ onDetectionComplete, onClose }) => {
  const [mode, setMode] = useState('capture'); // capture, preview, detecting
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedDetails, setDetectedDetails] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please enable camera permissions in your browser settings.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError('Camera not ready. Please try again.');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      setCapturedImage(blob);
      setMode('preview');
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const detectDetails = async () => {
    setMode('detecting');
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', capturedImage);
      
      const response = await axios.post(`${API}/detect-watch-details`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      
      setDetectedDetails(response.data.detected_details);
      setMode('results');
    } catch (err) {
      console.error('Detection error:', err);
      setError('Detection failed. Please try again or upload manually.');
      setMode('preview');
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setDetectedDetails(null);
    setError('');
    setMode('capture');
  };

  const confirmDetection = () => {
    onDetectionComplete(detectedDetails);
  };

  const getConfidenceBadge = (confidence) => {
    const badges = {
      detected: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🟢', text: 'Detected' },
      suggested: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🟡', text: 'Suggested' },
      uncertain: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔴', text: 'Unconfirmed' }
    };
    return badges[confidence] || badges.uncertain;
  };

  // Initialize camera when component mounts or mode changes to capture
  useEffect(() => {
    if (mode === 'capture') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-white/10 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-heading">Camera Detection</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-sm p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {mode === 'capture' && (
            <div>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full rounded-sm bg-black mb-4"
              />
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Center watch in frame • Ensure good lighting</p>
                <button
                  onClick={capturePhoto}
                  className="rounded-none uppercase tracking-widest text-xs font-bold px-12 py-4 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all"
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div>
              <img src={URL.createObjectURL(capturedImage)} alt="Captured" className="w-full rounded-sm mb-4" />
              <div className="flex gap-4">
                <button
                  onClick={retake}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold px-8 py-4 border border-white/20 hover:border-primary transition-all"
                >
                  Retake
                </button>
                <button
                  onClick={detectDetails}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold px-8 py-4 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all"
                >
                  Detect Details
                </button>
              </div>
            </div>
          )}

          {mode === 'detecting' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Detecting watch details...</p>
            </div>
          )}

          {mode === 'results' && detectedDetails && (
            <div>
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4">
                <p className="text-sm text-yellow-400 mb-2 font-semibold">⚠️ Auto-Filled Details Detected</p>
                <p className="text-xs text-muted-foreground">
                  Please review and confirm before valuation. Unconfirmed fields will reduce confidence score.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {Object.entries(detectedDetails).map(([key, data]) => {
                  const badge = getConfidenceBadge(data.confidence);
                  const fieldNames = {
                    brand: 'Brand',
                    model: 'Model',
                    reference: 'Reference',
                    dial_description: 'Dial',
                    bezel_type: 'Bezel',
                    bracelet_strap: 'Bracelet/Strap',
                    case_material: 'Case Material',
                    year: 'Year/Era',
                    case_size: 'Case Size'
                  };

                  return (
                    <div key={key} className="bg-card/50 border border-white/5 rounded-sm p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-muted-foreground">{fieldNames[key]}</span>
                        <span className={`text-xs px-2 py-1 rounded-sm border ${badge.color}`}>
                          {badge.icon} {badge.text}
                        </span>
                      </div>
                      <p className="text-foreground">{data.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={retake}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold px-8 py-4 border border-white/20 hover:border-primary transition-all"
                >
                  Retake
                </button>
                <button
                  onClick={confirmDetection}
                  className="flex-1 rounded-none uppercase tracking-widest text-xs font-bold px-8 py-4 bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all"
                >
                  <Check className="w-4 h-4 inline mr-2" />
                  Use These Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;