import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus, Users, MapPin, AlertTriangle, AlertCircle, Clock, TrendingUp, GraduationCap, Map, Wrench, Bell, Shield, Settings, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardData {
  buses: { total: number; active: number };
  routes: { total: number; active: number };
  students: { total: number; assigned: number };
  missedBus: { pending: number };
  sos: { active: number };
  delays: { active: number; recent: any[] };
  disruptions: { active: number; recent: any[] };
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const [buses, routes, missedBus, sos, delays, disruptions] = await Promise.all([
        api.getBuses().catch(() => []),
        api.getRoutes().catch(() => []),
        api.getTeacherMissedBus().catch(() => ({ content: [], totalElements: 0 })),
        api.getTeacherSOS().catch(() => []),
        api.getTeacherDelays().catch(() => []),
        api.getTeacherDisruptions().catch(() => []),
      ]);

      const busList = Array.isArray(buses) ? buses : ((buses as any)?.content || []);
      const routeList = Array.isArray(routes) ? routes : ((routes as any)?.content || []);
      const missedList = Array.isArray(missedBus) ? missedBus : ((missedBus as any)?.content || []);
      const sosList = Array.isArray(sos) ? sos : ((sos as any)?.content || []);
      const delayList = Array.isArray(delays) ? delays : ((delays as any)?.content || []);
      const disruptionList = Array.isArray(disruptions) ? disruptions : ((disruptions as any)?.content || []);

      const assignedStudents = busList.reduce((sum: number, b: any) => sum + (b.currentStudentsCount || 0), 0);
      const activeDelays = delayList.filter((d: any) => d.status === 'PUBLISHED' || d.status === 'ACTIVE');
      const activeDisruptions = disruptionList.filter(
        (d: any) => d.status === 'PUBLISHED' || d.status === 'ACTIVE' || d.status === 'ACKNOWLEDGED'
      );

      return {
        buses: { total: busList.length, active: busList.filter((b: any) => b.active !== false).length },
        routes: { total: routeList.length, active: routeList.filter((r: any) => r.active !== false).length },
        students: { total: assignedStudents, assigned: assignedStudents },
        missedBus: {
          pending: missedList.filter((m: any) => m.status === 'REQUESTED' || m.status === 'ACKNOWLEDGED').length,
        },
        sos: {
          active: sosList.filter(
            (s: any) => s.status === 'OPEN' || s.status === 'ACKNOWLEDGED' || s.status === 'RESPONDING'
          ).length,
        },
        delays: { active: activeDelays.length, recent: activeDelays.slice(0, 3) },
        disruptions: { active: activeDisruptions.length, recent: activeDisruptions.slice(0, 3) },
      } as DashboardData;
    },
  });

  const statsCards = [
    { label: 'Total Buses',   value: stats?.buses.total      ?? 'â€”', sub: `${stats?.buses.active      ?? 'â€”'} active`, icon: Bus,           color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-950/50 dark:text-terracotta-400' },
    { label: 'Total Routes',  value: stats?.routes.total     ?? 'â€”', sub: `${stats?.routes.active     ?? 'â€”'} active`, icon: MapPin,         color: 'bg-blue-100 text-blue-700 dark:bg-stone-800 dark:text-white' },
    { label: 'Students',      value: stats?.students.total   ?? 'â€”', sub: `${stats?.students.assigned ?? 'â€”'} assigned`, icon: GraduationCap, color: 'bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
    { label: 'Missed Bus',    value: stats?.missedBus.pending ?? 'â€”', sub: 'pending',                                  icon: AlertTriangle,  color: 'bg-orange-100 text-orange-700 dark:bg-amber-950/50 dark:text-amber-400' },
    { label: 'SOS Alerts',    value: stats?.sos.active       ?? 'â€”', sub: 'active',                                   icon: AlertCircle,    color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
    { label: 'Delays',        value: stats?.delays.active    ?? 'â€”', sub: 'active',                                   icon: Clock,          color: 'bg-yellow-100 text-yellow-700 dark:bg-amber-950/50 dark:text-amber-300' },
    { label: 'Disruptions',   value: stats?.disruptions.active ?? 'â€”', sub: 'active',                                 icon: Wrench,         color: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-white' },
  ];

  const quickActions = [
    { href: '/teacher/scan',         label: 'Scan Bus QR',         icon: QrCode,        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' },
    { href: '/teacher/buses',        label: 'Manage Buses',        icon: Bus,           color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-950/50 dark:text-terracotta-400' },
    { href: '/teacher/routes',       label: 'View Routes',         icon: MapPin,        color: 'bg-blue-100 text-blue-700 dark:bg-stone-800 dark:text-white' },
    { href: '/teacher/passengers',   label: 'Passenger Lists',     icon: Users,         color: 'bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
    { href: '/teacher/assignments',  label: 'Bus Assignments',     icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700 dark:bg-stone-800 dark:text-white' },
    { href: '/teacher/missed-bus',   label: 'Missed Bus',          icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 dark:bg-amber-950/50 dark:text-amber-400' },
    { href: '/teacher/delays',       label: 'Publish Delay',       icon: Clock,         color: 'bg-yellow-100 text-yellow-700 dark:bg-amber-950/50 dark:text-amber-300' },
    { href: '/teacher/disruptions',  label: 'Publish Disruption',  icon: Wrench,        color: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-white' },
    { href: '/teacher/sos',          label: 'SOS Alerts',          icon: AlertCircle,   color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
    { href: '/teacher/transport-ops',label: 'Transport Ops',       icon: Settings,      color: 'bg-gray-100 text-gray-700 dark:bg-stone-800 dark:text-white' },
    { href: '/teacher/location',     label: 'Live Location',       icon: Map,           color: 'bg-cyan-100 text-cyan-700 dark:bg-stone-800 dark:text-white' },
    { href: '/teacher/notifications',label: 'Notifications',       icon: Bell,          color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  ];

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 dark:bg-[#27272A] rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-28 bg-stone-200 dark:bg-[#27272A] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to load dashboard</h2>
          <p className="text-red-600 mb-6">Please try again later.</p>
        </div>
      </div>
    );
  }

  // Live alerts feed from real delays + disruptions
  const activeAlerts: Array<{ id: string; type: 'delay' | 'disruption'; title: string; detail: string; status: string }> = [
    ...(stats?.delays.recent ?? []).map((d: any) => ({
      id: d.id,
      type: 'delay' as const,
      title: `Delay: ${d.busRegistrationNumber ?? 'Bus'}${d.delayMinutes ? ` â€” ${d.delayMinutes} min` : ''}`,
      detail: d.reason ?? '',
      status: d.status,
    })),
    ...(stats?.disruptions.recent ?? []).map((d: any) => ({
      id: d.id,
      type: 'disruption' as const,
      title: `Disruption: ${d.title ?? d.type ?? 'Route'}`,
      detail: d.description ?? '',
      status: d.status,
    })),
  ].slice(0, 5);

  const totalActive = (stats?.delays.active ?? 0) + (stats?.disruptions.active ?? 0);

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-slate-100">Teacher Dashboard</h1>
        <p className="text-stone-600 dark:text-slate-300 mt-2 text-base">Transport operations overview and quick actions.</p>
      </div>

      {/* Stats Grid â€” all values from live API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="h-full" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <Badge variant="secondary" size="sm">{stat.sub}</Badge>
            </div>
            <h3 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-slate-100 mb-1">{stat.value}</h3>
            <p className="text-base font-medium text-stone-600 dark:text-slate-300">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card padding="lg">
            <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-stone-100 mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-terracotta-500 dark:text-terracotta-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href} className="group">
                  <button className="w-full text-left p-4 rounded-xl border border-stone-200 dark:border-[#2E2E34] hover:border-terracotta-300 dark:hover:border-terracotta-700/60 hover:bg-terracotta-50/50 dark:hover:bg-[#27272A]/70 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', action.color)}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-base text-charcoal-500 dark:text-stone-100 group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors">
                          {action.label}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">Access {action.label.toLowerCase()}</p>
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Transport Overview â€” live bus and route counts from the query */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-6 flex items-center gap-2">
              <Map className="h-5 w-5 text-terracotta-500 dark:text-terracotta-400" />
              Transport Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-50 dark:bg-[#18181B] rounded-xl p-6 border border-stone-200 dark:border-[#2E2E34]">
                <h3 className="font-semibold text-charcoal-500 dark:text-stone-100 mb-3">Fleet Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Total Buses</span>
                    <span className="font-mono text-xl font-bold text-charcoal-500 dark:text-stone-100">{stats?.buses.total ?? 'â€”'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Active</span>
                    <span className="font-mono text-xl font-bold text-green-600 dark:text-emerald-400">{stats?.buses.active ?? 'â€”'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Inactive / Untracked</span>
                    <span className="font-mono text-xl font-bold text-orange-600 dark:text-amber-400">
                      {stats ? stats.buses.total - stats.buses.active : 'â€”'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-[#18181B] rounded-xl p-6 border border-stone-200 dark:border-[#2E2E34]">
                <h3 className="font-semibold text-charcoal-500 dark:text-stone-100 mb-3">Route Coverage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Total Routes</span>
                    <span className="font-mono text-xl font-bold text-charcoal-500 dark:text-stone-100">{stats?.routes.total ?? 'â€”'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Active Routes</span>
                    <span className="font-mono text-xl font-bold text-blue-600 dark:text-stone-100">{stats?.routes.active ?? 'â€”'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600 dark:text-stone-300">Students Assigned</span>
                    <span className="font-mono text-xl font-bold text-terracotta-600 dark:text-terracotta-400">{stats?.students.assigned ?? 'â€”'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Active Alerts â€” real delays + disruptions, no synthetic data */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-terracotta-500 dark:text-amber-400" />
                Active Alerts
              </h2>
              {totalActive > 0 ? (
                <Badge variant="warning">{totalActive} Active</Badge>
              ) : (
                <Badge variant="secondary">None</Badge>
              )}
            </div>

            {activeAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-10 w-10 text-green-400 dark:text-emerald-400 mx-auto mb-3" />
                <p className="text-stone-500 dark:text-slate-300 font-medium">No active delays or disruptions</p>
                <p className="text-stone-400 dark:text-slate-500 text-sm mt-1">All clear on your assigned routes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg border',
                      alert.type === 'delay'
                        ? 'bg-orange-50 dark:bg-amber-950/40 border-orange-200 dark:border-amber-800'
                        : 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          alert.type === 'delay' ? 'bg-orange-100 dark:bg-amber-900/50' : 'bg-stone-200 dark:bg-stone-700/60'
                        )}
                      >
                        {alert.type === 'delay'
                          ? <Clock className="h-5 w-5 text-orange-600 dark:text-amber-400" />
                          : <Wrench className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-charcoal-500 dark:text-slate-100 truncate">{alert.title}</p>
                        {alert.detail && (
                          <p className="text-sm text-stone-500 dark:text-slate-400 truncate">{alert.detail}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={alert.type === 'delay' ? 'warning' : 'default'}
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      {alert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Safety & Compliance â€” only real counts, no fabricated percentages */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 dark:text-stone-100 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500 dark:text-terracotta-400" />
              Safety &amp; Compliance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-950/40 rounded-xl p-6 border border-red-100 dark:border-red-900/50 text-center">
                <div className="font-heading text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats?.sos.active ?? 'â€”'}
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">Active SOS</p>
              </div>
              <div className="bg-orange-50 dark:bg-amber-950/40 rounded-xl p-6 border border-orange-100 dark:border-amber-900/50 text-center">
                <div className="font-heading text-3xl font-bold text-orange-600 dark:text-amber-400 mb-1">
                  {stats?.missedBus.pending ?? 'â€”'}
                </div>
                <p className="text-sm text-orange-700 dark:text-amber-300">Missed Bus Pending</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/40 rounded-xl p-6 border border-yellow-100 dark:border-yellow-900/50 text-center">
                <div className="font-heading text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats?.delays.active ?? 'â€”'}
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Active Delays</p>
              </div>
              <div className="bg-stone-100 dark:bg-stone-800/80 rounded-xl p-6 border border-stone-200 dark:border-stone-700 text-center">
                <div className="font-heading text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">
                  {stats?.disruptions.active ?? 'â€”'}
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Active Disruptions</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
