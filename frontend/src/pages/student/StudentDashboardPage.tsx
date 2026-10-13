import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus, MapPin, Clock, Bell, AlertTriangle, AlertCircle, GraduationCap, Map, CreditCard, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardData {
  assignment: {
    bus: { id: string; registrationNumber: string; route: { routeCode: string; routeName?: string }; driverName?: string; capacity: number; currentStudentsCount: number } | null;
    route: { id: string; routeCode: string; routeName?: string; direction: string; startingPoint?: string; startingTime?: string } | null;
    boardingPoint: { id: string; stopName: string; stopTime?: string } | null;
  } | null;
  notifications: { unreadCount: number };
  missedBus: { pendingCount: number };
  sos: { activeCount: number };
}

export function StudentDashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const [assignment, notifications, missedBus, sos] = await Promise.all([
        api.getStudentAssignment().catch(() => null),
        api.getStudentNotifications(0, 1).catch(() => ({ content: [], totalElements: 0 })),
        api.getStudentMissedBus().catch(() => []),
        api.getStudentSOS().catch(() => []),
      ]);
      return {
        assignment,
        notifications: { unreadCount: notifications.content?.filter((n: any) => !n.read).length || 0 },
        missedBus: { pendingCount: missedBus.filter((m: any) => m.status === 'REQUESTED' || m.status === 'ACKNOWLEDGED').length },
        sos: { activeCount: sos.filter((s: any) => s.status === 'OPEN' || s.status === 'ACKNOWLEDGED' || s.status === 'RESPONDING').length },
      } as DashboardData;
    },
  });

  const quickLinks = [
    { href: '/student/scan', label: 'Scan Bus QR', icon: QrCode, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400', description: 'Verify registered AU bus' },
    { href: '/student/my-bus', label: 'My Bus', icon: Bus, color: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-950/50 dark:text-terracotta-400', description: 'View assigned bus & driver' },
    { href: '/student/my-route', label: 'My Route', icon: MapPin, color: 'bg-blue-100 text-blue-700 dark:bg-stone-800 dark:text-white', description: 'View route & stops' },
    { href: '/student/boarding-point', label: 'Boarding Point', icon: MapPin, color: 'bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400', description: 'Your pickup location' },
    { href: '/student/notifications', label: 'Notifications', icon: Bell, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400', badge: dashboard?.notifications.unreadCount },
    { href: '/student/missed-bus', label: 'Missed Bus', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 dark:bg-amber-950/50 dark:text-amber-400', badge: dashboard?.missedBus.pendingCount },
    { href: '/student/sos', label: 'SOS Emergency', icon: AlertCircle, color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400', badge: dashboard?.sos.activeCount },
    { href: '/student/bus-pass', label: 'Bus Pass', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700 dark:bg-stone-800 dark:text-white', description: 'Manage your bus pass' },
    { href: '/student/gps', label: 'Live Location', icon: Map, color: 'bg-cyan-100 text-cyan-700 dark:bg-stone-800 dark:text-white', description: 'Track your bus' },
    { href: '/student/payments', label: 'Payments', icon: CreditCard, color: 'bg-yellow-100 text-yellow-700 dark:bg-amber-950/50 dark:text-amber-300', description: 'View payment history' },
  ];

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 dark:bg-[#27272A] rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-stone-200 dark:bg-[#27272A] rounded-xl"></div>
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
          <p className="text-red-600 mb-6">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  const assignment = dashboard?.assignment;

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-slate-100">Dashboard</h1>
        <p className="text-stone-600 dark:text-slate-300 mt-2 text-base">Welcome back! Here's your transport overview.</p>
      </div>

      {/* Current Assignment Card */}
      {assignment?.bus || assignment?.route ? (
        <Card className="mb-8" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-slate-100">Current Assignment</h2>
            <Badge variant="success">Active</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignment?.bus && (
              <div className="bg-terracotta-50 dark:bg-[#18181B] rounded-xl p-6 border border-terracotta-100 dark:border-[#2E2E34]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-terracotta-100 dark:bg-terracotta-950/50 flex items-center justify-center">
                    <Bus className="h-6 w-6 text-terracotta-600 dark:text-terracotta-400" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Assigned Bus</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-stone-100">{assignment.bus.registrationNumber}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {assignment.bus.route && (
                    <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Route:</span> {assignment.bus.route.routeCode} - {assignment.bus.route.routeName || 'Unnamed'}</p>
                  )}
                  {assignment.bus.driverName && (
                    <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Driver:</span> {assignment.bus.driverName}</p>
                  )}
                  <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Capacity:</span> {assignment.bus.currentStudentsCount}/{assignment.bus.capacity} seats</p>
                </div>
              </div>
            )}

            {assignment?.route && (
              <div className="bg-blue-50 dark:bg-[#18181B] rounded-xl p-6 border border-blue-100 dark:border-[#2E2E34]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-stone-800 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600 dark:text-stone-300" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Route</p>
                    <p className="font-mono text-lg font-bold text-charcoal-500 dark:text-stone-100">{assignment.route.routeCode}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Name:</span> {assignment.route.routeName || 'Unnamed Route'}</p>
                  <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Direction:</span> {assignment.route.direction === 'MORNING' ? 'Morning (Home → College)' : 'Evening (College → Home)'}</p>
                  {assignment.route.startingPoint && (
                    <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Start:</span> {assignment.route.startingPoint} at {assignment.route.startingTime || 'TBD'}</p>
                  )}
                </div>
              </div>
            )}

            {assignment?.boardingPoint && (
              <div className="bg-green-50 dark:bg-[#18181B] rounded-xl p-6 border border-green-100 dark:border-[#2E2E34]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-green-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Boarding Point</p>
                    <p className="font-medium text-lg font-bold text-charcoal-500 dark:text-stone-100">{assignment.boardingPoint.stopName}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {assignment.boardingPoint.stopTime && (
                    <p className="text-stone-600 dark:text-stone-300"><span className="font-medium text-charcoal-500 dark:text-stone-100">Pickup Time:</span> {assignment.boardingPoint.stopTime}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="mb-8 text-center py-12" variant="outlined">
          <GraduationCap className="h-12 w-12 text-stone-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-medium text-charcoal-500 dark:text-slate-100 mb-2">No Bus Assigned</h3>
          <p className="text-stone-500 dark:text-slate-400 mb-6">You don't have an active bus assignment yet.</p>
          <Link to="/student/my-bus">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 text-stone-50 rounded-lg text-sm font-medium hover:bg-terracotta-400 transition-colors">
              <Bus className="h-4 w-4" />
              View Available Buses
            </button>
          </Link>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-stone-100 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} to={link.href} className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-terracotta-200 dark:hover:border-terracotta-700/60" padding="lg">
              <div className="flex items-start justify-between mb-4">
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', link.color)}>
                  <link.icon className="h-6 w-6" />
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
              <h3 className="font-heading text-xl font-bold text-charcoal-500 dark:text-stone-100 mb-1">{link.label}</h3>
              <p className="text-base text-stone-600 dark:text-stone-300">{link.description}</p>
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-[#2E2E34] flex items-center justify-between">
                <span className="text-base font-semibold text-terracotta-600 dark:text-terracotta-400 group-hover:underline">Open</span>
                <span className="text-terracotta-600 dark:text-terracotta-400">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}