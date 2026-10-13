import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw,
  Phone, 
  Users, 
  MapPin, 
  Bus as BusIcon,
  X,
  SwitchCamera
} from 'lucide-react';
import jsQR from 'jsqr';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';

interface BusDetails {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  model?: string;
  fuelType?: string;
  driverName?: string;
  driverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  currentStudentsCount?: number;
  availableCapacity?: number;
  active: boolean;
  verified?: boolean;
  assignedRoute?: {
    id: string;
    routeCode: string;
    routeName: string;
    direction: string;
  };
}

interface BusQRScannerProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function BusQRScanner({ onClose, isModal = false }: BusQRScannerProps) {
  const [mode, setMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isVerifyingRef = useRef(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Parse supported QR payload formats
  const parseQRPayload = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';

    // Check JSON payload
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj.registrationNumber) return String(obj.registrationNumber).trim();
        if (obj.busId) return String(obj.busId).trim();
        if (obj.busNumber) return String(obj.busNumber).trim();
        if (obj.code) return String(obj.code).trim();
      } catch {
        // Fallback to string handling
      }
    }

    // Check URL format e.g. https://smartroute.anurag.edu.in/buses/verify/TS08UB1001
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          return pathSegments[pathSegments.length - 1];
        }
      } catch {
        // Ignore URL parse error
      }
    }

    // Check SMARTROUTE:BUS:PREFIX
    if (trimmed.toUpperCase().startsWith('SMARTROUTE:BUS:')) {
      return trimmed.substring(15).trim();
    }

    return trimmed;
  };

  // Perform backend verification against real database records
  const handleVerify = useCallback(async (code: string) => {
    const parsed = parseQRPayload(code);
    if (!parsed) {
      setError('Please enter or scan a valid bus QR code.');
      return;
    }

    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    setIsLoading(true);
    setError(null);
    setBusDetails(null);
    stopCamera();

    try {
      const data = await api.verifyBus(parsed);
      setBusDetails(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unregistered or invalid bus code.';
      setError(message);
    } finally {
      setIsLoading(false);
      isVerifyingRef.current = false;
    }
  }, [stopCamera]);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Frame scanning loop using jsQR and Native BarcodeDetector fallback
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isVerifyingRef.current) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleVerify(code.data);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleVerify]);

  // Camera start lifecycle
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported on this browser or connection. Please use manual lookup.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        // Fallback without width/height constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      let friendlyError = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyError = 'Camera permission was denied. Please allow camera permissions in your browser or enter the code manually.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyError = 'No camera device found on this system. Please use manual vehicle lookup.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyError = 'Camera is currently in use by another application. Please close other camera apps and retry.';
      } else if (err.message) {
        friendlyError = err.message;
      }
      setCameraError(friendlyError);
      setCameraActive(false);
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Mode management & cleanup on unmount
  useEffect(() => {
    if (mode === 'camera' && !busDetails) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, facingMode, busDetails, startCamera, stopCamera]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Image Upload handler with jsQR decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            handleVerify(code.data);
            return;
          }
        }

        // Secondary fallback: check registration number regex in filename
        const match = file.name.match(/(?:TS|AP|TG)[0-9]{2}[A-Z]{1,2}[0-9]{4}/i);
        if (match) {
          handleVerify(match[0]);
        } else {
          setIsLoading(false);
          setError('No valid QR code detected in this image. Please ensure the QR code is clearly visible or enter the plate number manually.');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setBusDetails(null);
    setError(null);
    setManualCode('');
    isVerifyingRef.current = false;
    if (mode === 'camera') {
      startCamera();
    }
  };

  const sampleBuses = [
    { label: 'Bus 28 (AP24TA3222)', code: 'AP24TA3222' },
    { label: 'Bus 01 (TS08UB1001)', code: 'TS08UB1001' },
    { label: 'Bus 39 (TS08UK3904)', code: 'TS08UK3904' },
    { label: 'Unregistered Vehicle', code: 'KA01XX9999' },
  ];

  return (
    <div className={`bg-white dark:bg-[#182235] rounded-2xl shadow-sm border border-stone-200 dark:border-slate-700 overflow-hidden ${isModal ? 'max-w-xl w-full mx-auto' : 'w-full'}`}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="bg-charcoal-500 dark:bg-[#111827] text-white p-5 flex items-center justify-between border-b dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terracotta-500 dark:bg-blue-600 rounded-lg text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-white">Bus QR Scanner</h2>
            <p className="text-xs text-stone-300 dark:text-slate-400">Verify official Anurag University transport vehicles</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-charcoal-600 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Verification Result Display */}
        {busDetails && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Verified Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-base">VERIFIED ANURAG UNIVERSITY BUS</span>
                  <span className="bg-emerald-600 dark:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Official Fleet</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Authenticated vehicle registered in the official Anurag University transport fleet.
                </p>
              </div>
            </div>

            {/* Bus Info Card */}
            <div className="bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-[#182235] border border-stone-200 dark:border-slate-700 rounded-lg text-charcoal-500 dark:text-slate-100">
                    <BusIcon className="w-6 h-6 text-terracotta-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-charcoal-500 dark:text-slate-100">
                      {busDetails.busNumber || 'University Bus'}
                    </h3>
                    <p className="text-sm font-mono font-semibold text-stone-600 dark:text-slate-300">
                      {busDetails.registrationNumber}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  busDetails.active ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}>
                  {busDetails.active ? 'Active & Ready' : 'Inactive'}
                </span>
              </div>

              {/* Assigned Route */}
              {busDetails.assignedRoute && (
                <div className="bg-white dark:bg-[#182235] p-3.5 rounded-lg border border-stone-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-500 dark:text-blue-400" />
                    <span>ASSIGNED ROUTE</span>
                  </div>
                  <p className="font-medium text-sm text-charcoal-500 dark:text-slate-200">
                    <span className="font-bold text-terracotta-600 dark:text-blue-400 mr-2">{busDetails.assignedRoute.routeCode}</span>
                    {busDetails.assignedRoute.routeName}
                  </p>
                </div>
              )}

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {/* Driver */}
                <div className="bg-white dark:bg-[#182235] p-3 rounded-lg border border-stone-200 dark:border-slate-700">
                  <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">Driver</p>
                  <p className="font-semibold text-charcoal-500 dark:text-slate-100 mt-0.5">{busDetails.driverName || 'Assigned Driver'}</p>
                  {busDetails.driverPhone && (
                    <a href={`tel:${busDetails.driverPhone}`} className="inline-flex items-center gap-1 text-xs text-terracotta-600 dark:text-blue-400 hover:underline mt-1 font-medium">
                      <Phone className="w-3 h-3" /> {busDetails.driverPhone}
                    </a>
                  )}
                </div>

                {/* Conductor */}
                <div className="bg-white dark:bg-[#182235] p-3 rounded-lg border border-stone-200 dark:border-slate-700">
                  <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">Conductor</p>
                  <p className="font-semibold text-charcoal-500 dark:text-slate-100 mt-0.5">{busDetails.conductorName || 'Assigned Staff'}</p>
                  {busDetails.conductorPhone && (
                    <a href={`tel:${busDetails.conductorPhone}`} className="inline-flex items-center gap-1 text-xs text-terracotta-600 dark:text-blue-400 hover:underline mt-1 font-medium">
                      <Phone className="w-3 h-3" /> {busDetails.conductorPhone}
                    </a>
                  )}
                </div>

                {/* Capacity */}
                <div className="bg-white dark:bg-[#182235] p-3 rounded-lg border border-stone-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 font-medium">
                    <span>Capacity & Seats</span>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <p className="font-semibold text-charcoal-500 dark:text-slate-100 mt-0.5">
                    {busDetails.capacity} Total Seats
                  </p>
                  {busDetails.currentStudentsCount !== undefined && (
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                      {busDetails.currentStudentsCount} occupied · {busDetails.capacity - (busDetails.currentStudentsCount || 0)} available
                    </p>
                  )}
                </div>

                {/* Vehicle Specs */}
                <div className="bg-white dark:bg-[#182235] p-3 rounded-lg border border-stone-200 dark:border-slate-700">
                  <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">Vehicle Specs</p>
                  <p className="font-semibold text-charcoal-500 dark:text-slate-100 mt-0.5">{busDetails.model || 'College Transport'}</p>
                  {busDetails.fuelType && (
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-medium">{busDetails.fuelType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="primary" className="w-full flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Scan Another Bus
              </Button>
            </div>
          </div>
        )}

        {/* Unverified / Error State */}
        {error && !busDetails && (
          <div className="space-y-4 mb-5">
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-rose-900 dark:text-rose-200 text-sm">UNREGISTERED OR INVALID VEHICLE</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
                <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold mt-2">
                  Caution: Do not board unauthorized vehicles. If in doubt, please contact the campus security or transport desk.
                </p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </Button>
          </div>
        )}

        {/* Scanner Viewport and Controls */}
        {!busDetails && (
          <div>
            {/* Mode Selector Tabs */}
            <div className="flex border-b border-stone-200 dark:border-slate-800 mb-5">
              <button
                onClick={() => setMode('camera')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  mode === 'camera' 
                    ? 'border-terracotta-500 dark:border-blue-400 text-terracotta-600 dark:text-blue-400' 
                    : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
                }`}
              >
                <Camera className="w-4 h-4" /> Live Camera
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  mode === 'upload' 
                    ? 'border-terracotta-500 dark:border-blue-400 text-terracotta-600 dark:text-blue-400' 
                    : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload QR
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  mode === 'manual' 
                    ? 'border-terracotta-500 dark:border-blue-400 text-terracotta-600 dark:text-blue-400' 
                    : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200'
                }`}
              >
                <Search className="w-4 h-4" /> Enter Code
              </button>
            </div>

            {/* Mode 1: Camera Scanner */}
            {mode === 'camera' && (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    playsInline 
                    muted 
                  />

                  {/* Scanning Crosshair Overlay */}
                  <div className="absolute inset-0 border border-white/10 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-terracotta-400 dark:border-stone-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-terracotta-400/80 dark:bg-stone-300/80 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Switch Camera Button (Mobile) */}
                  {hasMultipleCameras && cameraActive && (
                    <button
                      onClick={toggleFacingMode}
                      className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full border border-white/20 shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold"
                      title="Switch camera"
                    >
                      <SwitchCamera className="w-4 h-4" />
                      <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
                    </button>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 bg-stone-900/90 p-6 flex flex-col items-center justify-center text-center text-white">
                      <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
                      <p className="text-xs text-stone-200 mb-3 max-w-sm leading-relaxed">{cameraError}</p>
                      <div className="flex gap-2">
                        <Button onClick={startCamera} size="sm" variant="outline" className="bg-white/10 text-white border-white/20">
                          Retry Camera
                        </Button>
                        <Button onClick={() => setMode('manual')} size="sm" variant="primary">
                          Manual Entry
                        </Button>
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="absolute inset-0 bg-stone-900/80 flex flex-col items-center justify-center text-white">
                      <RefreshCw className="w-8 h-8 text-terracotta-400 animate-spin mb-2" />
                      <p className="text-xs font-semibold">Verifying against fleet database...</p>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-stone-500 dark:text-slate-400">
                  Point your camera at the QR code displayed on the bus windshield or side entry.
                </p>
              </div>
            )}

            {/* Mode 2: Upload Image */}
            {mode === 'upload' && (
              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-terracotta-400 dark:hover:border-blue-400 hover:bg-stone-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-full text-stone-600 dark:text-slate-300 mb-3">
                    <Upload className="w-6 h-6 text-terracotta-500 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-semibold text-charcoal-500 dark:text-slate-100">Click to upload bus QR photo</p>
                  <p className="text-xs text-stone-400 dark:text-slate-400 mt-1">Supports PNG, JPG, WEBP, or screenshot</p>
                </div>
              </div>
            )}

            {/* Mode 3: Manual Code Entry */}
            <div className="mt-5 pt-5 border-t border-stone-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-stone-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Quick Plate or Bus Number Lookup
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AP24TA3222 or Bus 28"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify(manualCode)}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500 dark:focus:ring-blue-400"
                />
                <Button 
                  onClick={() => handleVerify(manualCode)} 
                  disabled={isLoading || !manualCode.trim()} 
                  variant="primary"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>

              {/* Quick Test Chips */}
              <div className="mt-3">
                <p className="text-[11px] font-medium text-stone-400 dark:text-slate-400 mb-1.5">Quick Test Registered Buses:</p>
                <div className="flex flex-wrap gap-1.5">
                  {sampleBuses.map((bus) => (
                    <button
                      key={bus.code}
                      onClick={() => {
                        setManualCode(bus.code);
                        handleVerify(bus.code);
                      }}
                      className="px-2.5 py-1 text-xs rounded-md bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 font-medium transition-colors"
                    >
                      {bus.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
