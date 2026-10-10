import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Map, MapPin, Target, Loader2, Shield, AlertCircle, Satellite, Layers, Maximize, Minimize, Truck, Bus, Clock, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function StudentGPSPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number; timestamp: number } | null>(null);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [showRoute, setShowRoute] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showStops, setShowStops] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      err => {
        let msg = 'Failed to get location';
        if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied';
        else if (err.code === err.TIMEOUT) msg = 'Location request timed out';
        else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable';
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }
    setError(null);
    const id = navigator.geolocation.watchPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      err => {
        let msg = 'Failed to watch location';
        if (err.code === err.PERMISSION_DENIED) msg = 'Location permission denied';
        else if (err.code === err.TIMEOUT) msg = 'Location request timed out';
        else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable';
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    setWatchId(id);
    setWatching(true);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
    }
  };

  useEffect(() => {
    getLocation();
    return () => stopWatching();
  }, []);

  if (!location && error) {
    return (
      <div className="container-app py-12">
        <Card className="max-w-2xl mx-auto text-center py-12" padding="lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-red-700 mb-2">Location Unavailable</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={getLocation} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors">
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Live Location</h1>
        <p className="text-stone-600 mt-1">Track your location and bus in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden h-[500px] lg:h-[600px]" padding="none">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2" style={{ pointerEvents: 'none' }}>
              <div style={{ pointerEvents: 'auto' }}>
                <select
                  value={mapStyle}
                  onChange={e => setMapStyle(e.target.value as 'standard' | 'satellite')}
                  className="px-3 py-1.5 bg-white/90 border border-stone-200 rounded-lg text-sm text-stone-700 backdrop-blur-sm"
                  style={{ pointerEvents: 'auto' }}
                >
                  <option value="standard">Standard</option>
                  <option value="satellite">Satellite</option>
                </select>
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-stone-200 rounded-lg text-sm text-stone-700 backdrop-blur-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRoute}
                    onChange={e => setShowRoute(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                  />
                  Show Route
                </label>
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-stone-200 rounded-lg text-sm text-stone-700 backdrop-blur-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBuses}
                    onChange={e => setShowBuses(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                  />
                  Show Buses
                </label>
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-stone-200 rounded-lg text-sm text-stone-700 backdrop-blur-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStops}
                    onChange={e => setShowStops(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                  />
                  Show Stops
                </label>
              </div>
              <div style={{ pointerEvents: 'auto' }}>
                <button
                  onClick={() => setFullscreen(!fullscreen)}
                  className="px-3 py-1.5 bg-white/90 border border-stone-200 rounded-lg text-sm text-stone-700 backdrop-blur-sm hover:bg-stone-100"
                >
                  {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div
              className="w-full h-full relative"
              style={{ backgroundColor: '#f5f5f4' }}
            >
              {location ? (
                <div className="absolute inset-0" style={{
                  backgroundImage: mapStyle === 'satellite'
                    ? 'url("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}")'
                    : 'url("https://tile.openstreetmap.org/{z}/{x}/{y}.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg" />
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[${location?.accuracy || 20}px] h-[${location?.accuracy || 20}px] rounded-full bg-red-500/20 border border-red-500/50 pointer-events-none`}
                  />
                </div>
              ) : (
                <div className="absolute inset-0" style={{
                  backgroundImage: mapStyle === 'satellite'
                    ? 'url("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}")'
                    : 'url("https://tile.openstreetmap.org/{z}/{x}/{y}.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Your Location
            </h3>
            {location ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Latitude</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500">{location.lat.toFixed(6)}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Longitude</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500">{location.lng.toFixed(6)}</p>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Accuracy</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500">±{Math.round(location.accuracy)} meters</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Last Updated</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={getLocation} className="flex-1 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Refresh Location
                  </button>
                  <button onClick={watching ? stopWatching : startWatching} className="flex-1 px-4 py-2.5 bg-stone-500 text-stone-50 rounded-lg font-medium hover:bg-stone-600 transition-colors flex items-center justify-center gap-2">
                    {watching ? <span className="h-4 w-4 animate-spin">🔄</span> : <span>📍</span>}
                    {watching ? 'Stop Tracking' : 'Start Tracking'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">Location Unavailable</h3>
                <p className="text-stone-500 mb-6">Click the button below to get your current location.</p>
                <button onClick={getLocation} className="px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2 mx-auto">
                  <MapPin className="h-5 w-5" />
                  Get My Location
                </button>
              </div>
            )}
          </Card>

          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Satellite className="h-5 w-5 text-terracotta-500" />
              Nearby Stops
            </h3>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 mb-4">Nearby bus stops will appear here when location is available.</p>
              <button className="px-4 py-2 bg-terracotta-100 text-terracotta-700 rounded-lg text-sm font-medium hover:bg-terracotta-200">
                Enable Location to See Nearby Stops
              </button>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Privacy & Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-500">Location Privacy</p>
                  <p className="text-sm text-stone-500">Your location is only shared with authorized transport staff when you have an active bus assignment.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-500">Data Retention</p>
                  <p className="text-sm text-stone-500">Location data is automatically deleted after 30 days. You can request deletion anytime.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Maximize className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-500">Control</p>
                  <p className="text-sm text-stone-500">You can stop location sharing anytime. Emergency SOS always includes your location if enabled.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}