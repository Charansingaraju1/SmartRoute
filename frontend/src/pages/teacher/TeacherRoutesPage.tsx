import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Bus, ChevronDown, ChevronUp, Filter, Map as MapIcon, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Route {
  id: string;
  zone: { id: string; name: string; code: string };
  routeCode: string;
  routeName?: string;
  direction: 'MORNING' | 'EVENING';
  startingPoint?: string;
  startingTime?: string;
  endingPoint?: string;
  endingTime?: string;
  description?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  feeAmount?: number;
  active: boolean;
  displayOrder: number;
  bus?: { id: string; registrationNumber: string; capacity: number; currentStudentsCount: number };
  boardingPoints?: Array<{ id: string; stopName: string; stopTime?: string; stopOrder: number; landmark?: string }>;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

function RouteCard({ route, isExpanded, onToggle }: { route: Route; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card key={route.id} padding="md" className="overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0">
            <Bus className="h-6 w-6 text-terracotta-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-lg font-bold text-charcoal-500">{route.routeCode}</span>
              <Badge variant={route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                {route.direction === 'MORNING' ? 'Morning' : 'Evening'}
              </Badge>
              <Badge variant={route.active ? 'success' : 'danger'} size="sm">
                {route.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <h3 className="font-heading text-lg font-medium text-charcoal-500 truncate">
              {route.routeName || 'Unnamed Route'}
            </h3>
            <p className="text-sm text-stone-500 truncate">{route.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-stone-600 ml-4">
          {route.startingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {route.startingTime}
            </span>
          )}
          {route.bus && (
            <span className="flex items-center gap-1">
              <Bus className="h-4 w-4" />
              {route.bus.registrationNumber}
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 transition-colors ml-4"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse route details' : 'Expand route details'}
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Distance</p>
              <p className="font-mono text-lg font-bold text-charcoal-500">{route.distanceKm || '—'} km</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Duration</p>
              <p className="font-mono text-lg font-bold text-charcoal-500">{route.estimatedDurationMinutes || '—'} min</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Fee</p>
              <p className="font-mono text-lg font-bold text-terracotta-600">₹{route.feeAmount || 0}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Zone</p>
              <p className="font-medium text-charcoal-500">{route.zone?.name || 'Unknown'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Starting Point</p>
              {route.startingPoint && (
                <>
                  <p className="font-medium text-charcoal-500">{route.startingPoint}</p>
                  {route.startingTime && <p className="text-sm text-stone-500 mt-1 font-mono">{route.startingTime}</p>}
                </>
              )}
              {!route.startingPoint && <p className="text-stone-500">Not specified</p>}
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Destination</p>
              {route.endingPoint && (
                <>
                  <p className="font-medium text-charcoal-500">{route.endingPoint}</p>
                  {route.endingTime && <p className="text-sm text-stone-500 mt-1 font-mono">{route.endingTime}</p>}
                </>
              )}
              {!route.endingPoint && <p className="text-stone-500">Not specified</p>}
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <h4 className="font-medium text-charcoal-500 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-terracotta-500" />
              Boarding Points ({route.boardingPoints?.length || 0})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                    <th className="pb-2 font-medium w-12">#</th>
                    <th className="pb-2 font-medium">Stop Name</th>
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Landmark</th>
                  </tr>
                </thead>
                <tbody>
                  {route.boardingPoints?.sort((a, b) => a.stopOrder - b.stopOrder).slice(0, 15).map((stop) => (
                    <tr key={stop.id} className="border-b border-stone-100 last:border-0">
                      <td className="py-2 text-stone-500">{stop.stopOrder}</td>
                      <td className="py-2 font-medium text-charcoal-500">{stop.stopName}</td>
                      <td className="py-2 text-stone-600">
                        {stop.stopTime ? <span className="font-mono">{stop.stopTime}</span> : <span className="text-stone-400">—</span>}
                      </td>
                      <td className="py-2 text-stone-500">{stop.landmark || '—'}</td>
                    </tr>
                  ))}
                  {route.boardingPoints && route.boardingPoints.length > 15 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-stone-500">
                        + {route.boardingPoints.length - 15} more stops
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium flex items-center gap-2">
                <ChevronDown className="h-4 w-4" /> View Details
              </button>
              <button className="px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors text-sm font-medium flex items-center gap-2">
                <Bus className="h-4 w-4" /> View Bus
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function TeacherRoutesPage() {
  const [selectedZone, setSelectedZone] = useState<'all' | string>('all');
  const [selectedDirection, setSelectedDirection] = useState<'all' | 'MORNING' | 'EVENING'>('all');
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const { data: routes, isLoading, error } = useQuery({
    queryKey: ['teacher-routes'],
    queryFn: () => api.getRoutes(),
  });

  const routesData = routes || [];

  const filteredRoutesData = routesData.filter((route: { zone?: { id: string } | null; direction: string }) => {
    if (selectedZone !== 'all' && route.zone?.id !== selectedZone) return false;
    if (selectedDirection !== 'all' && route.direction !== selectedDirection) return false;
    return true;
  });

  const zoneMap = new Map<string, { id: string; name: string; code: string }>();
  routesData.forEach(r => {
    if (r.zone?.id && r.zone) zoneMap.set(r.zone.id, r.zone);
  });
  const zones = Array.from(zoneMap.values()) as Array<{ id: string; name: string; code: string }>;

  const groupedRoutes = filteredRoutesData.reduce((acc: Record<string, Route[]>, route: Route) => {
    const zoneName = route.zone?.name || 'Unknown Zone';
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(route);
    return acc;
  }, {} as Record<string, Route[]>);

  const toggleRoute = (routeId: string) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(routeId)) next.delete(routeId);
      else next.add(routeId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-6 h-6" style={{ border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load routes</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Route Management</h1>
        <p className="text-stone-600 mt-1">View and manage all university transport routes.</p>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none appearance-none"
            >
              <option value="all">All Zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name} ({zone.code})</option>
              ))}
            </select>
          </div>
          <select
            value={selectedDirection}
            onChange={e => setSelectedDirection(e.target.value as 'all' | 'MORNING' | 'EVENING')}
            className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
          >
            <option value="all">All Directions</option>
            <option value="MORNING">Morning (Home → College)</option>
            <option value="EVENING">Evening (College → Home)</option>
          </select>
        </div>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {Object.keys(groupedRoutes).length === 0 ? (
        <Card className="text-center py-12">
          <MapIcon className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No routes found</h3>
          <p className="text-stone-500">Try adjusting your filters.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRoutes as Record<string, Route[]>).map(([zoneName, zoneRoutes]) => (
            <div key={zoneName} className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-terracotta-500" />
                {zoneName} ({zoneRoutes.length} routes)
              </h2>
              <div className="space-y-4">
                {zoneRoutes.map(route => {
                  const isExpanded = expandedRoutes.has(route.id);
                  return (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRoute(route.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}