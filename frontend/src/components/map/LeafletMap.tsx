import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertCircle, Info, MapPin, Navigation, Bus as BusIcon, GraduationCap } from 'lucide-react';
import { useTheme } from '@/features/theme/ThemeContext';

// Custom Marker Icons using Leaflet divIcon
export const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="position: absolute; top: 0; left: 0; width: 22px; height: 22px; border-radius: 50%; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(37,99,235,0.7);"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

export const createStopIcon = (order?: number, isBoarding = false) => {
  const bg = isBoarding ? '#2563EB' : '#C06B4A';
  const size = isBoarding ? 32 : 28;
  return L.divIcon({
    className: isBoarding ? 'custom-boarding-stop-marker' : 'custom-stop-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${bg}; border: 2.5px solid #FFFFFF; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: ${isBoarding ? 12 : 11}px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.35); ${isBoarding ? 'outline: 3px solid rgba(37,99,235,0.4);' : ''}">
        ${order !== undefined ? order : '•'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-start-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background-color: #16A34A; border: 3px solid #FFFFFF; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">
        ▶
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const createCollegeIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-college-marker',
    html: `
      <div style="position: relative; min-width: 36px; height: 36px; padding: 0 8px; border-radius: 18px; background-color: #B45309; border: 3px solid #FFFFFF; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; font-weight: bold; box-shadow: 0 2px 10px rgba(180,83,9,0.5);">
        <span>🎓</span>
        ${label ? `<span style="white-space: nowrap; font-size: 11px;">${label}</span>` : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const createBusIcon = (busNumber?: string) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; min-width: 38px; height: 38px; border-radius: 19px; background-color: #D97706; border: 3px solid #FFFFFF; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 3px 12px rgba(217,119,6,0.6); padding: 0 6px;">
        🚌 <span style="margin-left: 2px;">${busNumber || 'Bus'}</span>
      </div>
    `,
    iconSize: [42, 38],
    iconAnchor: [21, 19],
    popupAnchor: [0, -19],
  });
};

// Component to dynamically fit bounds of the entire route
function MapBoundsController({
  stops,
  roadPath,
  center,
}: {
  stops: StopCoordinate[];
  roadPath: [number, number][];
  center: [number, number];
}) {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    const points: [number, number][] = [];
    if (roadPath.length > 0) {
      // Use sampled points from road path for tight fitting
      const step = Math.max(1, Math.floor(roadPath.length / 20));
      for (let i = 0; i < roadPath.length; i += step) {
        points.push(roadPath[i]);
      }
      points.push(roadPath[roadPath.length - 1]);
    } else if (stops.length > 0) {
      stops.forEach(s => points.push([s.lat, s.lng]));
    }

    if (points.length >= 2 && !hasFitRef.current) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        hasFitRef.current = true;
      } catch (err) {
        // Fallback to center
        map.setView(center, 13);
      }
    } else if (points.length === 1 && !hasFitRef.current) {
      map.setView(points[0], 14);
      hasFitRef.current = true;
    }
  }, [stops, roadPath, center, map]);

  return null;
}

export interface StopCoordinate {
  id: string;
  name: string;
  description?: string;
  order?: number;
  time?: string;
  lat: number;
  lng: number;
  landmark?: string;
  isCollege?: boolean;
}

