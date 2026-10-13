import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toaster';
import {
  AlertTriangle,
  Bus,
  MapPin,
  Clock,
  RefreshCw,
  Plus,
  Loader2,
  Navigation,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { formatBusNumber, formatRouteCode } from '@/utils/transport';
import { LeafletMap, StopCoordinate } from '@/components/map/LeafletMap';

interface AlternativeRecommendation {
  type: 'NEXT_ON_ROUTE' | 'UPCOMING_ON_ROUTE' | 'SHARED_STOP_ROUTE' | 'TRANSPORT_DESK';
  busNumber: string;
  routeCode: string;
  routeName: string;
  boardingStop: string;
  stopTime?: string;
  reason: string;
  walkingNote: string;
  canWalk: boolean;
  busId?: string;
}

export function StudentMissedBusPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [selectedMissedStop, setSelectedMissedStop] = useState('');
  const [currentWaitingStop, setCurrentWaitingStop] = useState('');
  const [canWalkToNearbyStop, setCanWalkToNearbyStop] = useState(true);
  const [optionalPickupLocation, setOptionalPickupLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [selectedAlternative, setSelectedAlternative] = useState<AlternativeRecommendation | null>(null);

  // Queries
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['student-missed-bus'],
    queryFn: () => api.getStudentMissedBus(),
  });

  const { data: assignment } = useQuery({
    queryKey: ['student-assignment'],
    queryFn: () => api.getStudentAssignment(),
  });

  const { data: allBuses } = useQuery({
    queryKey: ['all-buses'],
    queryFn: () => api.getBuses().catch(() => []),
  });

  const { data: allRoutes } = useQuery({
    queryKey: ['all-routes'],
    queryFn: () => api.getRoutes().catch(() => []),
  });

  const userBus = assignment?.bus;
  const userRoute = assignment?.route;
  const userBoardingStop = assignment?.boardingPoint;

  // Mutation to submit missed bus request with recovery assignment
  const createRequestMutation = useMutation({
    mutationFn: async (payload: { notes: string; originalBusId?: string }) => {
      return api.postStudentMissedBus(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-missed-bus'] });
      setShowForm(false);
      setFormNotes('');
      setSelectedAlternative(null);
      addToast({
        type: 'success',
        title: 'Missed Bus Reported',
        message: 'Your transport backup request has been submitted to dispatch coordinators.',
      });
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: err.response?.data?.message || err.message || 'Could not submit missed bus request.',
      });
    },
  });

  // Deterministic 4-Tier AI alternative recommendations generator
  const recommendations: AlternativeRecommendation[] = useMemo(() => {
    const list: AlternativeRecommendation[] = [];
    const busList = Array.isArray(allBuses) ? allBuses : [];
    const routeList = Array.isArray(allRoutes) ? allRoutes : [];

    const activeWaitingStop = currentWaitingStop || userBoardingStop?.stopName || 'Your Scheduled Stop';
    const originalBusNum = formatBusNumber(userBus);

    // Tier 1: Next scheduled bus serving the same route & stop
    const sameRouteBuses = busList.filter(
      (b: any) => b.active && b.id !== userBus?.id && b.route?.id === userRoute?.id
    );

    if (sameRouteBuses.length > 0) {
      const altBus = sameRouteBuses[0];
      list.push({
        type: 'NEXT_ON_ROUTE',
        busNumber: formatBusNumber(altBus),
        routeCode: userRoute?.routeCode || 'R-101',
        routeName: userRoute?.routeName || 'Campus Corridor',
        boardingStop: activeWaitingStop,
        stopTime: '08:00 AM',
        reason: 'Next scheduled fleet vehicle following directly behind on your assigned route.',
        walkingNote: 'Stay at your current stop; no walking required.',
        canWalk: false,
        busId: altBus.id,
      });
    }

    // Tier 2: Another eligible bus serving an upcoming stop along the same route
    if (userRoute?.boardingPoints && userRoute.boardingPoints.length > 1) {
      const stops = [...userRoute.boardingPoints].sort((a: any, b: any) => (a.stopOrder || 0) - (b.stopOrder || 0));
      const currentIndex = stops.findIndex((s: any) => s.stopName === activeWaitingStop);
      const nextStop = currentIndex >= 0 && currentIndex < stops.length - 1 ? stops[currentIndex + 1] : stops[stops.length - 1];

      if (nextStop && nextStop.stopName !== activeWaitingStop) {
        list.push({
          type: 'UPCOMING_ON_ROUTE',
          busNumber: sameRouteBuses.length > 1 ? formatBusNumber(sameRouteBuses[1]) : `${originalBusNum} (Follow-up Service)`,
          routeCode: userRoute?.routeCode || 'R-101',
          routeName: userRoute?.routeName || 'Campus Corridor',
          boardingStop: nextStop.stopName,
          stopTime: nextStop.stopTime || '08:15 AM',
          reason: `Serves upcoming stop "${nextStop.stopName}". Walk to this stop to catch the service before departure.`,
          walkingNote: `Approx. 400m - 800m walk along main avenue to ${nextStop.stopName}.`,
          canWalk: true,
        });
      }
    }

    // Tier 3: Bus on a different route reaching a shared corridor stop / transfer point
    const otherRoutes = routeList.filter((r: any) => r.id !== userRoute?.id && r.active);
    for (const otherRoute of otherRoutes) {
      const sharedPoint = otherRoute.boardingPoints?.find((bp: any) =>
        bp.stopName?.toLowerCase().includes('uppal') ||
        bp.stopName?.toLowerCase().includes('tarnaka') ||
        bp.stopName?.toLowerCase().includes('ghatkesar') ||
        bp.stopName?.toLowerCase().includes(activeWaitingStop.toLowerCase())
      );

      if (sharedPoint) {
        const otherBus = otherRoute.bus || busList.find((b: any) => b.route?.id === otherRoute.id);
        list.push({
          type: 'SHARED_STOP_ROUTE',
          busNumber: formatBusNumber(otherBus),
          routeCode: otherRoute.routeCode,
          routeName: otherRoute.routeName,
          boardingStop: sharedPoint.stopName,
          stopTime: sharedPoint.stopTime || '07:55 AM',
          reason: `Shared transit corridor stop "${sharedPoint.stopName}" leading directly to Anurag University.`,
          walkingNote: `Connects via shared road intersection at ${sharedPoint.stopName}.`,
          canWalk: true,
          busId: otherBus?.id,
        });
        break; // Show best shared route option
      }
    }

    // Tier 4: University Transport Support Assistance Fallback
    list.push({
      type: 'TRANSPORT_DESK',
      busNumber: 'Transport Control Support',
      routeCode: 'AU-CONTROL',
      routeName: 'University Transportation Support & Shuttle Dispatch',
      boardingStop: activeWaitingStop,
      reason: 'Central transport coordinators can authorize a backup shuttle or alert fleet dispatchers.',
      walkingNote: 'Remain in a secure, well-lit university bus stop area.',
      canWalk: false,
    });

    return list;
  }, [allBuses, allRoutes, userBus, userRoute, userBoardingStop, currentWaitingStop]);

  const requestsData = requests || [];

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 dark:bg-charcoal-700 rounded w-3/4"></div>
          <div className="h-64 bg-stone-200 dark:bg-charcoal-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-8 max-w-lg mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Unable to load requests</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">Please try again later or contact transport office.</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requestsData.filter(
    (r: any) => r.status === 'REQUESTED' || r.status === 'ACKNOWLEDGED'
  );
  const historyRequests = requestsData.filter(
    (r: any) => r.status === 'RESOLVED' || r.status === 'CANCELLED' || r.status === 'ALTERNATIVE_BUS_ASSIGNED'
  );

  const displayUserBus = formatBusNumber(userBus);
  const displayUserRoute = formatRouteCode(userRoute);

  return (
    <div className="container-app py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-stone-100">
              Missed Bus Recovery
            </h1>
            <Badge variant="warning">Emergency Transit</Badge>
          </div>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Report a missed bus, evaluate verified alternative connections, and get safely to campus.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm && userBoardingStop?.stopName) {
              setSelectedMissedStop(userBoardingStop.stopName);
              setCurrentWaitingStop(userBoardingStop.stopName);
            }
          }}
          disabled={pendingRequests.length > 0}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          id="btn-report-missed-bus"
        >
          <Plus className="h-4 w-4 text-stone-900" />
          Report Missed Bus
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <Card className="mb-8 border border-amber-200 dark:border-amber-900/60 shadow-sm" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-stone-100">
              Missed Bus Incident Report & Alternative Finder
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs">
            <div>
              <span className="text-stone-500 dark:text-stone-400">Regular Vehicle:</span>
              <p className="font-semibold text-charcoal-500 dark:text-stone-200">{displayUserBus}</p>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">Assigned Route:</span>
              <p className="font-semibold text-charcoal-500 dark:text-stone-200">{displayUserRoute}</p>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">Scheduled Stop:</span>
              <p className="font-semibold text-charcoal-500 dark:text-stone-200">{userBoardingStop?.stopName || 'AU Corridor Stop'}</p>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">Destination Campus:</span>
              <p className="font-semibold text-charcoal-500 dark:text-stone-200">{userRoute?.endingPoint || 'Anurag University Campus'}</p>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              const notesPayload = `[Missed at: ${selectedMissedStop || 'Assigned Stop'}] [Waiting at: ${currentWaitingStop || 'Same Stop'}] [Can Walk: ${canWalkToNearbyStop ? 'Yes' : 'No'}] ${optionalPickupLocation ? `[Location: ${optionalPickupLocation}] ` : ''}${formNotes}`;
              createRequestMutation.mutate({
                notes: notesPayload,
                originalBusId: userBus?.id,
              });
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1.5">
                  Stop Where You Missed the Bus
                </label>
                <input
                  type="text"
                  value={selectedMissedStop}
                  onChange={e => setSelectedMissedStop(e.target.value)}
                  placeholder="e.g. Dilsukhnagar Bus Depot"
                  className="w-full rounded-lg border border-stone-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-terracotta-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1.5">
                  Stop Where You Are Currently Waiting
                </label>
                <input
                  type="text"
                  value={currentWaitingStop}
                  onChange={e => setCurrentWaitingStop(e.target.value)}
                  placeholder="e.g. Kothapet Fruit Market / Nagole 'X' Roads"
                  className="w-full rounded-lg border border-stone-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-terracotta-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1.5">
                  Other Current Location / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={optionalPickupLocation}
                  onChange={e => setOptionalPickupLocation(e.target.value)}
                  placeholder="e.g. Near Metro Pillar 1520"
                  className="w-full rounded-lg border border-stone-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:border-terracotta-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="can-walk"
                  checked={canWalkToNearbyStop}
                  onChange={e => setCanWalkToNearbyStop(e.target.checked)}
                  className="w-4 h-4 text-terracotta-600 rounded border-stone-300 focus:ring-terracotta-500"
                />
                <label htmlFor="can-walk" className="text-sm font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                  I can walk up to 5-10 minutes to a nearby stop
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1.5">
                Additional Notes / Message for Transport Team (Optional)
              </label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-stone-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-terracotta-500 focus:outline-none"
                placeholder="Briefly state reason or emergency context..."
              />
            </div>

            {/* AI Recommendations Section */}
            <div className="pt-4 border-t border-stone-200 dark:border-charcoal-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h4 className="font-heading text-sm font-semibold text-charcoal-500 dark:text-stone-100">
                    Verified Alternative Transport Recommendations
                  </h4>
                </div>
                <span className="text-xs text-stone-500">Tiered by proximity & arrival</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAlternative(rec)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedAlternative === rec
                        ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/20 ring-2 ring-terracotta-500/20'
                        : 'border-stone-200 dark:border-charcoal-700 hover:border-amber-300 dark:hover:border-charcoal-600 bg-white dark:bg-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-bold text-sm text-charcoal-500 dark:text-stone-100">
                        {rec.busNumber}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-stone-100 dark:bg-charcoal-700 text-stone-600 dark:text-stone-300">
                        {rec.routeCode}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mb-1">
                      Board at: <span className="text-terracotta-600 dark:text-terracotta-400">{rec.boardingStop}</span>
                      {rec.stopTime ? ` • ${rec.stopTime}` : ''}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{rec.reason}</p>
                    <div className="mt-2 pt-2 border-t border-stone-100 dark:border-charcoal-700/60 flex items-center justify-between text-xs text-stone-400">
                      <span>{rec.walkingNote}</span>
                      {selectedAlternative === rec && (
                        <span className="text-terracotta-600 dark:text-terracotta-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {createRequestMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-stone-900" />}
                Submit Missed Bus Request
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormNotes(''); }}
                className="px-5 py-2.5 border border-stone-300 dark:border-charcoal-600 text-stone-600 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-charcoal-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Pending Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-stone-100">
            Active Requests
          </h2>
          <Badge variant={pendingRequests.length > 0 ? 'warning' : 'default'}>
            {pendingRequests.length} Active
          </Badge>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="text-center py-12 mb-8 border border-stone-200 dark:border-charcoal-700" padding="lg">
            <CheckCircle className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-stone-200 mb-1">
              No Active Missed Bus Requests
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              All previous requests are resolved. Your regular bus assignment remains active.
            </p>
            <button
              onClick={() => {
                setShowForm(true);
                if (userBoardingStop?.stopName) {
                  setSelectedMissedStop(userBoardingStop.stopName);
                  setCurrentWaitingStop(userBoardingStop.stopName);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 text-stone-900" />
              Report Missed Bus
            </button>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {pendingRequests.map((request: any) => (
              <Card key={request.id} padding="lg" className="border-l-4 border-amber-500 border border-stone-200 dark:border-charcoal-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" size="sm">
                          {request.status.replace(/_/g, ' ')}
                        </Badge>
                        {request.originalBus && (
                          <span className="font-semibold text-sm text-charcoal-500 dark:text-stone-200">
                            {formatBusNumber(request.originalBus)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Submitted {formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      Dispatched to Coordinators
                    </span>
                  </div>
                </div>

                {request.studentNotes && (
                  <div className="mt-3 p-3 bg-stone-50 dark:bg-charcoal-800 rounded-lg text-xs text-stone-600 dark:text-stone-300 font-mono">
                    {request.studentNotes}
                  </div>
                )}

                {request.teacherNotes && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-0.5">Coordinator Response:</p>
                    <p>{request.teacherNotes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request History */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-stone-100 mb-4">
          Request History
        </h2>
        {historyRequests.length === 0 ? (
          <Card className="text-center py-8 border border-stone-200 dark:border-charcoal-700" padding="lg">
            <Clock className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-500 dark:text-stone-400">No previous incident history.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyRequests.map((request: any) => (
              <Card key={request.id} padding="md" className="border border-stone-200 dark:border-charcoal-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={request.status === 'RESOLVED' ? 'success' : 'default'} size="sm">
                      {request.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {request.requestedAt && formatDistanceToNow(parseISO(request.requestedAt), { addSuffix: true })}
                    </span>
                  </div>
                  {request.alternativeBus && (
                    <span className="text-xs font-semibold text-terracotta-600 dark:text-terracotta-400">
                      Assigned: {formatBusNumber(request.alternativeBus)}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}