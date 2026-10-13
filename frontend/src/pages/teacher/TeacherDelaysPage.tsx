import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, AlertCircle, Plus, ChevronDown, ChevronUp, Edit, Eye, Loader2, MapPin, Bus, Clock as ClockIcon, X } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Delay {
  id: string;
  bus: { id: string; registrationNumber: string; route?: { routeCode: string; routeName?: string } };
  route?: { id: string; routeCode: string; routeName?: string };
  status: 'PUBLISHED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  delayMinutes: number;
  expectedArrivalTime?: string;
  reason?: string;
  notes?: string;
  publishedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  autoExpireAt?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherDelaysPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDelay, setEditingDelay] = useState<Delay | null>(null);
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    delayMinutes: 0,
    expectedArrivalTime: '',
    reason: '',
    notes: '',
  });

  const { data: delays, isLoading, error } = useQuery({
    queryKey: ['teacher-delays'],
    queryFn: () => api.getTeacherDelays(),
  });

  const createDelayMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.postTeacherDelay(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-delays'] });
      setShowForm(false);
      setFormData({ busId: '', routeId: '', delayMinutes: 0, expectedArrivalTime: '', reason: '', notes: '' });
    },
  });

  const updateDelayMutation = useMutation({
    mutationFn: async (data: any) => {
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-delays'] });
      setEditingDelay(null);
      setFormData({ busId: '', routeId: '', delayMinutes: 0, expectedArrivalTime: '', reason: '', notes: '' });
    },
  });

  const resolveDelayMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.resolveDelay(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-delays'] });
    },
  });

  const delaysData: Delay[] = Array.isArray(delays) ? (delays as Delay[]) : (((delays as any)?.content) || []);
  const activeDelays = delaysData.filter((d: Delay) => d.status === 'PUBLISHED' || d.status === 'ACKNOWLEDGED');
  const historyDelays = delaysData.filter((d: Delay) => d.status === 'RESOLVED' || d.status === 'CANCELLED');

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load delays</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleOpenForm = (delay?: Delay) => {
    if (delay) {
      setEditingDelay(delay);
      setFormData({
        busId: delay.bus.id,
        routeId: delay.route?.id || '',
        delayMinutes: delay.delayMinutes,
        expectedArrivalTime: delay.expectedArrivalTime || '',
        reason: delay.reason || '',
        notes: delay.notes || '',
      });
    } else {
      setEditingDelay(null);
      setFormData({ busId: '', routeId: '', delayMinutes: 0, expectedArrivalTime: '', reason: '', notes: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDelay) {
      updateDelayMutation.mutate({ ...formData, id: editingDelay.id });
    } else {
      createDelayMutation.mutate(formData);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Delay Management</h1>
          <p className="text-stone-600 mt-1">Publish and manage bus delay alerts for students.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Publish Delay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-orange-50 border-orange-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Published</p>
              <p className="font-heading text-3xl font-bold text-orange-600">{delaysData.filter((d: Delay) => d.status === 'PUBLISHED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600" />
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Acknowledged</p>
              <p className="font-heading text-3xl font-bold text-blue-600">{delaysData.filter((d: Delay) => d.status === 'ACKNOWLEDGED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Resolved</p>
              <p className="font-heading text-3xl font-bold text-green-600">{delaysData.filter((d: Delay) => d.status === 'RESOLVED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-green-600" />
          </div>
        </Card>
        <Card className="bg-stone-50 border-stone-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Total Published</p>
              <p className="font-heading text-3xl font-bold text-charcoal-500">{delaysData.filter((d: Delay) => d.status !== 'CANCELLED').length}</p>
            </div>
            <Clock className="h-12 w-12 text-terracotta-500" />
          </div>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-stone-50 dark:bg-[#182235] border border-transparent dark:border-[#334155] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-xl">
            <div className="p-6 border-b border-stone-200 dark:border-[#334155] sticky top-0 bg-stone-50 dark:bg-[#182235] flex items-center justify-between z-10">
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">{editingDelay ? 'Edit Delay' : 'Publish Delay Alert'}</h2>
              <button onClick={() => { setShowForm(false); setEditingDelay(null); setFormData({ busId: '', routeId: '', delayMinutes: 0, expectedArrivalTime: '', reason: '', notes: '' }); }} className="p-2 text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Bus *</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  >
                    <option value="">Select Bus</option>
                    <option value="bus-1">Bus TS08 UK 1234 - Route A1</option>
                    <option value="bus-2">Bus TS08 UK 5678 - Route B2</option>
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
                    <option value="route-2">Route B2 - Evening</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Delay Minutes *</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.delayMinutes}
                    onChange={e => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Expected Arrival Time</label>
                  <input
                    type="time"
                    value={formData.expectedArrivalTime}
                    onChange={e => setFormData({ ...formData, expectedArrivalTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  required
                  className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  placeholder="Enter the reason for the delay (e.g., traffic, breakdown, weather)..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  placeholder="Additional information for students..."
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-[#334155]">
                <button type="submit" disabled={createDelayMutation.isPending || updateDelayMutation.isPending} className="flex-1 px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {createDelayMutation.isPending || updateDelayMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingDelay ? 'Update Delay' : 'Publish Delay'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingDelay(null); setFormData({ busId: '', routeId: '', delayMinutes: 0, expectedArrivalTime: '', reason: '', notes: '' }); }} className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
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