export interface LeafletMapProps {
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  stops?: StopCoordinate[];
  roadPath?: [number, number][];
  busLocation?: { lat: number; lng: number; busNumber?: string; lastUpdated?: string } | null;
  busNumber?: string;
  routeName?: string;
  selectedBoardingStopName?: string;
  selectedBoardingStopId?: string;
  collegeDestination?: { name: string; lat: number; lng: number };
  mapStyle?: 'standard' | 'satellite';
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [17.4206, 78.6565]; // Anurag University Campus coordinates

// In-memory cache for OSRM road geometry
const routeGeometryCache = new Map<string, [number, number][]>();

export const LeafletMap: React.FC<LeafletMapProps> = ({
  userLocation,
  stops = [],
  roadPath: initialRoadPath,
  busLocation,
  busNumber,
  routeName,
  selectedBoardingStopName,
  selectedBoardingStopId,
  collegeDestination,
  mapStyle = 'standard',
  initialCenter,
  initialZoom = 13,
  height = '100%',
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>(initialRoadPath || []);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingFallback, setRoutingFallback] = useState(false);

  // Filter valid stop coordinates strictly
  const validStops = stops.filter(
    stop =>
      typeof stop.lat === 'number' &&
      typeof stop.lng === 'number' &&
      !isNaN(stop.lat) &&
      !isNaN(stop.lng) &&
      (stop.lat !== 0 || stop.lng !== 0) &&
      stop.lat >= -90 &&
      stop.lat <= 90 &&
      stop.lng >= -180 &&
      stop.lng <= 180
  );

  // If college destination is provided and not already in stops, add it to sequence
  const sequencedStops = [...validStops];
  if (collegeDestination && !sequencedStops.some(s => s.isCollege || s.name.toLowerCase().includes('campus') || s.name.toLowerCase().includes('university'))) {
    sequencedStops.push({
      id: 'college-destination-node',
      name: collegeDestination.name,
      order: sequencedStops.length + 1,
      lat: collegeDestination.lat,
      lng: collegeDestination.lng,
      isCollege: true,
      description: 'Destination College Campus',
    });
  }

  // Fetch actual turn-by-turn road geometry along the sequence of stops using OSRM
  useEffect(() => {
    if (initialRoadPath && initialRoadPath.length > 0) {
      setRoadCoordinates(initialRoadPath);
      return;
    }

    if (sequencedStops.length < 2) {
      setRoadCoordinates([]);
      return;
    }

    const coordsKey = sequencedStops.map(s => `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`).join(';');
    if (routeGeometryCache.has(coordsKey)) {
      setRoadCoordinates(routeGeometryCache.get(coordsKey)!);
      setRoutingFallback(false);
      return;
    }

    let isMounted = true;
    setIsRoutingLoading(true);

    const coordinatesParam = sequencedStops.map(s => `${s.lng},${s.lat}`).join(';');
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinatesParam}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then(res => {
        if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.code === 'Ok' && data.routes && data.routes.length > 0 && data.routes[0].geometry) {
          const geojsonCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] // convert [lng, lat] to [lat, lng]
          );
          routeGeometryCache.set(coordsKey, geojsonCoords);
          setRoadCoordinates(geojsonCoords);
          setRoutingFallback(false);
        } else {
          // Fallback to stop waypoints
          setRoutingFallback(true);
          setRoadCoordinates(sequencedStops.map(s => [s.lat, s.lng]));
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('OSRM road routing fallback active:', err.message);
        setRoutingFallback(true);
        setRoadCoordinates(sequencedStops.map(s => [s.lat, s.lng]));
      })
      .finally(() => {
        if (isMounted) setIsRoutingLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stops, collegeDestination]);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : sequencedStops.length > 0
    ? [sequencedStops[0].lat, sequencedStops[0].lng]
    : initialCenter || DEFAULT_CENTER;

  // Select tile URL based on theme and style
  const tileUrl =
    mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution =
    mapStyle === 'satellite'
      ? '&copy; Esri, USGS, NOAA'
      : isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

