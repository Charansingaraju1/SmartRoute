import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus, MapPin, Clock, User, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusDetail {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  route?: {
    id: string;
    routeCode: string;
    routeName?: string;
    direction: string;
    startingPoint?: string;
    startingTime?: string;
    boardingPoints?: Array<{ id: string; stopName: string; stopTime?: string; stopOrder: number }>;
  };
  currentStudentsCount: number;
  availableCapacity: number;
  active: boolean;
}

export function StudentMyBusPage() {
  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ['student-assignment'],
    queryFn: () => api.getStudentAssignment(),
  });

  const bus = assignment?.bus;

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="container-app py-12">
        <Card className="max-w-2xl mx-auto text-center py-12" padding="lg">
          <svg className="h-16 w-16 text-stone-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-2">No Bus Assigned</h2>
          <p className="text-stone-500 mb-6">You don't have an active bus assignment yet. Contact transport office or select a bus.</p>
          <Link to="/student/my-bus" className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Browse Available Buses
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">My Bus</h1>
        <p className="text-stone-600 mt-1">View your assigned bus details and route information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bus Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-terracotta-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-terracotta-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-charcoal-500">Bus {bus.registrationNumber}</h2>
                  {bus.busNumber && <p className="text-stone-500">Internal Number: {bus.busNumber}</p>}
                </div>
              </div>
              <Badge variant={bus.active ? 'success' : 'danger'}>{bus.active ? 'Active' : 'Inactive'}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Capacity</p>
                <p className="font-heading text-2xl font-bold text-charcoal-500">{bus.currentStudentsCount} / {bus.capacity}</p>
                <p className="text-sm text-stone-500">{bus.availableCapacity} seats available</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Status</p>
                <p className="font-heading text-xl font-bold text-charcoal-500 capitalize">{bus.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6 mb-6">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Driver & Conductor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bus.driverName && (
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-terracotta-600" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Driver</p>
                        <p className="font-medium text-charcoal-500">{bus.driverName}</p>
                        {bus.driverPhone && <p className="text-sm text-stone-500">{bus.driverPhone}</p>}
                      </div>
                    </div>
                  </div>
                )}
                {bus.conductorName && (
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Conductor</p>
                        <p className="font-medium text-charcoal-500">{bus.conductorName}</p>
                        {bus.conductorPhone && <p className="text-sm text-stone-500">{bus.conductorPhone}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {bus.route && (
            <Card padding="lg">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-terracotta-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Route: {bus.route.routeCode} - {bus.route.routeName || 'Unnamed Route'}
              </h3>
              <Badge variant={bus.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                {bus.route.direction === 'MORNING' ? 'Morning (Home → College)' : 'Evening (College → Home)'}
              </Badge>
              
              <div className="mt-4 space-y-3">
                {bus.route.startingPoint && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <svg className="h-5 w-5 text-terracotta-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-stone-500">Starting Point</p>
                      <p className="font-medium text-charcoal-500">{bus.route.startingPoint}</p>
                    </div>
                  </div>
                )}
                {bus.route.startingTime && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <svg className="h-5 w-5 text-terracotta-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-stone-500">Departure Time</p>
                      <p className="font-mono font-medium text-charcoal-500">{bus.route.startingTime}</p>
                    </div>
                  </div>
                )}
                {bus.route.endingPoint && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <svg className="h-5 w-5 text-terracotta-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-stone-500">Destination</p>
                      <p className="font-medium text-charcoal-500">{bus.route.endingPoint}</p>
                    </div>
                  </div>
                )}
              </div>

              {bus.route.boardingPoints && bus.route.boardingPoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-charcoal-500 mb-3">Boarding Points</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                          <th className="pb-2 font-medium">#</th>
                          <th className="pb-2 font-medium">Stop Name</th>
                          <th className="pb-2 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bus.route.boardingPoints
                          .sort((a: { stopOrder: number }, b: { stopOrder: number }) => a.stopOrder - b.stopOrder)
                          .slice(0, 10)
                          .map((stop: { id: string; stopOrder: number; stopName: string; stopTime?: string }) => (
                            <tr key={stop.id} className="border-b border-stone-100 last:border-0">
                              <td className="py-2 text-stone-500">{stop.stopOrder}</td>
                              <td className="py-2 font-medium text-charcoal-500">{stop.stopName}</td>
                              <td className="py-2 text-stone-600">
                                {stop.stopTime ? <span className="font-mono">{stop.stopTime}</span> : <span className="text-stone-400">—</span>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {bus.route.boardingPoints.length > 10 && (
                      <p className="mt-2 text-sm text-stone-500 text-center">+ {bus.route.boardingPoints.length - 10} more stops</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card padding="lg" className="text-center">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/student/my-route" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">View Full Route</p>
                      <p className="text-sm text-stone-500">See all stops & timings</p>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/student/boarding-point" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">My Boarding Point</p>
                      <p className="text-sm text-stone-500">Pickup location & time</p>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/student/bus-pass" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">My Bus Pass</p>
                      <p className="text-sm text-stone-500">View & manage pass</p>
                    </div>
                  </div>
                </button>
              </Link>
              <Link to="/student/gps" className="block">
                <button className="w-full text-left p-4 rounded-lg border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a5 5 0 1110 0 5 5 0 01-10 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500">Live Location</p>
                      <p className="text-sm text-stone-500">Track bus in real-time</p>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}