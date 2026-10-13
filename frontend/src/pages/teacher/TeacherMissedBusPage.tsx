import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Bus, Users, Clock, MapPin, Loader2, Check, X, MessageSquare, Eye, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useToast } from '@/components/ui/Toaster';

interface BusOption {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  currentStudentsCount: number;
  availableCapacity?: number;
  active?: boolean;
  route?: {
    id: string;
    routeCode: string;
    name: string;
  };
}

interface MissedBusRequest {
  id: string;
  status: 'REQUESTED' | 'ACKNOWLEDGED' | 'ALTERNATIVE_BUS_ASSIGNED' | 'RESOLVED' | 'CANCELLED';
  requestedAt: string;
  acknowledgedAt?: string;
  alternativeAssignedAt?: string;
  resolvedAt?: string;
  studentNotes?: string;
  teacherNotes?: string;
  cancellationReason?: string;
  student: {
    id: string;
    user: { name: string; email: string };
    studentId?: string;
    bus?: { id?: string; registrationNumber: string; route?: { routeCode: string } };
  };
  originalBus?: { id: string; registrationNumber: string; capacity: number; currentStudentsCount: number; route?: { routeCode: string } };
  alternativeBus?: { id: string; registrationNumber: string; capacity: number; currentStudentsCount: number; route?: { routeCode: string } };
  studentLocationLat?: number;
  studentLocationLng?: number;
  studentLocationAt?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherMissedBusPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<MissedBusRequest | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [alternativeBusId, setAlternativeBusId] = useState<string>('');

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['teacher-missed-bus'],
    queryFn: () => api.getTeacherMissedBus(),
  });

  const { data: rawBuses, isLoading: isBusesLoading } = useQuery({
    queryKey: ['available-buses'],
    queryFn: () => api.getBuses().catch(() => []),
  });

  const availableBuses: BusOption[] = Array.isArray(rawBuses) ? (rawBuses as BusOption[]) : [];

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.acknowledgeMissedBus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-missed-bus'] });
      addToast({ type: 'success', title: 'Request Acknowledged', message: 'Missed bus request marked as acknowledged.' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Error', message: err?.response?.data?.message || 'Failed to acknowledge request.' });
    },
  });

  const assignAlternativeMutation = useMutation({
    mutationFn: async ({ requestId, alternativeBusId, notes }: { requestId: string; alternativeBusId: string; notes?: string }) => {
      return api.assignAlternativeBus(requestId, alternativeBusId, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-missed-bus'] });
      queryClient.invalidateQueries({ queryKey: ['available-buses'] });
      addToast({ type: 'success', title: 'Alternative Bus Assigned', message: 'Successfully assigned alternative bus to student.' });
      handleCloseModal();
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Assignment Failed', message: err?.response?.data?.message || 'Failed to assign alternative bus.' });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.resolveMissedBus(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-missed-bus'] });
      setSelectedRequest(null);
    },
  });

  const requestsData: MissedBusRequest[] = Array.isArray(requests) ? (requests as MissedBusRequest[]) : (((requests as any)?.content) || []);
  const pendingRequests = requestsData.filter((r: MissedBusRequest) => r.status === 'REQUESTED' || r.status === 'ACKNOWLEDGED');
  const historyRequests = requestsData.filter((r: MissedBusRequest) => r.status === 'RESOLVED' || r.status === 'CANCELLED' || r.status === 'ALTERNATIVE_BUS_ASSIGNED');

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load requests</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleSelectRequest = (request: MissedBusRequest) => {
    setSelectedRequest(request);
    setTeacherNotes(request.teacherNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setTeacherNotes('');
    setAlternativeBusId('');
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Missed Bus Requests</h1>
        <p className="text-stone-600 mt-1">Manage student missed bus requests and assign alternative buses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-orange-50 border-orange-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Pending</p>
              <p className="font-heading text-3xl font-bold text-orange-600">{requestsData.filter((r: MissedBusRequest) => r.status === 'REQUESTED').length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Acknowledged</p>
              <p className="font-heading text-3xl font-bold text-blue-600">{requestsData.filter((r: MissedBusRequest) => r.status === 'ACKNOWLEDGED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Assigned Alternative</p>
              <p className="font-heading text-3xl font-bold text-green-600">{requestsData.filter((r: MissedBusRequest) => r.status === 'ALTERNATIVE_BUS_ASSIGNED').length}</p>
            </div>
            <Bus className="h-12 w-12 text-green-600" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Resolved</p>
              <p className="font-heading text-3xl font-bold text-green-600">{requestsData.filter((r: MissedBusRequest) => r.status === 'RESOLVED').length}</p>
            </div>
            <Check className="h-12 w-12 text-green-600" />
          </div>
        </Card>
      </div>

      {pendingRequests.length === 0 && historyRequests.length === 0 ? (
        <Card className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No Missed Bus Requests</h3>
          <p className="text-stone-500">No requests have been submitted yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request: MissedBusRequest) => (
            <Card key={request.id} padding="md" className="border-l-4 border-orange-500 cursor-pointer hover:bg-stone-50/50 transition-colors" onClick={() => handleSelectRequest(request)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">{request.status.replace(/_/g, ' ')}</Badge>
                      <Badge variant="secondary" size="sm">Student: {request.student.user.name}</Badge>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">Requested {formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}</p>
                  </div>
                </div>
                <Badge variant={request.status === 'REQUESTED' ? 'warning' : 'info'} size="sm">
                  {request.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </Card>
          ))}
          {historyRequests.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-charcoal-500">History</h2>
                <Badge variant="default">{historyRequests.length}</Badge>
              </div>
              {historyRequests.map((request: MissedBusRequest) => (
                <Card key={request.id} padding="md" className="opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">Resolved</Badge>
                          <Badge variant="secondary" size="sm">Student: {request.student.user.name}</Badge>
                        </div>
                        <p className="text-sm text-stone-600 mt-1">Requested {formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-stone-50 dark:bg-[#182235] border border-transparent dark:border-[#334155] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-xl">
            <div className="p-6 border-b border-stone-200 dark:border-[#334155] flex items-center justify-between sticky top-0 bg-stone-50 dark:bg-[#182235] z-10">
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">Missed Bus Request Details</h2>
              <button onClick={handleCloseModal} className="p-2 text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">{selectedRequest.status.replace(/_/g, ' ')}</Badge>
                      <Badge variant="secondary" size="sm">Student: {selectedRequest.student.user.name}</Badge>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">Requested {formatDistanceToNow(parseISO(selectedRequest.requestedAt), { addSuffix: true })}</p>
                  </div>
                </div>
                <Badge variant={selectedRequest.status === 'REQUESTED' ? 'warning' : selectedRequest.status === 'ACKNOWLEDGED' ? 'info' : 'success'} size="sm">
                  {selectedRequest.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Student</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-terracotta-600 dark:text-terracotta-400" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{selectedRequest.student.user.name}</p>
                      <p className="text-sm text-stone-500 dark:text-slate-400">{selectedRequest.student.user.email}</p>
                      {selectedRequest.student.studentId && <p className="text-xs text-stone-500 dark:text-slate-400 font-mono">ID: {selectedRequest.student.studentId}</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Original Bus</p>
                  <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedRequest.originalBus?.registrationNumber || 'Unknown'}</p>
                  {selectedRequest.originalBus?.route && <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Route: {selectedRequest.originalBus.route.routeCode}</p>}
                </div>
              </div>

              {selectedRequest.studentNotes && (
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Student Notes</p>
                  <p className="text-stone-700 dark:text-slate-300">{selectedRequest.studentNotes}</p>
                </div>
              )}

              {selectedRequest.studentLocationLat && selectedRequest.studentLocationLng && (
                <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                  <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Student Location</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                      <p className="text-xs text-stone-500 dark:text-slate-400">Latitude</p>
                      <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedRequest.studentLocationLat}</p>
                    </div>
                    <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                      <p className="text-xs text-stone-500 dark:text-slate-400">Longitude</p>
                      <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedRequest.studentLocationLng}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-stone-200 dark:border-[#334155] pt-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-terracotta-500" />
                  Teacher Response
                </h3>

                {selectedRequest.teacherNotes && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800/60">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Your Previous Response</p>
                    <p className="text-blue-800 dark:text-blue-200">{selectedRequest.teacherNotes}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">Teacher Notes</label>
                    <textarea
                      value={teacherNotes}
                      onChange={e => setTeacherNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                      placeholder="Add notes for the student (e.g., alternative bus info, instructions)..."
                    />
                  </div>
                  <button
                    onClick={() => { /* TODO: save notes */ }}
                    className="px-4 py-2 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>

                <div className="border-t border-stone-200 dark:border-[#334155] pt-6">
                  <h4 className="font-medium text-charcoal-500 dark:text-[#F1F5F9] mb-4 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-terracotta-500" />
                    Assign Alternative Bus
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500 dark:text-slate-400">Select an available bus with capacity for this student:</p>
                    {isBusesLoading ? (
                      <div className="flex items-center gap-2 py-2 text-sm text-stone-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin text-terracotta-500" />
                        <span>Loading available university buses...</span>
                      </div>
                    ) : availableBuses.length === 0 ? (
                      <p className="text-sm text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800/60">
                        No bus records found.
                      </p>
                    ) : (
                      <select
                        value={alternativeBusId}
                        onChange={e => setAlternativeBusId(e.target.value)}
                        disabled={assignAlternativeMutation.isPending}
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Select alternative bus...</option>
                        {availableBuses.map((bus) => {
                          const available = bus.availableCapacity !== undefined
                            ? bus.availableCapacity
                            : Math.max(0, bus.capacity - (bus.currentStudentsCount || 0));
                          const isOriginal = selectedRequest?.originalBus?.id === bus.id;
                          const isFull = available <= 0;
                          const isDisabled = isOriginal || isFull;

                          return (
                            <option
                              key={bus.id}
                              value={bus.id}
                              disabled={isDisabled}
                            >
                              Bus {bus.registrationNumber} {bus.busNumber ? `(#${bus.busNumber})` : ''} - {bus.route?.routeCode ? `Route ${bus.route.routeCode}` : 'Campus Service'} ({available} seats available / {bus.capacity} cap){isOriginal ? ' [Original Bus]' : isFull ? ' [Full]' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    <button
                      onClick={() => {
                        if (alternativeBusId && selectedRequest) {
                          assignAlternativeMutation.mutate({
                            requestId: selectedRequest.id,
                            alternativeBusId,
                            notes: teacherNotes,
                          });
                        }
                      }}
                      disabled={!alternativeBusId || assignAlternativeMutation.isPending}
                      className="px-4 py-2 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {assignAlternativeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <span>Assign Alternative Bus</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-stone-200 dark:border-[#334155] pt-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (selectedRequest.status === 'REQUESTED') {
                          acknowledgeMutation.mutate(selectedRequest.id);
                        } else if (selectedRequest.status === 'ACKNOWLEDGED') {
                          resolveMutation.mutate(selectedRequest.id);
                        } else if (selectedRequest.status === 'ALTERNATIVE_BUS_ASSIGNED') {
                          resolveMutation.mutate(selectedRequest.id);
                        }
                        handleCloseModal();
                      }}
                      className="flex-1 px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {selectedRequest.status === 'REQUESTED' ? 'Acknowledge' : selectedRequest.status === 'ACKNOWLEDGED' ? 'Resolve' : 'Mark Resolved'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}