import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, HeartPulse, Car, AlertTriangle, Bus, HelpCircle, MapPin, Loader2, Check, X, MessageSquare, Eye, Shield, Clock, User, XCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SOSRequest {
  id: string;
  category: 'MEDICAL_EMERGENCY' | 'ACCIDENT' | 'SAFETY_ISSUE' | 'BUS_BREAKDOWN' | 'OTHER';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED';
  description?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  locationAt?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  respondingAt?: string;
  respondingBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  teacherNotes?: string;
  emergencyServicesContacted: boolean;
  emergencyContactNotified: boolean;
  teacherNotified: boolean;
  student: {
    id: string;
    user: { name: string; email: string };
    studentId?: string;
    bus?: { registrationNumber: string; route?: { routeCode: string } };
  };
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MEDICAL_EMERGENCY: HeartPulse,
  ACCIDENT: Car,
  SAFETY_ISSUE: AlertTriangle,
  BUS_BREAKDOWN: Bus,
  OTHER: HelpCircle,
};

const categoryVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  MEDICAL_EMERGENCY: 'danger',
  ACCIDENT: 'warning',
  SAFETY_ISSUE: 'warning',
  BUS_BREAKDOWN: 'info',
  OTHER: 'default',
};

const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  OPEN: 'danger',
  ACKNOWLEDGED: 'warning',
  RESPONDING: 'info',
  RESOLVED: 'success',
};

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherSOSPage() {
  const queryClient = useQueryClient();
  const [selectedSOS, setSelectedSOS] = useState<SOSRequest | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: sosRequests, isLoading, error } = useQuery({
    queryKey: ['teacher-sos'],
    queryFn: () => api.getTeacherSOS(),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.acknowledgeSOS(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sos'] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.respondSOS(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sos'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return api.resolveSOS(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sos'] });
      setSelectedSOS(null);
      setResolutionNotes('');
    },
  });

  const sosData: SOSRequest[] = Array.isArray(sosRequests) ? (sosRequests as SOSRequest[]) : (((sosRequests as any)?.content) || []);
  const activeSOS = sosData.filter((s: SOSRequest) => s.status !== 'RESOLVED');
  const historySOS = sosData.filter((s: SOSRequest) => s.status === 'RESOLVED');

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
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load SOS alerts</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleSelectSOS = (sos: SOSRequest) => {
    setSelectedSOS(sos);
    setTeacherNotes(sos.teacherNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedSOS(null);
    setResolutionNotes('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MEDICAL_EMERGENCY': return 'bg-red-100';
      case 'ACCIDENT': return 'bg-orange-100';
      case 'SAFETY_ISSUE': return 'bg-yellow-100';
      case 'BUS_BREAKDOWN': return 'bg-blue-100';
      default: return 'bg-purple-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MEDICAL_EMERGENCY': return HeartPulse;
      case 'ACCIDENT': return Car;
      case 'SAFETY_ISSUE': return AlertTriangle;
      case 'BUS_BREAKDOWN': return Bus;
      default: return HelpCircle;
    }
  };

  const renderSOSModal = () => {
    if (!selectedSOS) return null;

    const Icon = categoryIcons[selectedSOS.category] || HelpCircle;
    const categoryColor = categoryVariants[selectedSOS.category] || 'default';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-stone-50 dark:bg-[#182235] border border-transparent dark:border-[#334155] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-xl">
          <div className="p-6 border-b border-stone-200 dark:border-[#334155] sticky top-0 bg-stone-50 dark:bg-[#182235] flex items-center justify-between z-10">
            <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">SOS Alert Details</h2>
            <button onClick={() => { setSelectedSOS(null); setResolutionNotes(''); }} className="p-2 text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryVariants[selectedSOS.category] || 'bg-purple-100'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">{selectedSOS.category.replace(/_/g, ' ')}</Badge>
                    <Badge variant="danger" size="sm">{selectedSOS.status}</Badge>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
                    Triggered {formatDistanceToNow(parseISO(selectedSOS.triggeredAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Badge variant={statusVariants[selectedSOS.status] || 'default'} size="sm">
                {selectedSOS.status}
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
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{selectedSOS.student.user.name}</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400">{selectedSOS.student.user.email}</p>
                    {selectedSOS.student.studentId && <p className="text-xs text-stone-500 dark:text-slate-400 font-mono">ID: {selectedSOS.student.studentId}</p>}
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Bus</p>
                <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedSOS.student.bus?.registrationNumber || 'Unknown'}</p>
                {selectedSOS.student.bus?.route && <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Route: {selectedSOS.student.bus.route.routeCode}</p>}
              </div>
            </div>

            {selectedSOS.description && (
              <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-stone-700 dark:text-slate-300">{selectedSOS.description}</p>
              </div>
            )}

            {selectedSOS.latitude && selectedSOS.longitude && (
              <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
                <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Live Location</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                    <p className="text-xs text-stone-500 dark:text-slate-400">Latitude</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedSOS.latitude}</p>
                  </div>
                  <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                    <p className="text-xs text-stone-500 dark:text-slate-400">Longitude</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-[#F1F5F9]">{selectedSOS.longitude}</p>
                  </div>
                </div>
                {selectedSOS.locationAccuracy && (
                  <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">Accuracy: ±{Math.round(selectedSOS.locationAccuracy)} meters</p>
                )}
              </div>
            )}

            <div className="border-t border-stone-200 dark:border-[#334155] pt-6">
              <h3 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-terracotta-500" />
                Response & Resolution
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-emerald-950/40 rounded-lg border border-green-200 dark:border-emerald-800/60">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs text-green-700 dark:text-emerald-300">Emergency Services</p>
                      <p className={`font-medium ${selectedSOS.emergencyServicesContacted ? 'text-green-700 dark:text-emerald-300' : 'text-stone-500 dark:text-slate-400'}`}>
                        {selectedSOS.emergencyServicesContacted ? 'Contacted' : 'Not Contacted'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800/60">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Emergency Contact</p>
                      <p className={`font-medium ${selectedSOS.emergencyContactNotified ? 'text-blue-700 dark:text-blue-300' : 'text-stone-500 dark:text-slate-400'}`}>
                        {selectedSOS.emergencyContactNotified ? 'Notified' : 'Not Notified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-stone-100 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700">
                    <User className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                    <div>
                      <p className="text-xs text-stone-600 dark:text-stone-400">Teacher Notified</p>
                      <p className={`font-medium ${selectedSOS.teacherNotified ? 'text-stone-800 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>
                        {selectedSOS.teacherNotified ? 'Notified' : 'Not Notified'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSOS.acknowledgedAt && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200 dark:border-blue-800/60">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Acknowledged</p>
                    </div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">{formatDistanceToNow(parseISO(selectedSOS.acknowledgedAt!), { addSuffix: true })}</p>
                  </div>
                )}

                {selectedSOS.respondingAt && (
                  <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-4 border border-orange-200 dark:border-orange-800/60">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Responding</p>
                    </div>
                    <p className="font-medium text-orange-800 dark:text-orange-200">{formatDistanceToNow(parseISO(selectedSOS.respondingAt!), { addSuffix: true })}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedSOS.status === 'OPEN' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { acknowledgeMutation.mutate(selectedSOS.id); setSelectedSOS(null); }}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Acknowledge
                      </button>
                      <button
                        onClick={() => { setSelectedSOS(null); }}
                        className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {selectedSOS.status === 'ACKNOWLEDGED' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { respondMutation.mutate(selectedSOS.id); setSelectedSOS(null); }}
                        className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Mark as Responding
                      </button>
                      <button
                        onClick={() => { setSelectedSOS(null); }}
                        className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {selectedSOS.status === 'RESPONDING' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">Resolution Notes</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={e => setResolutionNotes(e.target.value)}
                          rows={4}
                          className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                          placeholder="Describe the resolution actions taken..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { resolveMutation.mutate({ id: selectedSOS.id, notes: resolutionNotes }); setSelectedSOS(null); setResolutionNotes(''); }}
                          disabled={!resolutionNotes.trim()}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => { setSelectedSOS(null); }}
                          className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">SOS Emergency Alerts</h1>
        <p className="text-stone-600 mt-1">Monitor and respond to student emergency alerts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-red-50 border-red-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Open</p>
              <p className="font-heading text-3xl font-bold text-red-600">{sosData.filter((s: SOSRequest) => s.status === 'OPEN').length}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Acknowledged</p>
              <p className="font-heading text-3xl font-bold text-orange-600">{sosData.filter((s: SOSRequest) => s.status === 'ACKNOWLEDGED').length}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-orange-600" />
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Responding</p>
              <p className="font-heading text-3xl font-bold text-blue-600">{sosData.filter((s: SOSRequest) => s.status === 'RESPONDING').length}</p>
            </div>
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Resolved</p>
              <p className="font-heading text-3xl font-bold text-green-600">{sosData.filter((s: SOSRequest) => s.status === 'RESOLVED').length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </Card>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {sosData.length === 0 ? (
        <Card className="text-center py-12">
          <Shield className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No SOS Alerts</h3>
          <p className="text-stone-500 mb-4">No emergency alerts have been triggered yet.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            {activeSOS.map((sos: SOSRequest) => (
              <Card key={sos.id} padding="md" className="border-l-4 border-red-500 cursor-pointer hover:bg-stone-50/50 transition-colors" onClick={() => handleSelectSOS(sos)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center',
                      sos.category === 'MEDICAL_EMERGENCY' ? 'bg-red-100' :
                      sos.category === 'ACCIDENT' ? 'bg-orange-100' :
                      sos.category === 'SAFETY_ISSUE' ? 'bg-yellow-100' :
                      sos.category === 'BUS_BREAKDOWN' ? 'bg-blue-100' :
                      'bg-purple-100'
                    )}>
                      {[
                        { value: 'MEDICAL_EMERGENCY', icon: HeartPulse },
                        { value: 'ACCIDENT', icon: Car },
                        { value: 'SAFETY_ISSUE', icon: AlertTriangle },
                        { value: 'BUS_BREAKDOWN', icon: Bus },
                        { value: 'OTHER', icon: HelpCircle },
                      ].find(c => c.value === sos.category)?.icon && (
                        <div className="w-6 h-6">SOS</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" size="sm">{sos.category.replace(/_/g, ' ')}</Badge>
                        <Badge variant={statusVariants[sos.status] || 'default'} size="sm">{sos.status}</Badge>
                      </div>
                      <p className="text-sm text-stone-600 mt-1">
                        Triggered {formatDistanceToNow(parseISO(sos.triggeredAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariants[sos.status] || 'default'} size="sm">
                    {sos.status}
                  </Badge>
                </div>
              </Card>
            ))}
            {historySOS.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-charcoal-500">History</h2>
                  <Badge variant="default">{historySOS.length}</Badge>
                </div>
                {historySOS.map((sos: SOSRequest) => (
                  <Card key={sos.id} padding="md" className="opacity-70">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="success" size="sm">Resolved</Badge>
                            <Badge variant={categoryVariants[sos.category] || 'default'} size="sm">{sos.category.replace(/_/g, ' ')}</Badge>
                          </div>
                          <p className="text-sm text-stone-600 mt-1">
                            Triggered {formatDistanceToNow(parseISO(sos.triggeredAt), { addSuffix: true })}
                            • Resolved {formatDistanceToNow(parseISO(sos.resolvedAt!), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
        )}
      {selectedSOS && renderSOSModal()}
    </div>
  );
}