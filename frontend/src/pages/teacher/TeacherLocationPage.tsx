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
  Maximize,
  Minimize,
  Bus,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { LeafletMap, StopCoordinate } from '@/components/map/LeafletMap';
import { api } from '@/services/api';

export function TeacherLocationPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number; timestamp: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // 1. Fetch teacher buses (assigned buses)
  const { data: teacherBuses = [], isLoading: busesLoading } = useQuery({
    queryKey: ['teacher-buses'],
    queryFn: () => api.getTeacherBuses(),
  });

  // 2. Fetch routes so teacher can inspect stops for their assigned route or any route
  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: () => api.getRoutes(),
  });

  const activeRouteId = selectedRouteId || (routes.length > 0 ? routes[0].id : '');

  // 3. Fetch verified stops for selected route
  const { data: stopsData = [], isLoading: stopsLoading } = useQuery({
    queryKey: ['stops', activeRouteId],
    queryFn: async () => {
      let rId = activeRouteId;
      if (!rId) {
        const fetchedRoutes = await api.getRoutes();
        if (fetchedRoutes && fetchedRoutes.length > 0) {
          rId = fetchedRoutes[0].id;
        }
      }
      return rId ? api.getStops(rId) : [];
    },
  });

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
        let msg = 'Failed to get location';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied by user or browser.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable.';
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported');
      return;
    }
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
        let msg = 'Failed to watch location';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied';
          stopWatching();
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable';
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
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Live Location &amp; Bus Fleet</h1>
        <p className="text-stone-600 mt-1">
          Monitor route stops and your device location for transit duty.
        </p>
      </div>

      {/* Hardware Telemetry Notice */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <Satellite className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-950">Bus Hardware GPS Status</p>
          <p className="text-amber-800 mt-0.5">
            Automated bus tracking requires active vehicle telematics (OBD-II / GPS hardware units).
            No synthetic positions or simulated movement are generated. Only verified stops and explicit device GPS coordinates are shown on the map below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Map */}
        <div className={`lg:col-span-2 ${fullscreen ? 'fixed inset-0 z-50 p-4 bg-black/75 flex flex-col' : ''}`}>
          <Card
            className={`overflow-hidden relative flex flex-col ${
              fullscreen ? 'h-full w-full' : 'h-[500px] lg:h-[620px]'
            }`}
            padding="none"
          >
            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-wrap gap-2 items-center bg-white/95 p-2 rounded-xl shadow-md border border-stone-200 backdrop-blur-sm">
              <select
                aria-label="Route Selection"
                value={activeRouteId}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-700"
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
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-700"
              >
                <option value="standard">Standard (OSM)</option>
                <option value="satellite">Satellite (Esri)</option>
              </select>

              <button
                type="button"
                onClick={() => setFullscreen(!fullscreen)}
                className="p-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
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
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 px-3 py-1.5 rounded-lg shadow border border-stone-200 text-xs text-stone-700 font-medium flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-terracotta-500" />
              <span>
                {stopsLoading
                  ? 'Loading stops...'
                  : `${genuineStops.length} verified stop${genuineStops.length === 1 ? '' : 's'} on route`}
              </span>
            </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Teacher Device Location Card */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-terracotta-500" />
              Teacher Device Location
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
                  <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                    <p className="text-[11px] text-stone-500 uppercase tracking-wide">Latitude</p>
                    <p className="font-mono text-sm font-bold text-charcoal-500 mt-0.5">{location.lat.toFixed(5)}</p>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                    <p className="text-[11px] text-stone-500 uppercase tracking-wide">Longitude</p>
                    <p className="font-mono text-sm font-bold text-charcoal-500 mt-0.5">{location.lng.toFixed(5)}</p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 flex justify-between items-center text-xs">
                  <span className="text-stone-500">Accuracy</span>
                  <span className="font-mono font-semibold text-charcoal-500">
                    &plusmn;{Math.round(location.accuracy)} meters
                  </span>
                </div>

                <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 flex justify-between items-center text-xs">
                  <span className="text-stone-500">Last Checked</span>
                  <span className="font-mono font-semibold text-charcoal-500">
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
                <MapPin className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-600 text-sm mb-4">
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

          {/* Assigned Buses Status */}
          <Card padding="lg">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-3 flex items-center gap-2">
              <Bus className="h-5 w-5 text-terracotta-500" />
              Your Assigned Buses
            </h3>

            {busesLoading ? (
              <div className="flex items-center justify-center py-6 text-stone-500 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-terracotta-500" />
                <span>Loading assigned buses...</span>
              </div>
            ) : teacherBuses.length === 0 ? (
              <div className="text-center py-6 text-stone-500 text-sm">
                No buses are currently assigned to your teacher account.
              </div>
            ) : (
              <div className="space-y-3">
                {teacherBuses.map((bus: any) => (
                  <div
                    key={bus.id}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-terracotta-100 flex items-center justify-center text-terracotta-600 shrink-0">
                        <Bus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal-500 font-mono text-sm">{bus.registrationNumber}</p>
                        <p className="text-stone-500 text-[11px]">
                          {bus.route ? bus.route.routeCode : 'No route assigned'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={bus.active ? 'success' : 'secondary'} size="sm">
                      {bus.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Privacy & Guardrails */}
          <Card padding="md">
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-charcoal-500">Teacher Location Security</p>
                <p className="mt-0.5 text-stone-500 leading-relaxed">
                  Your coordinates remain on your device and are not published or stored on the central database without authorized route-assignment session activation.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}