import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CameraScanner = ({ onClose, onScanComplete, apiEndpoint }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [mode, setMode] = useState('camera'); // 'camera' or 'upload'

  // Initialize camera
  useEffect(() => {
    if (mode !== 'camera') return;
    
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setCameraError(null);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError(
          err.name === 'NotAllowedError' 
            ? 'Camera access denied. Please allow camera access or upload an image.'
            : 'Could not access camera. Please try uploading an image instead.'
        );
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Switch to upload mode
  const switchToUpload = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setMode('upload');
    setCameraError(null);
  }, [stream]);

  // Switch to camera mode
  const switchToCamera = useCallback(() => {
    setCapturedImage(null);
    setMode('camera');
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Capture image from camera
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageData);

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  // Analyze captured image
  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setAnalysisProgress('Sending image to AI...');

    try {
      setAnalysisProgress('Analyzing watch details...');
      
      const response = await axios.post(apiEndpoint, {
        image: capturedImage
      });

      if (response.data.success) {
        setAnalysisProgress('Detection complete!');
        onScanComplete(response.data.detected_fields);
      } else {
        toast.error(response.data.error || 'Failed to analyze image');
        retakePhoto();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image. Please try again.');
      retakePhoto();
    } finally {
      setIsLoading(false);
      setAnalysisProgress('');
    }
  };

  // Retake photo / clear upload
  const retakePhoto = async () => {
    setCapturedImage(null);
    
    if (mode === 'camera') {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        setCameraError('Could not restart camera.');
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950" data-testid="camera-scanner">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-emerald-950 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gold font-serif text-lg">
              {mode === 'camera' ? 'Scan Your Watch' : 'Upload Watch Photo'}
            </h2>
            <p className="text-emerald-100/60 text-sm">
              {mode === 'camera' ? 'Position the watch face in the frame' : 'Select a clear photo of your watch'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-emerald-900/80 text-emerald-100/70 hover:bg-emerald-800 transition-colors"
            data-testid="close-camera-btn"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={switchToCamera}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'camera' 
                ? 'bg-gold/20 text-gold border border-gold/40' 
                : 'bg-emerald-900/50 text-emerald-100/60 border border-emerald-800 hover:bg-emerald-900'
            }`}
            data-testid="mode-camera-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            Camera
          </button>
          <button
            onClick={switchToUpload}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              mode === 'upload' 
                ? 'bg-gold/20 text-gold border border-gold/40' 
                : 'bg-emerald-900/50 text-emerald-100/60 border border-emerald-800 hover:bg-emerald-900'
            }`}
            data-testid="mode-upload-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload
          </button>
        </div>
      </div>

      {/* Camera View / Captured Image / Upload Area */}
      <div className="relative h-full flex items-center justify-center pt-32 pb-48">
        {mode === 'camera' && cameraError && !capturedImage ? (
          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-orange-400 mb-4">{cameraError}</p>
            <button
              onClick={switchToUpload}
              className="px-6 py-3 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 border border-gold/40 transition-colors"
            >
              Upload Image Instead
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured watch"
            className="max-h-full max-w-full object-contain rounded-lg"
            data-testid="captured-image"
          />
        ) : mode === 'upload' ? (
          <div className="text-center p-8 w-full max-w-md">
            <label 
              className="block w-full p-12 border-2 border-dashed border-emerald-700 rounded-2xl cursor-pointer hover:border-gold/50 transition-colors group"
              data-testid="upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="file-input"
              />
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-900 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <svg className="w-8 h-8 text-emerald-700 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-emerald-100/60 mb-2">Drop your watch photo here</p>
              <p className="text-emerald-100/40 text-sm">or click to browse</p>
              <p className="text-emerald-100/30 text-xs mt-4">Supports: JPG, PNG, HEIC • Max 10MB</p>
            </label>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
              data-testid="camera-video"
            />
            
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none camera-overlay">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96">
                {/* Viewfinder corners */}
                <div className="viewfinder-corner top-left"></div>
                <div className="viewfinder-corner top-right"></div>
                <div className="viewfinder-corner bottom-left"></div>
                <div className="viewfinder-corner bottom-right"></div>
                
                {/* Scan line */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent scan-line"></div>
              </div>
            </div>
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-emerald-950 to-transparent">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-900/80 rounded-2xl">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gold">{analysisProgress}</span>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={retakePhoto}
              className="px-8 py-4 bg-emerald-900/80 border border-emerald-700 text-emerald-100/70 rounded-2xl hover:bg-emerald-800 transition-colors flex items-center gap-2"
              data-testid="retake-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {mode === 'camera' ? 'Retake' : 'Choose Different'}
            </button>
            <button
              onClick={analyzeImage}
              className="px-8 py-4 btn-gold font-semibold rounded-2xl flex items-center gap-2"
              data-testid="analyze-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Analyze Watch
            </button>
          </div>
        ) : mode === 'camera' && !cameraError ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={captureImage}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-gold to-yellow-600 border-4 border-gold/50 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-gold/30"
              data-testid="capture-btn"
            >
              <div className="w-14 h-14 rounded-full border-2 border-emerald-950/30"></div>
            </button>
            <p className="text-emerald-100/60 text-sm">Tap to capture</p>
          </div>
        ) : null}

        {/* Detection info */}
        <div className="mt-6 text-center">
          <p className="text-emerald-100/40 text-xs">
            Detects: Brand, Model, Dial Color, Bezel, Bracelet
          </p>
          <p className="text-gold/60 text-xs mt-1">
            ⚠️ Does not verify authenticity or determine year
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
