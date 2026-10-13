import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Plus, Shield, HeartPulse, Car, AlertTriangle, Bus, HelpCircle, Loader2, MapPin } from 'lucide-react';
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
  respondingAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  emergencyServicesContacted: boolean;
  emergencyContactNotified: boolean;
  teacherNotified: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MEDICAL_EMERGENCY: HeartPulse,
  ACCIDENT: Car,
  SAFETY_ISSUE: AlertTriangle,
  BUS_BREAKDOWN: Bus,
  OTHER: HelpCircle,
};

const categoryColors: Record<string, string> = {
  MEDICAL_EMERGENCY: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  ACCIDENT: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
  SAFETY_ISSUE: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300',
  BUS_BREAKDOWN: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  OTHER: 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',
  ACKNOWLEDGED: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
  RESPONDING: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
  RESOLVED: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',
};

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

function getCategoryIcon(category: string) {
  const Icon = categoryIcons[category];
  return Icon ? <Icon className="h-6 w-6" /> : <span className="text-xs font-bold">SOS</span>;
}

export function StudentSOSPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'MEDICAL_EMERGENCY' | 'ACCIDENT' | 'SAFETY_ISSUE' | 'BUS_BREAKDOWN' | 'OTHER'>('MEDICAL_EMERGENCY');
  const [description, setDescription] = useState('');
  const [useLocation, setUseLocation] = useState(true);

  const { data: sosRequests, isLoading, error } = useQuery({
    queryKey: ['student-sos'],
    queryFn: () => api.getStudentSOS(),
  });

  const createSOSMutation = useMutation({
    mutationFn: async (data: { category: string; description: string; latitude?: number; longitude?: number }) => {
      return api.postStudentSOS(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-sos'] });
      setShowForm(false);
      setDescription('');
      setSelectedCategory('MEDICAL_EMERGENCY');
    },
  });

  const sosData: SOSRequest[] = Array.isArray(sosRequests) ? (sosRequests as SOSRequest[]) : (((sosRequests as any)?.content) || []);
  const activeSOS = sosData.filter((s: SOSRequest) => s.status !== 'RESOLVED');

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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load SOS requests</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleLocationCapture = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        console.log('Location captured:', pos.coords.latitude, pos.coords.longitude);
      },
      err => {
        console.error('Location error:', err);
        alert('Could not get your location. Please enable location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    createSOSMutation.mutate({
      category: selectedCategory,
      description,
      latitude: useLocation ? undefined : undefined,
      longitude: useLocation ? undefined : undefined,
    });
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">SOS Emergency</h1>
          <p className="text-stone-600 mt-1">Trigger emergency alerts and track your safety requests.</p>
        </div>
        {activeSOS.length === 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Trigger SOS
          </button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-charcoal-500">Trigger Emergency SOS</h3>
            <button onClick={() => setShowForm(false)} className="p-2 text-stone-500 hover:text-stone-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Emergency Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: HeartPulse },
                  { value: 'ACCIDENT', label: 'Accident', icon: Car },
                  { value: 'SAFETY_ISSUE', label: 'Safety Issue', icon: AlertTriangle },
                  { value: 'BUS_BREAKDOWN', label: 'Bus Breakdown', icon: Bus },
                  { value: 'OTHER', label: 'Other', icon: HelpCircle },
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value as any)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      selectedCategory === cat.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                        : 'border-stone-200 dark:border-slate-800 hover:border-terracotta-300 dark:hover:border-terracotta-500/50 dark:bg-[#111827]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 
                        selectedCategory === cat.value ? 'bg-red-100 dark:bg-red-950/50' : 'bg-stone-100 dark:bg-slate-800'
                      )}>
                        <cat.icon className={cn('h-5 w-5', selectedCategory === cat.value ? 'text-red-600 dark:text-red-400' : 'text-stone-500 dark:text-slate-400')} />
                      </div>
                      <span className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">Description (Required)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
                placeholder="Describe the emergency situation, your location, number of people involved, and any immediate dangers..."
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={e => setUseLocation(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-terracotta-500 focus:ring-terracotta-500"
                />
                <span className="text-sm text-stone-700 dark:text-slate-300">Include my current location (GPS)</span>
              </label>
              <button
                type="button"
                onClick={handleLocationCapture}
                className="px-3 py-1.5 text-sm text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 underline"
              >
                <MapPin className="h-4 w-4 mr-1" /> Use Current Location
              </button>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={!description.trim() || createSOSMutation.isPending}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createSOSMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                Trigger Emergency SOS
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setDescription(''); }}
                className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Active SOS Alerts */}
      {activeSOS.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">Active SOS Alerts</h2>
            <Badge variant="danger">{activeSOS.length}</Badge>
          </div>
          <div className="space-y-4">
            {activeSOS.map((sos: SOSRequest) => (
              <Card key={sos.id} padding="lg" className="border-l-4 border-red-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center',
                      sos.category === 'MEDICAL_EMERGENCY' ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400' :
                      sos.category === 'ACCIDENT' ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400' :
                      sos.category === 'SAFETY_ISSUE' ? 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400' :
                      sos.category === 'BUS_BREAKDOWN' ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
                      'bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                    )}>
                      {getCategoryIcon(sos.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            sos.status === 'OPEN' ? 'danger' :
                            sos.status === 'ACKNOWLEDGED' ? 'warning' :
                            sos.status === 'RESPONDING' ? 'info' :
                            'success'
                          } 
                          size="sm"
                        >{sos.status}</Badge>
                        <Badge 
                          variant={
                            sos.category === 'MEDICAL_EMERGENCY' ? 'danger' :
                            sos.category === 'ACCIDENT' ? 'warning' :
                            sos.category === 'SAFETY_ISSUE' ? 'warning' :
                            sos.category === 'BUS_BREAKDOWN' ? 'info' :
                            'default'
                          } 
                          size="sm"
                        >{sos.category.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
                        Triggered {formatDistanceToNow(parseISO(sos.triggeredAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 md:items-end">
                    <div className="text-right">
                      <p className="text-xs text-stone-500 dark:text-slate-400">Status Updates</p>
                      <div className="flex gap-1 mt-1">
                        {sos.acknowledgedAt && <Badge variant="warning" size="sm">Acknowledged</Badge>}
                        {sos.respondingAt && <Badge variant="info" size="sm">Responding</Badge>}
                        {sos.emergencyServicesContacted && <Badge variant="danger" size="sm">Emergency Services</Badge>}
                        {sos.emergencyContactNotified && <Badge variant="default" size="sm">Emergency Contact</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                {sos.description && (
                  <div className="mt-4 p-4 bg-stone-50 dark:bg-[#111827] rounded-lg">
                    <p className="text-xs text-stone-500 dark:text-slate-400 font-medium mb-1">Description</p>
                    <p className="text-stone-700 dark:text-slate-300">{sos.description}</p>
                  </div>
                )}

                {sos.latitude && sos.longitude && (
                  <div className="mt-4 p-4 bg-stone-50 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-terracotta-500" />
                      <span className="text-xs text-stone-500 dark:text-slate-400 font-medium">Live Location</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                        <p className="text-xs text-stone-500 dark:text-slate-400">Latitude</p>
                        <p className="font-mono text-lg font-medium text-charcoal-500 dark:text-[#F1F5F9]">{sos.latitude}</p>
                      </div>
                      <div className="bg-white dark:bg-[#182235] rounded-lg p-3 border border-stone-200 dark:border-slate-700">
                        <p className="text-xs text-stone-500 dark:text-slate-400">Longitude</p>
                        <p className="font-mono text-lg font-medium text-charcoal-500 dark:text-[#F1F5F9]">{sos.longitude}</p>
                      </div>
                    </div>
                    {sos.locationAccuracy && (
                      <p className="mt-2 text-xs text-stone-500 dark:text-slate-400">Accuracy: ±{Math.round(sos.locationAccuracy)} meters</p>
                    )}
                  </div>
                )}

                {sos.resolutionNotes && sos.status === 'RESOLVED' && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/50">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Resolution</p>
                    <p className="text-green-800 dark:text-green-300">{sos.resolutionNotes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9] mb-4">SOS History</h2>
        {sosData.filter((s: SOSRequest) => s.status === 'RESOLVED').length === 0 ? (
          <Card className="text-center py-8">
            <Shield className="h-12 w-12 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-[#F1F5F9] mb-2">No Resolved SOS</h3>
            <p className="text-stone-500 dark:text-slate-400">Your resolved SOS requests will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sosData.filter((s: SOSRequest) => s.status === 'RESOLVED').map((sos: SOSRequest) => (
              <Card key={sos.id} padding="lg" className="opacity-70">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">Resolved</Badge>
                        <Badge variant={categoryColors[sos.category] ? 'default' : 'default'} size="sm" className={categoryColors[sos.category]}>{sos.category.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
                        Triggered {formatDistanceToNow(parseISO(sos.triggeredAt), { addSuffix: true })}
                        • Resolved {formatDistanceToNow(parseISO(sos.resolvedAt!), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right md:ml-auto">
                    {sos.resolutionNotes && (
                      <div className="text-right max-w-xs">
                        <p className="text-xs text-stone-500 dark:text-slate-400 mb-1">Resolution</p>
                        <p className="text-sm text-green-800 dark:text-green-300">{sos.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {sos.description && (
                  <div className="mt-4 p-4 bg-stone-50 dark:bg-[#111827] rounded-lg">
                    <p className="text-xs text-stone-500 dark:text-slate-400 font-medium mb-1">Description</p>
                    <p className="text-stone-700 dark:text-slate-300">{sos.description}</p>
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
