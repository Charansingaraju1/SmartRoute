import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Loader2,
  Shield,
  AlertCircle,
  Satellite,
  Layers,
  Maximize,
  Minimize,
  Bus,
  Clock,
  Compass,
} from 'lucide-react';
import { LeafletMap, StopCoordinate } from '@/components/map/LeafletMap';
import { api } from '@/services/api';

export function StudentGPSPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number; timestamp: number } | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [locating, setLocating] = useState(false);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // 1. Fetch available routes
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => api.getRoutes(),
  });

  const routeIdToLoad = selectedRouteId || (routes && routes.length > 0 ? routes[0].id : '');

  // 2. Fetch official stops with trusted coordinates for selected route
  const { data: stopsData = [], isLoading: stopsLoading } = useQuery({
    queryKey: ['stops', routeIdToLoad],
    queryFn: () => (routeIdToLoad ? api.getStops(routeIdToLoad) : Promise.resolve([])),
    enabled: Boolean(routeIdToLoad),
  });

  // Filter only stops with genuine, valid latitude and longitude coordinates from the backend
  const genuineStops: StopCoordinate[] = stopsData
    .filter((s: any) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map((s: any) => ({
      id: s.id,
      name: s.stopName,
      description: s.stopDescription,
      order: s.stopOrder,
      time: s.stopTime,
      lat: Number(s.latitude),
      lng: Number(s.longitude),
      landmark: s.landmark,
    }));

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setPermissionRequested(true);
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLocating(false);
        setGeoError(null);
      },
      err => {
        setLocating(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access was denied. Please allow location permissions in your browser to view your live position.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please check your network and GPS signal.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable from your device.';
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setPermissionRequested(true);
    setGeoError(null);
    setWatching(true);

    const id = navigator.geolocation.watchPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setGeoError(null);
      },
      err => {
        let msg = 'Unable to track location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access was denied.';
          stopWatching();
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location tracking timed out.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal is unavailable.';
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Live Location &amp; Route Stops</h1>
        <p className="text-stone-600 mt-1">
          Inspect official route stops and view your device position on the campus transit map.
        </p>
      </div>

      {/* Honest Hardware Telemetry Notice */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Satellite className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-950 dark:text-amber-300">Live Bus Telemetry Notice</p>
          <p className="text-amber-800 dark:text-amber-200/90 mt-0.5">
            Real-time bus tracking is currently <strong>unavailable</strong> pending onboard vehicle OBD-II/GPS hardware integration.
            Scheduled route stops and official boarding point coordinates are displayed directly from university transit data below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Map Container */}
        <div className={`lg:col-span-2 ${fullscreen ? 'fixed inset-0 z-50 p-4 bg-black/75 flex flex-col' : ''}`}>
          <Card
            className={`overflow-hidden relative flex flex-col ${
              fullscreen ? 'h-full w-full' : 'h-[500px] lg:h-[620px]'
            }`}
            padding="none"
          >
            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-wrap gap-2 items-center bg-white/95 dark:bg-[#182235]/95 p-2 rounded-xl shadow-md border border-stone-200 dark:border-slate-700 backdrop-blur-sm">
              <select
                aria-label="Route Selection"
                value={routeIdToLoad}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 dark:bg-[#111827] border border-stone-300 dark:border-slate-700 rounded-lg text-xs font-medium text-stone-700 dark:text-[#F1F5F9]"
              >
                {routes.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.routeCode}: {r.routeName}
                  </option>
                ))}
              </select>

              <select
                aria-label="Map Style"
                value={mapStyle}
                onChange={e => setMapStyle(e.target.value as 'standard' | 'satellite')}
                className="px-2.5 py-1.5 bg-stone-50 dark:bg-[#111827] border border-stone-300 dark:border-slate-700 rounded-lg text-xs font-medium text-stone-700 dark:text-[#F1F5F9]"
              >
                <option value="standard">Standard (OSM)</option>
                <option value="satellite">Satellite (Esri)</option>
              </select>

              <button
                type="button"
                onClick={() => setFullscreen(!fullscreen)}
                className="p-1.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-[#F1F5F9] transition-colors"
                title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>

            {/* Functional Leaflet Map */}
            <LeafletMap
              userLocation={location}
              stops={genuineStops}
              mapStyle={mapStyle}
              height="100%"
            />

            {/* Stop Count Pill Overlay at Bottom Left */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-[#182235]/95 px-3 py-1.5 rounded-lg shadow border border-stone-200 dark:border-slate-700 text-xs text-stone-700 dark:text-[#F1F5F9] font-medium flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-terracotta-500" />
              <span>
                {stopsLoading
                  ? 'Loading stops...'
                  : `${genuineStops.length} verified stop${genuineStops.length === 1 ? '' : 's'} on route`}
              </span>
            </div>
          </Card>
        </div>

        {/* Sidebar Controls and Privacy Cards */}
        <div className="space-y-6">
          {/* User Location Control Card */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-terracotta-500" />
              Device Location
            </h3>

            {geoError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {location ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 dark:bg-[#111827] rounded-lg p-3 border border-stone-200 dark:border-slate-800">
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide">Latitude</p>
                    <p className="font-mono text-sm font-bold text-charcoal-500 dark:text-[#F1F5F9] mt-0.5">{location.lat.toFixed(5)}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-[#111827] rounded-lg p-3 border border-stone-200 dark:border-slate-800">
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 uppercase tracking-wide">Longitude</p>
                    <p className="font-mono text-sm font-bold text-charcoal-500 dark:text-[#F1F5F9] mt-0.5">{location.lng.toFixed(5)}</p>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-[#111827] rounded-lg p-3 border border-stone-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-stone-500 dark:text-slate-400">Accuracy</span>
                  <span className="font-mono font-semibold text-charcoal-500 dark:text-[#F1F5F9]">
                    &plusmn;{Math.round(location.accuracy)} meters
                  </span>
                </div>

                <div className="bg-stone-50 dark:bg-[#111827] rounded-lg p-3 border border-stone-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-stone-500 dark:text-slate-400">Last Checked</span>
                  <span className="font-mono font-semibold text-charcoal-500 dark:text-[#F1F5F9]">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={locating}
                    className="flex-1 px-3 py-2 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={watching ? stopWatching : startWatching}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      watching
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-stone-600 text-white hover:bg-stone-700'
                    }`}
                  >
                    {watching ? 'Stop Live GPS' : 'Follow Live GPS'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin className="h-10 w-10 text-stone-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-stone-600 dark:text-slate-400 text-sm mb-4">
                  Enable device location to view your position relative to bus stops on the map.
                </p>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                  className="w-full px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {locating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting Permission...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Locate My Device
                    </>
                  )}
                </button>
              </div>
            )}
          </Card>

          {/* Genuine Verified Stops List */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-terracotta-500" />
              Verified Stops on Route
            </h3>

            {stopsLoading ? (
              <div className="flex items-center justify-center py-6 text-stone-500 dark:text-slate-400 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-terracotta-500" />
                <span>Loading route stops...</span>
              </div>
            ) : genuineStops.length === 0 ? (
              <div className="text-center py-6 text-stone-500 dark:text-slate-400 text-sm">
                No stops with verified geographic coordinates exist for this route.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {genuineStops.map(stop => (
                  <div
                    key={stop.id}
                    className="p-2.5 rounded-lg border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-[#111827] text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-charcoal-500 dark:text-[#F1F5F9] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-terracotta-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {stop.order ?? '•'}
                        </span>
                        <span>{stop.name}</span>
                      </div>
                      {stop.landmark && <div className="text-stone-500 dark:text-slate-400 mt-0.5">{stop.landmark}</div>}
                    </div>
                    {stop.time && (
                      <span className="font-mono text-stone-600 dark:text-slate-300 shrink-0 bg-stone-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        {stop.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Privacy & Location Guardrails Notice */}
          <Card padding="md">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-charcoal-500">Location Privacy Guarantee</p>
                <p className="mt-0.5 text-stone-500 leading-relaxed">
                  Your device location is processed locally in your browser. Coordinates are not sent to any central server or shared with other passengers without explicit authorization.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}