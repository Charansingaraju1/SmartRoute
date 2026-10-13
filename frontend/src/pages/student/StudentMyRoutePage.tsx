import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Map, ArrowRight, ChevronDown, ChevronUp, Bus, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

interface RouteDetail {
  id: string;
  routeCode: string;
  routeName?: string;
  direction: string;
  startingPoint?: string;
  startingTime?: string;
  endingPoint?: string;
  endingTime?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  feeAmount?: number;
  active: boolean;
  zone?: { id: string; name: string; code: string };
  boardingPoints?: Array<{ id: string; stopName: string; stopTime?: string; stopOrder: number; landmark?: string }>;
  bus?: { id: string; registrationNumber: string; capacity: number; currentStudentsCount: number };
}

export function StudentMyRoutePage() {
  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['student-assignment'],
    queryFn: () => api.getStudentAssignment(),
  });

  const route = assignment?.route;
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="container-app py-12">
        <Card className="max-w-2xl mx-auto text-center py-12" padding="lg">
          <MapPin className="h-16 w-16 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-2">No Route Assigned</h2>
          <p className="text-stone-500 dark:text-slate-400 mb-6">You don't have an active route assignment yet.</p>
          <Link to="/student/my-bus" className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors">
            View Available Buses
          </Link>
        </Card>
      </div>
    );
  }

  const renderStopsTable = () => {
    if (!route.boardingPoints || route.boardingPoints.length === 0) {
      return null;
    }

    return (
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-terracotta-500" />
            Boarding Points & Timings
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            {expanded ? 'Show Less' : 'Show All'} {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-800">
                <th className="pb-2 font-medium w-12">#</th>
                <th className="pb-2 font-medium">Stop Name</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Landmark</th>
              </tr>
            </thead>
            <tbody>
              {route.boardingPoints
                .sort((a: { stopOrder: number }, b: { stopOrder: number }) => a.stopOrder - b.stopOrder)
                .filter((_: { stopOrder: number }, i: number) => expanded || i < 5)
                .map((stop: { id: string; stopOrder: number; stopName: string; stopTime?: string; landmark?: string }) => (
                  <tr key={stop.id} className="border-b border-stone-100 dark:border-slate-800/60 last:border-0">
                    <td className="py-3 text-stone-500 dark:text-slate-400 font-mono">{stop.stopOrder}</td>
                    <td className="py-3 font-medium text-charcoal-500 dark:text-[#F1F5F9]">{stop.stopName}</td>
                    <td className="py-3 text-stone-600 dark:text-slate-300">
                      {stop.stopTime ? <span className="font-mono">{stop.stopTime}</span> : <span className="text-stone-400 dark:text-slate-500">—</span>}
                    </td>
                    <td className="py-3 text-stone-500 dark:text-slate-400">{stop.landmark || '—'}</td>
                  </tr>
                ))}
              {!expanded && route.boardingPoints.length > 5 && (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-stone-500 dark:text-slate-400">
                    + {route.boardingPoints.length - 5} more stops
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">My Route</h1>
        <p className="text-stone-600 dark:text-slate-300 mt-1">View your assigned route details, stops, and timings.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-900 rounded-lg text-red-700 dark:text-rose-300">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bus className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">{route.routeCode}</span>
                    <Badge variant={route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                      {route.direction === 'MORNING' ? 'Morning (Home → College)' : 'Evening (College → Home)'}
                    </Badge>
                    <Badge variant={route.active ? 'success' : 'danger'} size="sm">
                      {route.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">{route.routeName || 'Unnamed Route'}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Zone</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.zone?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Direction</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.direction === 'MORNING' ? 'Morning (Home → College)' : 'Evening (College → Home)'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {route.startingPoint && (
                  <div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Starting Point</p>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.startingPoint}</p>
                  </div>
                )}
                {route.startingTime && (
                  <div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Departure Time</p>
                    <p className="font-mono font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.startingTime}</p>
                  </div>
                )}
                {route.endingPoint && (
                  <div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Destination</p>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.endingPoint}</p>
                  </div>
                )}
                {route.endingTime && (
                  <div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Arrival Time</p>
                    <p className="font-mono font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.endingTime}</p>
                  </div>
                )}
              </div>

              {route.distanceKm && (
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Distance</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.distanceKm} km</p>
                </div>
              )}
              {route.estimatedDurationMinutes && (
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Estimated Duration</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.estimatedDurationMinutes} minutes</p>
                </div>
              )}
              {route.feeAmount && (
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Route Fee</p>
                  <p className="font-heading text-xl font-bold text-terracotta-600 dark:text-blue-400">₹{route.feeAmount}</p>
                </div>
              )}

              {route.bus && (
                <div className="mt-6 pt-6 border-t border-stone-200 dark:border-slate-800">
                  <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-terracotta-500" />
                    Assigned Bus
                  </h3>
                  <div className="bg-stone-50 dark:bg-slate-900/50 rounded-lg p-4 border border-stone-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-terracotta-100 dark:bg-amber-950/60 flex items-center justify-center">
                          <Bus className="h-6 w-6 text-terracotta-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{route.bus.registrationNumber}</p>
                          <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Capacity: {route.bus.currentStudentsCount}/{route.bus.capacity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Link to="/routes" className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View All Routes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>

            {renderStopsTable()}

            <div className="space-y-4">
              <Card padding="lg" className="text-center">
                <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/student/boarding-point" className="block">
                    <button className="w-full text-left p-4 rounded-lg border border-stone-200 dark:border-slate-800 hover:border-terracotta-300 dark:hover:border-slate-700 hover:bg-terracotta-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-emerald-950/60 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-green-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">My Boarding Point</p>
                          <p className="text-sm text-stone-500 dark:text-slate-400">Your pickup location & time</p>
                        </div>
                      </div>
                    </button>
                  </Link>
                  <Link to="/student/my-bus" className="block">
                    <button className="w-full text-left p-4 rounded-lg border border-stone-200 dark:border-slate-800 hover:border-terracotta-300 dark:hover:border-slate-700 hover:bg-terracotta-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-terracotta-100 dark:bg-amber-950/60 flex items-center justify-center">
                          <Bus className="h-5 w-5 text-terracotta-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">My Bus Details</p>
                          <p className="text-sm text-stone-500 dark:text-slate-400">Bus info & driver</p>
                        </div>
                      </div>
                    </button>
                  </Link>
                  <Link to="/student/bus-pass" className="block">
                    <button className="w-full text-left p-4 rounded-lg border border-stone-200 dark:border-slate-800 hover:border-terracotta-300 dark:hover:border-slate-700 hover:bg-terracotta-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">My Bus Pass</p>
                          <p className="text-sm text-stone-500 dark:text-slate-400">View & manage pass</p>
                        </div>
                      </div>
                    </button>
                  </Link>
                  <Link to="/student/gps" className="block">
                    <button className="w-full text-left p-4 rounded-lg border border-stone-200 dark:border-slate-800 hover:border-terracotta-300 dark:hover:border-slate-700 hover:bg-terracotta-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center">
                          <Map className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">Live Location</p>
                          <p className="text-sm text-stone-500 dark:text-slate-400">Track bus in real-time</p>
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card padding="lg" className="text-center">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4">Route Summary</h3>
              <div className="space-y-4">
                <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Route Code</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{route.routeCode}</p>
                </div>
                {route.zone && (
                  <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Zone</p>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.zone.name}</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">{route.zone.code}</p>
                  </div>
                )}
                <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Direction</p>
                  <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9] capitalize">{route.direction.toLowerCase()}</p>
                </div>
                {route.distanceKm && (
                  <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Distance</p>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.distanceKm} km</p>
                  </div>
                )}
                {route.estimatedDurationMinutes && (
                  <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Duration</p>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{route.estimatedDurationMinutes} min</p>
                  </div>
                )}
                {route.feeAmount && (
                  <div className="bg-stone-50 dark:bg-slate-900/50 rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                    <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Route Fee</p>
                    <p className="font-heading text-xl font-bold text-terracotta-600 dark:text-blue-400">₹{route.feeAmount}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
}