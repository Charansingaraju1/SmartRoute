import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus, MapPin, Users, Settings, Search, Filter, ChevronDown, ChevronUp, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Bus {
  id: string;
  registrationNumber: string;
  busNumber?: string;
  capacity: number;
  model?: string;
  fuelType?: string;
  manufactureYear?: number;
  driverName?: string;
  driverPhone?: string;
  conductorName?: string;
  conductorPhone?: string;
  active: boolean;
  gpsDeviceId?: string;
  lastLocationLat?: number;
  lastLocationLng?: number;
  lastLocationAt?: string;
  currentStudentsCount: number;
  availableCapacity: number;
  route?: {
    id: string;
    routeCode: string;
    routeName?: string;
    direction: string;
  };
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

function BusCard({ bus, isExpanded, onToggleExpand }: { bus: Bus; isExpanded: boolean; onToggleExpand: () => void }) {
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
              {bus.busNumber && (
                <Badge variant="secondary" size="sm">{bus.busNumber}</Badge>
              )}
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
              <Badge variant={bus.active ? 'success' : 'danger'} size="sm">
                {bus.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-stone-600 ml-4">
          {bus.driverName && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Driver: {bus.driverName}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg text-stone-500 hover:text-charcoal-500 dark:hover:text-[#F1F5F9] hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse bus details' : 'Expand bus details'}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-[#334155] animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Capacity</p>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">{bus.capacity}</p>
                <p className="text-sm text-stone-500 dark:text-slate-400">seats</p>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Current Students</p>
              <p className="font-mono text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">{bus.currentStudentsCount}</p>
            </div>
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Available</p>
              <p className="font-mono text-2xl font-bold text-green-600 dark:text-emerald-400">{bus.availableCapacity}</p>
            </div>
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-1">Utilization</p>
              <p className="font-mono text-2xl font-bold text-terracotta-600 dark:text-terracotta-400">
                {bus.capacity > 0 ? Math.round((bus.currentStudentsCount / bus.capacity) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Driver</p>
              {bus.driverName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta-100 dark:bg-terracotta-950/60 flex items-center justify-center">
                    <Users className="h-5 w-5 text-terracotta-600 dark:text-terracotta-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{bus.driverName}</p>
                    {bus.driverPhone && <p className="text-sm text-stone-500 dark:text-slate-400">{bus.driverPhone}</p>}
                  </div>
                </div>
              )}
              {!bus.driverName && <p className="text-stone-500 dark:text-slate-400">Not assigned</p>}
            </div>
            <div className="bg-stone-50 dark:bg-[#111827] rounded-xl p-4 border border-stone-200 dark:border-slate-800">
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Conductor</p>
              {bus.conductorName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{bus.conductorName}</p>
                    {bus.conductorPhone && <p className="text-sm text-stone-500 dark:text-slate-400">{bus.conductorPhone}</p>}
                  </div>
                </div>
              )}
              {!bus.conductorName && <p className="text-stone-500 dark:text-slate-400">Not assigned</p>}
            </div>
          </div>

          <div className="border-t border-stone-200 dark:border-[#334155] pt-4">
            <h4 className="font-medium text-charcoal-500 dark:text-[#F1F5F9] mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-terracotta-500" />
              Bus Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {bus.model && <div><p className="text-xs text-stone-500 dark:text-slate-400">Model</p><p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{bus.model}</p></div>}
              {bus.fuelType && <div><p className="text-xs text-stone-500 dark:text-slate-400">Fuel Type</p><p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{bus.fuelType}</p></div>}
              {bus.manufactureYear && <div><p className="text-xs text-stone-500 dark:text-slate-400">Year</p><p className="font-medium text-charcoal-500 dark:text-[#F1F5F9]">{bus.manufactureYear}</p></div>}
              {bus.gpsDeviceId && <div><p className="text-xs text-stone-500 dark:text-slate-400">GPS Device</p><p className="font-mono text-charcoal-500 dark:text-[#F1F5F9]">{bus.gpsDeviceId}</p></div>}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit
            </button>
            <button className="px-4 py-2 border border-stone-300 dark:border-slate-700 text-stone-600 dark:text-slate-300 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> View Students
            </button>
            <button className="px-4 py-2 border border-red-300 dark:border-rose-800 text-red-600 dark:text-rose-400 rounded-lg hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors text-sm font-medium flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Deactivate
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function TeacherBusesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'registration' | 'capacity' | 'students'>('registration');
  const [expandedBuses, setExpandedBuses] = useState<Set<string>>(new Set());

  const { data: buses, isLoading, error } = useQuery({
    queryKey: ['teacher-buses'],
    queryFn: () => api.getTeacherBuses(),
  });

  const busesData = buses || [];

  const filteredBuses = busesData.filter(bus => {
    if (search && !bus.registrationNumber.toLowerCase().includes(search.toLowerCase()) &&
        !bus.busNumber?.toLowerCase().includes(search.toLowerCase()) &&
        !bus.driverName?.toLowerCase().includes(search.toLowerCase()) &&
        !bus.route?.routeCode.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter === 'active' && !bus.active) return false;
    if (statusFilter === 'inactive' && bus.active) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'registration') return a.registrationNumber.localeCompare(b.registrationNumber);
    if (sortBy === 'capacity') return b.capacity - a.capacity;
    if (sortBy === 'students') return b.currentStudentsCount - a.currentStudentsCount;
    return 0;
  });

  const toggleExpand = (busId: string) => {
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
          <div className="h-12 w-12 text-red-500 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-6 h-6" style={{ border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%' }} />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load buses</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-500">Bus Management</h1>
          <p className="text-stone-600 mt-1">View and manage all university transport buses.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'registration' | 'capacity' | 'students')}
            className="px-4 py-2 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
          >
            <option value="registration">Sort by Registration</option>
            <option value="capacity">Sort by Capacity</option>
            <option value="students">Sort by Students</option>
          </select>
        </div>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by registration, bus number, driver, route..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#111827] text-sm text-stone-900 dark:text-[#F1F5F9] placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {filteredBuses.length === 0 ? (
        <Card className="text-center py-12">
          <Bus className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 mb-2">No buses found</h3>
          <p className="text-stone-500">Try adjusting your search or filters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBuses.map((bus) => {
            const isExpanded = expandedBuses.has(bus.id);
            return (
              <BusCard
                key={bus.id}
                bus={bus}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpand(bus.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}