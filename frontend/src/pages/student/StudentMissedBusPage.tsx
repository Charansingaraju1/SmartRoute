import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Bus, MapPin, Clock, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  originalBus?: { id: string; registrationNumber: string; route?: { routeCode: string; routeName?: string } };
  alternativeBus?: { id: string; registrationNumber: string; route?: { routeCode: string; routeName?: string } };
  studentLocationLat?: number;
  studentLocationLng?: number;
  studentLocationAt?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function StudentMissedBusPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['student-missed-bus'],
    queryFn: () => api.getStudentMissedBus(),
  });

  const createRequestMutation = useMutation({
    mutationFn: async (notes: string) => {
      // TODO: Implement create missed bus request API
      return { notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-missed-bus'] });
      setShowForm(false);
      setFormNotes('');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implement cancel request API
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-missed-bus'] });
    },
  });

  const requestsData = requests || [];

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load requests</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requestsData.filter(r => r.status === 'REQUESTED' || r.status === 'ACKNOWLEDGED');
  const historyRequests = requestsData.filter(r => r.status === 'RESOLVED' || r.status === 'CANCELLED' || r.status === 'ALTERNATIVE_BUS_ASSIGNED');

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Missed Bus</h1>
          <p className="text-stone-600 mt-1">Report a missed bus and track your requests.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={pendingRequests.length > 0}
          className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Report Missed Bus
        </button>
      </div>

      {showForm && (
        <Card className="mb-8" padding="lg">
          <h3 className="font-heading text-lg font-semibold text-charcoal-500 mb-4">Report Missed Bus</h3>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (formNotes.trim()) {
                createRequestMutation.mutate(formNotes);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">What happened? (Optional)</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 focus:outline-none"
                placeholder="Describe where you are, which bus you missed, and any other relevant details..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="px-6 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {createRequestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormNotes(''); }}
                className="px-6 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-charcoal-500">Active Requests</h2>
          <Badge variant={pendingRequests.length > 0 ? 'primary' : 'default'}>{pendingRequests.length}</Badge>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <Card className="text-center py-12 mb-8">
          <AlertTriangle className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No Active Requests</h3>
          <p className="text-stone-500 mb-6">You don't have any pending missed bus requests.</p>
          <button
            onClick={() => setShowForm(true)}
            disabled={createRequestMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Report Missed Bus
          </button>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingRequests.map(request => (
            <Card key={request.id} padding="lg" className="border-l-4 border-orange-500">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">{request.status.replace(/_/g, ' ')}</Badge>
                      {request.originalBus && (
                        <span className="font-mono text-sm text-charcoal-500">Bus {request.originalBus.registrationNumber}</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                      Requested {formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  {request.studentNotes && (
                    <button className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 underline">View Details</button>
                  )}
                  {request.status !== 'CANCELLED' && (
                    <button
                      onClick={() => cancelRequestMutation.mutate(request.id)}
                      disabled={cancelRequestMutation.isPending}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>

              {request.teacherNotes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Teacher Response</p>
                  <p className="text-blue-800 text-sm">{request.teacherNotes}</p>
                </div>
              )}

              {request.alternativeBus && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-700">Alternative Bus Assigned</span>
                    <Badge variant="success" size="sm">{request.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-charcoal-500">Bus {request.alternativeBus.registrationNumber}</p>
                      <p className="text-sm text-stone-500">Route: {request.alternativeBus.route?.routeCode || 'N/A'}</p>
                    </div>
                  </div>
                  {request.alternativeAssignedAt && (
                    <p className="mt-2 text-sm text-stone-500">Assigned {formatDistanceToNow(parseISO(request.alternativeAssignedAt), { addSuffix: true })}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal-500 mb-4">Request History</h2>
        {historyRequests.length === 0 ? (
          <Card className="text-center py-8">
            <Clock className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No History</h3>
            <p className="text-stone-500">Your resolved and cancelled requests will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyRequests.map(request => (
              <Card key={request.id} padding="lg" className={cn(request.status === 'CANCELLED' && 'opacity-70')}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      request.status === 'RESOLVED' ? 'bg-green-100' :
                      request.status === 'ALTERNATIVE_BUS_ASSIGNED' ? 'bg-blue-100' :
                      'bg-stone-100'
                    )}>
                      {request.status === 'RESOLVED' && <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {request.status === 'ALTERNATIVE_BUS_ASSIGNED' && <Bus className="h-6 w-6 text-blue-600" />}
                      {request.status === 'CANCELLED' && <svg className="h-6 w-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'RESOLVED' ? 'success' :
                          request.status === 'ALTERNATIVE_BUS_ASSIGNED' ? 'info' :
                          'default'
                        } size="sm">{request.status.replace(/_/g, ' ')}</Badge>
                        {request.originalBus && (
                          <span className="font-mono text-sm text-charcoal-500">Bus {request.originalBus.registrationNumber}</span>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 mt-1">
                        Requested {formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}
                        {request.resolvedAt && <span className="ml-2">• Resolved {formatDistanceToNow(parseISO(request.resolvedAt), { addSuffix: true })}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:items-end">
                    {request.alternativeBus && (
                      <div className="text-right">
                        <p className="text-xs text-stone-500">Alternative Bus</p>
                        <p className="font-mono text-sm text-charcoal-500">{request.alternativeBus.registrationNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {request.teacherNotes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Teacher Response</p>
                    <p className="text-blue-800 text-sm">{request.teacherNotes}</p>
                  </div>
                )}

                {request.cancellationReason && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-700 font-medium mb-1">Cancellation Reason</p>
                    <p className="text-red-800 text-sm">{request.cancellationReason}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}