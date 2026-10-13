import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Settings, Bus, MapPin, Wrench, Users, Clock, Plus, Search, ChevronDown, ChevronUp, Edit, Eye, Loader2, Map, Shield, AlertTriangle, Bell, Trash2, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TransportOps {
  id: string;
  type: 'BUS_ASSIGNMENT' | 'ROUTE_CHANGE' | 'STOP_CHANGE' | 'SCHEDULE_CHANGE' | 'CAPACITY_ADJUSTMENT' | 'EMERGENCY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  title: string;
  description?: string;
  affectedBus?: { id: string; registrationNumber: string };
  affectedRoute?: { routeCode: string; routeName?: string };
  affectedStop?: { id: string; stopName: string };
  assignedTo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherTransportOpsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingOp, setEditingOp] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    type: 'BUS_ASSIGNMENT',
    title: '',
    description: '',
    priority: 'MEDIUM',
    busId: '',
    routeId: '',
    stopId: '',
  });

  const { data: ops, isLoading, error } = useQuery({
    queryKey: ['teacher-transport-ops'],
    queryFn: () => api.getTeacherTransportOps(),
  });

  const opsData = Array.isArray(ops) ? ops : [];
  const isSummary = ops && typeof ops === 'object' && !Array.isArray(ops);

  const toggleForm = (op?: any) => {
    if (op) {
      setEditingOp(op);
      setFormData({
        type: op.type,
        title: op.title,
        description: op.description || '',
        priority: op.priority,
        busId: op.affectedBus?.id || '',
        routeId: op.affectedRoute?.id || '',
        stopId: op.affectedStop?.id || '',
      });
    } else {
      setEditingOp(null);
      setFormData({ type: 'BUS_ASSIGNMENT', title: '', description: '', priority: 'MEDIUM', busId: '', routeId: '', stopId: '' });
    }
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ type: 'BUS_ASSIGNMENT', title: '', description: '', priority: 'MEDIUM', busId: '', routeId: '', stopId: '' });
    setEditingOp(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOp) {
      // TODO: update mutation
    } else {
      // TODO: create mutation
    }
    setShowForm(false);
  };

  const pendingOps = opsData.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS');

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load operations</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Transport Operations</h1>
          <p className="text-stone-600 mt-1">Manage transport operations and tasks.</p>
        </div>
        <button onClick={() => toggleForm()} className="px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Operation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-yellow-50 border-yellow-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Active Delays</p>
              <p className="font-heading text-3xl font-bold text-yellow-600">{isSummary ? ((ops as any).activeDelays ?? 0) : opsData.filter(o => o.status === 'PENDING').length}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Active Disruptions</p>
              <p className="font-heading text-3xl font-bold text-blue-600">{isSummary ? ((ops as any).activeDisruptions ?? 0) : opsData.filter(o => o.status === 'IN_PROGRESS').length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Active SOS Alerts</p>
              <p className="font-heading text-3xl font-bold text-red-600">{isSummary ? ((ops as any).activeSOSRequests ?? 0) : opsData.filter(o => o.status === 'COMPLETED').length}</p>
            </div>
            <Shield className="h-12 w-12 text-red-600" />
          </div>
        </Card>
        <Card className="bg-stone-50 border-stone-200" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Assigned Buses</p>
              <p className="font-heading text-3xl font-bold text-charcoal-500">{isSummary ? ((ops as any).totalAssignedBuses ?? 0) : opsData.length}</p>
            </div>
            <Bus className="h-12 w-12 text-terracotta-500" />
          </div>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-stone-50 dark:bg-[#182235] border border-transparent dark:border-[#334155] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-xl">
            <div className="p-6 border-b border-stone-200 dark:border-[#334155] sticky top-0 bg-stone-50 dark:bg-[#182235] flex items-center justify-between z-10">
              <h2 className="font-heading text-xl font-semibold text-charcoal-500 dark:text-[#F1F5F9]">New Transport Operation</h2>
              <button onClick={handleCancel} className="p-2 text-stone-500 hover:text-stone-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Operation Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  >
                    <option value="BUS_ASSIGNMENT">Bus Assignment</option>
                    <option value="ROUTE_CHANGE">Route Change</option>
                    <option value="STOP_CHANGE">Stop Change</option>
                    <option value="SCHEDULE_CHANGE">Schedule Change</option>
                    <option value="CAPACITY_ADJUSTMENT">Capacity Adjustment</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                  required
                  placeholder="Operation title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] px-4 py-2.5 text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 focus:bg-stone-50 dark:focus:bg-[#111827] focus:outline-none"
                  placeholder="Describe the operation..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Affected Bus (Optional)</label>
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
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Affected Route (Optional)</label>
                  <select
                    value={formData.routeId}
                    onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                  >
                    <option value="">Select Route</option>
                    <option value="route-1">Route A1 - Morning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-1">Affected Stop (Optional)</label>
                  <select
                    value={formData.stopId}
                    onChange={e => setFormData({ ...formData, stopId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                  >
                    <option value="">Select Stop</option>
                    <option value="stop-1">Stop 1 - Main Gate</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-[#334155]">
                <button type="submit" className="flex-1 px-6 py-3 bg-terracotta-500 text-stone-50 rounded-lg font-medium hover:bg-terracotta-400 transition-colors flex items-center justify-center gap-2">
                  Create Operation
                </button>
                <button type="button" onClick={handleCancel} className="px-6 py-3 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
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