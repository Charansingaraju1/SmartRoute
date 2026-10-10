import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Bus, MapPin, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

interface BusWithStudents {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  currentStudentsCount: number;
  active: boolean;
  route?: { routeCode: string; routeName?: string; direction: string };
  students: Array<{
    id: string;
    user: { name: string; email: string };
    studentId?: string;
    branch?: string;
    classSection?: string;
    boardingPoint?: { stopName: string; stopTime?: string };
    pickupTime?: string;
    assignmentStatus?: string;
  }>;
}

export function TeacherPassengersPage() {
  const [expandedBuses, setExpandedBuses] = useState<Set<string>>(new Set());

  const { data: buses, isLoading, error } = useQuery({
    queryKey: ['teacher-buses'],
    queryFn: () => api.getTeacherBuses(),
  });

  const busesData = buses || [];

  const toggleBus = (busId: string) => {
    setExpandedBuses(prev => {
      const next = new Set(prev);
      if (next.has(busId)) next.delete(busId);
      else next.add(busId);
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
          <div className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load buses</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Passenger Lists</h1>
        <p className="text-stone-600 mt-1">View all students assigned to each bus.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {busesData.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No Buses Found</h3>
          <p className="text-stone-500 mb-4">No buses are currently registered in the system.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {busesData.map(bus => {
            const isExpanded = expandedBuses.has(bus.id);
            const students = bus.students || [];

            const renderStudentsTable = () => {
              if (bus.students?.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500">No students assigned to this bus yet.</p>
                  </div>
                );
              }
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                        <th className="pb-2 font-medium w-10">#</th>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Student ID</th>
                        <th className="pb-2 font-medium">Branch</th>
                        <th className="pb-2 font-medium">Class</th>
                        <th className="pb-2 font-medium">Boarding Point</th>
                        <th className="pb-2 font-medium">Pickup Time</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.students?.map((student: { id: string; user: { name: string; email: string }; studentId?: string; branch?: string; classSection?: string; boardingPoint?: { stopName: string; stopTime?: string; pickupTime?: string }; assignmentStatus?: string }, index: number) => (
                        <tr key={student.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                          <td className="py-2 text-stone-500">{index + 1}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-terracotta-600" />
                              </div>
                              <div>
                                <p className="font-medium text-charcoal-500">{student.user.name}</p>
                                <p className="text-xs text-stone-500">{student.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 font-mono text-sm text-charcoal-500">{student.studentId || '—'}</td>
                          <td className="py-2 text-stone-600">{student.branch || '—'}</td>
                          <td className="py-2 text-stone-600">{student.classSection || '—'}</td>
                          <td className="py-2 text-stone-600">
                            {student.boardingPoint && (
                              <div>
                                <p className="font-medium text-charcoal-500">{student.boardingPoint.stopName}</p>
                                {student.boardingPoint.stopTime && <p className="text-xs text-stone-500 font-mono">{student.boardingPoint.stopTime}</p>}
                              </div>
                            )}
                            <span className="text-stone-400">—</span>
                          </td>
                          <td className="py-2 text-stone-600 font-mono">{student.boardingPoint?.pickupTime || '—'}</td>
                          <td className="py-2">
                            <Badge variant={student.assignmentStatus === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                              {student.assignmentStatus || 'Unassigned'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            };

            return (
              <Card key={bus.id} className="overflow-hidden" padding="md">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0">
                      <Bus className="h-7 w-7 text-terracotta-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xl font-bold text-charcoal-500">{bus.registrationNumber}</span>
                        {bus.busNumber && <Badge variant="secondary" size="sm">{bus.busNumber}</Badge>}
                        <Badge variant={bus.active ? 'success' : 'danger'} size="sm">
                          {bus.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        {bus.route && (
                          <span className="font-medium text-charcoal-500">{bus.route.routeCode}</span>
                        )}
                        {bus.route && (
                          <Badge variant={bus.route.direction === 'MORNING' ? 'info' : 'warning'} size="sm">
                            {bus.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-600 ml-4">
                    <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-3 py-1">
                      <Users className="h-4 w-4 text-stone-500" />
                      <span className="font-mono text-charcoal-500">{bus.currentStudentsCount} / {bus.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleBus(bus.id)}
                      className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 hover:bg-stone-100 transition-colors"
                      aria-expanded={expandedBuses.has(bus.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {expandedBuses.has(bus.id) && (
                  <div className="mt-4 pt-4 border-t border-stone-200 animate-slide-down">
                    {renderStudentsTable()}
                  </div>
                )}

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}