  return (
    <div style={{ width: '100%', height }} className={`relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 ${className}`}>
      {/* Route Info Badge Overlay */}
      {(busNumber || routeName) && (
        <div className="absolute top-3 left-3 z-[1000] bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 shadow-md flex items-center gap-2.5 text-xs">
          <div className="w-6 h-6 rounded-lg bg-terracotta-500 text-stone-50 flex items-center justify-center font-bold">
            🚌
          </div>
          <div>
            <div className="font-bold text-charcoal-500 dark:text-stone-100 flex items-center gap-1.5">
              <span>{busNumber || 'Assigned Bus'}</span>
              {routeName && <span className="text-stone-400 dark:text-stone-500">• {routeName}</span>}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {routingFallback ? 'Direct connectors' : 'Actual Road Navigation Map'}
            </div>
          </div>
        </div>
      )}

      {/* Fallback Notice if routing engine unavailable */}
      {routingFallback && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Live road routing engine unavailable; displaying waypoint alignment.</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapBoundsController stops={sequencedStops} roadPath={roadCoordinates} center={center} />
        <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />

        {/* Road Path Polylines (Real Street Alignment) */}
        {roadCoordinates.length > 1 && (
          <>
            {/* Outer road border casing for contrast */}
            <Polyline
              positions={roadCoordinates}
              pathOptions={{
                color: isDark ? '#0A0A0A' : '#44403C',
                weight: 8,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main Road Route Ribbon */}
            <Polyline
              positions={roadCoordinates}
              pathOptions={{
                color: '#C06B4A', // Terracotta primary brand color
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
              <Popup>
                <div className="p-1 text-sm font-sans">
                  <div className="font-semibold text-charcoal-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    Your Current Location
                  </div>
                  <div className="text-stone-500 text-xs mt-1 font-mono">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </div>
                  {userLocation.accuracy && (
                    <div className="text-stone-500 text-xs mt-0.5">
                      Accuracy: &plusmn;{Math.round(userLocation.accuracy)}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            {userLocation.accuracy && userLocation.accuracy > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#2563EB',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              />
            )}
          </>
        )}

        {/* Genuine Live Bus GPS Marker (Rendered only when genuine GPS exists) */}
        {busLocation && typeof busLocation.lat === 'number' && typeof busLocation.lng === 'number' && (
          <Marker
            position={[busLocation.lat, busLocation.lng]}
            icon={createBusIcon(busLocation.busNumber || busNumber)}
          >
            <Popup>
              <div className="p-1 text-sm font-sans">
                <div className="font-semibold text-charcoal-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  {busLocation.busNumber || busNumber || 'Bus'} (Live GPS)
                </div>
                {busLocation.lastUpdated && (
                  <div className="text-stone-500 text-xs mt-1">
                    Last signal: {busLocation.lastUpdated}
                  </div>
                )}
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  {busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Stop Markers along the road path */}
        {sequencedStops.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === sequencedStops.length - 1;
          const isSelectedBoarding = Boolean(
            (selectedBoardingStopName && stop.name.toLowerCase().includes(selectedBoardingStopName.toLowerCase())) ||
            (selectedBoardingStopId && stop.id === selectedBoardingStopId)
          );
          const isCollegeStop = stop.isCollege || isLast;

          let icon;
          if (isCollegeStop) {
            icon = createCollegeIcon(stop.name.includes('Campus') ? 'AU Campus' : stop.name);
          } else if (isFirst) {
            icon = createStartIcon();
          } else {
            icon = createStopIcon(stop.order || index + 1, isSelectedBoarding);
          }

          return (
            <Marker key={stop.id || index} position={[stop.lat, stop.lng]} icon={icon}>
              <Popup>
                <div className="p-1 text-sm font-sans min-w-[180px]">
                  <div className="font-semibold text-charcoal-700 flex items-center gap-1.5">
                    {isCollegeStop ? (
                      <span className="text-base">🎓</span>
                    ) : isFirst ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-terracotta-500 inline-block"></span>
                    )}
                    <span>{stop.name}</span>
                  </div>

                  {isSelectedBoarding && (
                    <div className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-800 rounded-full">
                      ✓ Your Assigned Boarding Stop
                    </div>
                  )}

                  {isCollegeStop && (
                    <div className="inline-block mt-1 px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      Destination Campus
                    </div>
                  )}

                  {stop.landmark && (
                    <div className="text-stone-600 text-xs mt-1">
                      Landmark: <span className="font-medium">{stop.landmark}</span>
                    </div>
                  )}

                  {stop.time && (
                    <div className="text-stone-600 text-xs mt-0.5">
                      Scheduled Time: <span className="font-mono font-semibold">{stop.time}</span>
                    </div>
                  )}

                  {stop.description && (
                    <div className="text-stone-500 text-xs mt-1">{stop.description}</div>
                  )}

                  <div className="text-[11px] text-stone-400 font-mono mt-1 pt-1 border-t border-stone-100">
                    {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
