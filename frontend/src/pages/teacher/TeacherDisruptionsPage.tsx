import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wrench, AlertTriangle, AlertCircle, Plus, ChevronDown, ChevronUp, Edit, Eye, Loader2, MapPin, Truck, Clock, Settings, X, CheckCircle, XCircle, Cloud } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Disruption {
  id: string;
  type: 'TRAFFIC' | 'ROAD_CLOSURE' | 'DIVERSION' | 'BREAKDOWN' | 'STOP_UNAVAILABLE' | 'TIMING_CHANGE' | 'WEATHER' | 'OTHER';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  title: string;
  description?: string;
  affectedArea?: string;
  alternativeRoute?: string;
  startTime: string;
  endTime?: string;
  estimatedEndTime?: string;
  severity: number;
  bus?: { id: string; registrationNumber: string; route?: { routeCode: string } };
  route?: { id: string; routeCode: string; routeName?: string };
  publishedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  teacherNotes?: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TRAFFIC: AlertTriangle,
  ROAD_CLOSURE: XCircle,
  DIVERSION: Settings,
  BREAKDOWN: AlertCircle,
  STOP_UNAVAILABLE: MapPin,
  TIMING_CHANGE: Clock,
  WEATHER: Cloud,
  OTHER: Wrench,
};

const typeColors: Record<string, string> = {
  TRAFFIC: 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/60 dark:text-amber-300',
  ROAD_CLOSURE: 'bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300',
  DIVERSION: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  BREAKDOWN: 'bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300',
  STOP_UNAVAILABLE: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  TIMING_CHANGE: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  WEATHER: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-red-100 text-red-800 dark:bg-rose-950/60 dark:text-rose-300',
  ACKNOWLEDGED: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  CANCELLED: 'bg-stone-100 text-stone-800 dark:bg-slate-800 dark:text-slate-300',
};

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherDisruptionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDisruption, setEditingDisruption] = useState<Disruption | null>(null);
  const [selectedDisruption, setSelectedDisruption] = useState<Disruption | null>(null);
  const [formData, setFormData] = useState({
    type: 'TRAFFIC',
    title: '',
    description: '',
    affectedArea: '',
    alternativeRoute: '',
    startTime: new Date().toISOString().slice(0, 16),
    estimatedEndTime: '',
    severity: 1,
    busId: '',
    routeId: '',
  });

  const { data: disruptions, isLoading, error } = useQuery({
    queryKey: ['teacher-disruptions'],
    queryFn: () => api.getTeacherDisruptions(),
  });

  const createDisruptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.postTeacherDisruption(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-disruptions'] });
      setShowForm(false);
      setFormData({ type: 'TRAFFIC', title: '', description: '', affectedArea: '', alternativeRoute: '', startTime: new Date().toISOString().slice(0, 16), estimatedEndTime: '', severity: 1, busId: '', routeId: '' });
    },
  });

  const updateDisruptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-disruptions'] });
      setEditingDisruption(null);
      setFormData({ type: 'TRAFFIC', title: '', description: '', affectedArea: '', alternativeRoute: '', startTime: new Date().toISOString().slice(0, 16), estimatedEndTime: '', severity: 1, busId: '', routeId: '' });
    },
  });

  const resolveDisruptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.resolveDisruption(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-disruptions'] });
    },
  });

  const disruptionsData: Disruption[] = Array.isArray(disruptions) ? (disruptions as Disruption[]) : (((disruptions as any)?.content) || []);
  const activeDisruptions = disruptionsData.filter((d: Disruption) => d.status === 'ACTIVE' || d.status === 'ACKNOWLEDGED');
  const historyDisruptions = disruptionsData.filter((d: Disruption) => d.status === 'RESOLVED' || d.status === 'CANCELLED');

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load disruptions</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleOpenForm = (disruption?: Disruption) => {
    if (disruption) {
      setEditingDisruption(disruption);
      setFormData({
        type: disruption.type,
        title: disruption.title,
        description: disruption.description || '',
        affectedArea: disruption.affectedArea || '',
        alternativeRoute: disruption.alternativeRoute || '',
        startTime: disruption.startTime.slice(0, 16),
        estimatedEndTime: disruption.estimatedEndTime ? disruption.estimatedEndTime.slice(0, 16) : '',
        severity: disruption.severity,
        busId: disruption.bus?.id || '',
        routeId: disruption.route?.id || '',
      });
    } else {
      setEditingDisruption(null);
      setFormData({ type: 'TRAFFIC', title: '', description: '', affectedArea: '', alternativeRoute: '', startTime: new Date().toISOString().slice(0, 16), estimatedEndTime: '', severity: 1, busId: '', routeId: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDisruption) {
      updateDisruptionMutation.mutate({ ...formData, id: editingDisruption.id });
    } else {
      createDisruptionMutation.mutate(formData);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Disruptions</h1>
          <p className="text-stone-600 mt-1">Publish and manage transport disruptions and diversions.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Publish Disruption
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-red-50 border-red-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Active</p>
              <p className="font-heading text-3xl font-bold text-red-600">{disruptionsData.filter((d: Disruption) => d.status === 'ACTIVE').length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Acknowledged</p>
              <p className="font-heading text-3xl font-bold text-orange-600">{disruptionsData.filter((d: Disruption) => d.status === 'ACKNOWLEDGED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Resolved</p>
              <p className="font-heading text-3xl font-bold text-green-600">{disruptionsData.filter((d: Disruption) => d.status === 'RESOLVED').length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </Card>
        <Card className="bg-stone-50 border-stone-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Total Published</p>
              <p className="font-heading text-3xl font-bold text-charcoal-500">{disruptionsData.filter((d: Disruption) => d.status !== 'CANCELLED').length}</p>
            </div>
            <Wrench className="h-12 w-12 text-terracotta-500" />
          </div>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-stone-50 dark:bg-[#182235] border border-transparent dark:border-[#334155] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-xl">
            <div className="p-6 border-b border-stone-200 dark:border-[#334155] sticky top-0 bg-stone-50 dark:bg-[#182235] flex items-center justify-between z-10">
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">{editingDisruption ? 'Edit Disruption' : 'Publish Disruption'}</h2>
              <button onClick={() => { setShowForm(false); setEditingDisruption(null); setFormData({ type: 'TRAFFIC', title: '', description: '', affectedArea: '', alternativeRoute: '', startTime: new Date().toISOString().slice(0, 16), estimatedEndTime: '', severity: 1, busId: '', routeId: '' }); }} className="p-2 text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  >
                    <option value="TRAFFIC">Traffic</option>
                    <option value="ROAD_CLOSURE">Road Closure</option>
                    <option value="DIVERSION">Diversion</option>
                    <option value="BREAKDOWN">Breakdown</option>
                    <option value="STOP_UNAVAILABLE">Stop Unavailable</option>
                    <option value="TIMING_CHANGE">Timing Change</option>
                    <option value="WEATHER">Weather</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Severity *</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  >
                    <option value={1}>Level 1 - Minor</option>
                    <option value={2}>Level 2 - Moderate</option>
                    <option value={3}>Level 3 - Major</option>
                    <option value={4}>Level 4 - Severe</option>
                    <option value={5}>Level 5 - Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  placeholder="Brief title for the disruption"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  placeholder="Detailed description of the disruption..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Affected Area</label>
                  <input
                    type="text"
                    value={formData.affectedArea}
                    onChange={e => setFormData({ ...formData, affectedArea: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    placeholder="Area affected by the disruption"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Alternative Route</label>
                  <input
                    type="text"
                    value={formData.alternativeRoute}
                    onChange={e => setFormData({ ...formData, alternativeRoute: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    placeholder="Alternative route for students"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Estimated End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedEndTime}
                    onChange={e => setFormData({ ...formData, estimatedEndTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Bus (Optional)</label>
                <select
                  value={formData.busId}
                  onChange={e => setFormData({ ...formData, busId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                >
                  <option value="">Select Bus</option>
                  <option value="bus-1">Bus TS08 UK 1234</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Route (Optional)</label>
                <select
                  value={formData.routeId}
                  onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                >
                  <option value="">Select Route</option>
                  <option value="route-1">Route A1 - Morning</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-[#334155]">
                <button type="submit" className="flex-1 px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2">
                  {editingDisruption ? 'Update Disruption' : 'Publish Disruption'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDisruption(null); setFormData({ type: 'TRAFFIC', title: '', description: '', affectedArea: '', alternativeRoute: '', startTime: new Date().toISOString().slice(0, 16), estimatedEndTime: '', severity: 1, busId: '', routeId: '' }); }} className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}