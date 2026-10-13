import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Bus, ChevronDown, ChevronUp, GraduationCap, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toaster';

// Sub-component: fetches and renders the student table for ONE bus.
// Only mounts (and fetches) when the row is expanded — avoids N parallel requests on load.
function BusPassengerTable({ busId }: { busId: string }) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [studentToRemove, setStudentToRemove] = useState<any | null>(null);

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['teacher-bus-students', busId],
    queryFn: () => api.getTeacherBusStudents(busId),
    // Cache for 2 minutes; re-fetch on window focus
    staleTime: 2 * 60 * 1000,
  });

  const removeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      return api.deleteTeacherAssignment(assignmentId, 'Removed via Passenger List');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-bus-students', busId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-buses'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-assignments'] });
      addToast({ type: 'success', title: 'Student Removed', message: 'Student has been removed from this bus assignment.' });
      setStudentToRemove(null);
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Failed to Remove', message: err?.response?.data?.message || 'Could not remove student from bus.' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-stone-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading passengers…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-6 text-red-600 bg-red-50 rounded-lg px-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">Unable to load passenger list. You may not have access to this bus.</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">No students are currently assigned to this bus.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-stone-500 dark:text-slate-400 border-b border-stone-200 dark:border-slate-700">
            <th className="pb-2 font-medium w-10">#</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Student ID</th>
            <th className="pb-2 font-medium">Branch</th>
            <th className="pb-2 font-medium">Class</th>
            <th className="pb-2 font-medium">Boarding Point</th>
            <th className="pb-2 font-medium">Pickup Time</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium text-right pr-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: any, index: number) => (
            <tr key={student.id} className="border-b border-stone-100 dark:border-slate-800 last:border-0 hover:bg-stone-50 dark:hover:bg-slate-800/50">
              <td className="py-2 text-stone-500 dark:text-slate-400">{index + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-terracotta-600 dark:text-terracotta-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{student.user?.name ?? '—'}</p>
                    <p className="text-xs text-stone-500 dark:text-slate-400">{student.user?.email ?? ''}</p>
                  </div>
                </div>
              </td>
              <td className="py-2 font-mono text-sm text-charcoal-500 dark:text-[#F1F5F9]">{student.studentId || student.studentIdStr || '—'}</td>
              <td className="py-2 text-stone-600 dark:text-slate-300">{student.branch || '—'}</td>
              <td className="py-2 text-stone-600 dark:text-slate-300">{student.classSection || '—'}</td>
              <td className="py-2 text-stone-600 dark:text-slate-300">
                {student.boardingPoint ? (
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{student.boardingPoint.stopName}</p>
                    {student.boardingPoint.stopTime && (
                      <p className="text-xs text-stone-500 dark:text-slate-400 font-mono">{student.boardingPoint.stopTime}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-stone-400 dark:text-slate-500">—</span>
                )}
              </td>
              <td className="py-2 text-stone-600 dark:text-slate-300 font-mono">
                {student.boardingPoint?.pickupTime || student.stopTime || '—'}
              </td>
              <td className="py-2">
                <Badge
                  variant={student.assignmentStatus === 'ACTIVE' || student.status === 'ACTIVE' ? 'success' : 'warning'}
                  size="sm"
                >
                  {student.assignmentStatus || student.status || 'Unassigned'}
                </Badge>
              </td>
              <td className="py-2 text-right pr-2">
                {student.assignmentId && (
                  <button
                    onClick={() => setStudentToRemove(student)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 border border-red-200 dark:border-rose-800 rounded-md transition-colors"
                    title="Remove student from bus assignment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {studentToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#182235] border border-stone-200 dark:border-[#334155] rounded-xl max-w-md w-full p-6 shadow-xl animate-scale-in">
            <h3 className="font-heading text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9] mb-2">
              Remove Student from Bus?
            </h3>
            <p className="text-sm text-stone-600 dark:text-slate-300 mb-4">
              Are you sure you want to remove <strong className="text-charcoal-500 dark:text-white">{studentToRemove.user?.name || studentToRemove.name || 'this student'}</strong> from this bus? This will release the bus seat and cancel their transport assignment. The student's account and bus pass history will remain intact.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => setStudentToRemove(null)}
                className="px-4 py-2 text-sm font-medium border border-stone-300 dark:border-slate-700 rounded-lg text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(studentToRemove.assignmentId)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {removeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
        <p className="text-stone-600 mt-1">View all students assigned to each of your buses.</p>
      </div>

      {busesData.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No Buses Assigned</h3>
          <p className="text-stone-500 mb-4">
            You have no bus assignments yet. Contact an administrator to be assigned to a bus.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {busesData.map((bus: any) => {
            const isExpanded = expandedBuses.has(bus.id);
            return (
              <Card key={bus.id} className="overflow-hidden" padding="md">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0">
                      <Bus className="h-7 w-7 text-terracotta-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xl font-bold text-charcoal-500">
                          {bus.registrationNumber}
                        </span>
                        {bus.busNumber && (
                          <Badge variant="secondary" size="sm">{bus.busNumber}</Badge>
                        )}
                        <Badge variant={bus.active ? 'success' : 'danger'} size="sm">
                          {bus.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        {bus.route && (
                          <span className="font-medium text-charcoal-500">{bus.route.routeCode}</span>
                        )}
                        {bus.route && (
                          <Badge
                            variant={bus.route.direction === 'MORNING' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {bus.route.direction === 'MORNING' ? 'Morning' : 'Evening'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-600 ml-4">
                    <div className="flex items-center gap-2 bg-stone-100 dark:bg-[#111827] border border-transparent dark:border-slate-800 rounded-lg px-3 py-1">
                      <Users className="h-4 w-4 text-stone-500 dark:text-slate-400" />
                      <span className="font-mono text-charcoal-500 dark:text-[#F1F5F9]">
                        {bus.currentStudentsCount} / {bus.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleBus(bus.id)}
                      className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 dark:hover:text-[#F1F5F9] hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse passenger list' : 'Expand passenger list'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-[#334155] animate-slide-down">
                    {/* BusPassengerTable only renders (and fetches) when the row is expanded */}
                    <BusPassengerTable busId={bus.id} />
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