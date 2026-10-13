import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Bus, ChevronDown, ChevronUp, Filter, Map } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Route as RouteType, Zone } from '@/types/transport';

export function RoutesPage() {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesData, zonesData] = await Promise.all([
        api.getRoutes(),
        api.getZones(),
      ]);
      setRoutes(routesData);
      setZones(zonesData);
    } catch (err) {
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const routeList = Array.isArray(routes) ? routes : [];
  const filteredRoutes = routeList.filter(route => {
    if (selectedZone !== 'all' && route.zoneId !== selectedZone) return false;
    if (selectedDirection !== 'all' && route.direction !== selectedDirection) return false;
    return true;
  });

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
            <Map className="h-6 w-6 text-terracotta-500" />
          </div>
        </div>
      </div>
    );
  }

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const zoneName = route.zone?.name || 'Unknown Zone';
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(route);
    return acc;
  }, {} as Record<string, RouteType[]>);

  return (
    <div className="container-app py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal-500 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium mb-4">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-slate-100 mb-2">Routes & Zones</h1>
          <p className="text-lg text-stone-600 dark:text-slate-300">Explore all university transport routes organized by zone and direction.</p>
        </div>

        {/* Filters */}
        <Card className="mb-6" padding="md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-blue-400"
              >
                <option value="all">All Zones</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none dark:border-slate-700 dark:bg-[#111827] dark:text-slate-100 dark:focus:border-blue-400"
              >
                <option value="all">All Directions</option>
                <option value="MORNING">Morning (Home → College)</option>
                <option value="EVENING">Evening (College → Home)</option>
              </select>
            </div>
          </div>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">{error}</div>
        )}

        {Object.keys(groupedRoutes).length === 0 ? (
          <Card className="text-center py-12">
            <MapPin className="h-12 w-12 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 mb-2">No routes found</h3>
            <p className="text-stone-500 dark:text-slate-400">Try adjusting your filters.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedRoutes).map(([zoneName, zoneRoutes]) => (
              <section key={zoneName}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-slate-100">{zoneName}</h2>
                  <Badge variant="primary">{zoneRoutes.length} routes</Badge>
                </div>
                <div className="space-y-4">
                  {zoneRoutes.map(route => (
                    <Card key={route.id} padding="md" className="overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-terracotta-100 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                            <Bus className="h-6 w-6 text-terracotta-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-lg font-bold text-charcoal-500 dark:text-slate-100">{route.routeCode}</span>
                              <Badge variant={route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                                {route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                              </Badge>
                              <Badge variant={route.active ? 'success' : 'danger'} size="sm">
                                {route.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 truncate">
                              {route.routeName || 'Unnamed Route'}
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-slate-400 truncate">{route.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-slate-300 ml-4">
                          {route.startingTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {route.startingTime}
                            </span>
                          )}
                          {route.feeAmount && (
                            <span className="font-medium text-charcoal-500 dark:text-slate-100">₹{route.feeAmount}</span>
                          )}
                          <button
                            onClick={() => toggleRoute(route.id)}
                            className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            aria-expanded={expandedRoutes.has(route.id)}
                            aria-label={expandedRoutes.has(route.id) ? 'Collapse route details' : 'Expand route details'}
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
                          <Link
                            to={`/routes/${route.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details →
                          </Link>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}