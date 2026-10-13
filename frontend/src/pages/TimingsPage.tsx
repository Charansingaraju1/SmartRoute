import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Bus, Calendar, Sunrise, Sunset, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Route as RouteType, BoardingPoint } from '@/types/transport';

export function TimingsPage() {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError('Failed to load route timings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const routeList = Array.isArray(routes) ? routes : [];
  const morningRoutes = routeList.filter(r => r.direction === 'MORNING');
  const eveningRoutes = routeList.filter(r => r.direction === 'EVENING');

  const toggleRoute = (routeId: string) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(routeId)) next.delete(routeId);
      else next.add(routeId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="container-app py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/20">
            <Clock className="h-6 w-6 text-terracotta-500" />
          </div>
        </div>
      </div>
    );
  }

  const renderTimingsSection = (title: string, icon: React.ReactNode, routes: RouteType[], color: string) => {
    if (routes.length === 0) return null;

    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
            {icon}
          </div>
          <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-slate-100">{title}</h2>
          <Badge variant="primary">{routes.length} routes</Badge>
        </div>
        <div className="space-y-4">
          {routes.map(route => (
            <Card key={route.id} padding="md" className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
                    <Bus className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-charcoal-500 dark:text-slate-100">{route.routeCode}</span>
                      <Badge variant="secondary" size="sm">{route.zone?.name || 'Unknown Zone'}</Badge>
                      <Badge variant={route.active ? 'success' : 'danger'} size="sm">
                        {route.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 truncate">
                      {route.routeName || 'Unnamed Route'}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-slate-300 ml-4">
                  {route.startingTime && (
                    <span className="flex items-center gap-1 font-medium text-charcoal-500 dark:text-slate-200">
                      <Clock className="h-4 w-4" />
                      {route.startingTime}
                    </span>
                  )}
                  {route.endingTime && (
                    <span className="flex items-center gap-1 font-medium text-charcoal-500 dark:text-slate-200">
                      <Clock className="h-4 w-4" />
                      {route.endingTime}
                    </span>
                  )}
                  <button
                    onClick={() => toggleRoute(route.id)}
                    className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    aria-expanded={expandedRoutes.has(route.id)}
                  >
                    {expandedRoutes.has(route.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {expandedRoutes.has(route.id) && (
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-800 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Starting Point</p>
                      <p className="font-medium text-charcoal-500 dark:text-slate-200">{route.startingPoint || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Ending Point</p>
                      <p className="font-medium text-charcoal-500 dark:text-slate-200">{route.endingPoint || 'Not specified'}</p>
                    </div>
                    {route.distanceKm && (
                      <div>
                        <p className="text-xs text-stone-500 dark:text-slate-400">Distance</p>
                        <p className="font-medium text-charcoal-500 dark:text-slate-200">{route.distanceKm} km</p>
                      </div>
                    )}
                    {route.estimatedDurationMinutes && (
                      <div>
                        <p className="text-xs text-stone-500 dark:text-slate-400">Duration</p>
                        <p className="font-medium text-charcoal-500 dark:text-slate-200">{route.estimatedDurationMinutes} min</p>
                      </div>
                    )}
                  </div>
                  
                  {route.boardingPoints && route.boardingPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-charcoal-500 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-terracotta-500 dark:text-blue-400" />
                        Boarding Points & Timings
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-800">
                              <th className="pb-2 font-medium">#</th>
                              <th className="pb-2 font-medium">Stop Name</th>
                              <th className="pb-2 font-medium">Time</th>
                              <th className="pb-2 font-medium">Landmark</th>
                            </tr>
                          </thead>
                          <tbody>
                            {route.boardingPoints
                              .sort((a, b) => a.stopOrder - b.stopOrder)
                              .map((stop: BoardingPoint) => (
                                <tr key={stop.id} className="border-b border-stone-100 dark:border-slate-800/60 last:border-0">
                                  <td className="py-2 text-stone-500 dark:text-slate-400">{stop.stopOrder}</td>
                                  <td className="py-2 font-medium text-charcoal-500 dark:text-slate-200">{stop.stopName}</td>
                                  <td className="py-2 text-stone-600 dark:text-slate-300">
                                    {stop.stopTime ? (
                                      <span className="font-mono">{stop.stopTime}</span>
                                    ) : (
                                      <span className="text-stone-400 dark:text-slate-500">—</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-stone-500 dark:text-slate-400">{stop.landmark || '—'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/routes/${route.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Full Details →
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="container-app py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal-500 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium mb-4">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-slate-100 mb-2">Route Timings & Schedule</h1>
          <p className="text-lg text-stone-600 dark:text-slate-300">Complete timetable for all university transport routes with boarding point schedules.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {renderTimingsSection(
            'Morning Routes (Home → College)',
            <Sunrise className="h-5 w-5 text-white" />,
            morningRoutes,
            'bg-amber-600'
          )}
          {renderTimingsSection(
            'Evening Routes (College → Home)',
            <Sunset className="h-5 w-5 text-white" />,
            eveningRoutes,
            'bg-charcoal-500'
          )}
        </div>

        {routes.length === 0 && (
          <Card className="text-center py-12 max-w-xl mx-auto">
            <Clock className="h-12 w-12 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 mb-2">No route timings available</h3>
            <p className="text-stone-500 dark:text-slate-400">Route data will appear here once imported.</p>
          </Card>
        )}
      </div>
    </div>
  );
}