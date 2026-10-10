import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus, Users, MapPin, AlertTriangle, AlertCircle, Clock, TrendingUp, GraduationCap, Map, Wrench, Bell, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardData {
  buses: { total: number; active: number };
  routes: { total: number; active: number };
  students: { total: number; assigned: number };
  missedBus: { pending: number };
  sos: { active: number };
  delays: { active: number };
  disruptions: { active: number };
}

function cn(...args: any[]) {
  return twMerge(clsx(args));
}

export function TeacherDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      // TODO: Implement dashboard stats API
      return {
        buses: { total: 67, active: 62 },
        routes: { total: 69, active: 65 },
        students: { total: 1250, assigned: 1180 },
        missedBus: { pending: 3 },
        sos: { active: 1 },
        delays: { active: 2 },
        disruptions: { active: 1 },
      } as DashboardData;
    },
  });

  const statsCards = [
    { label: 'Total Buses', value: stats?.buses.total || 0, sub: `${stats?.buses.active || 0} active`, icon: Bus, color: 'bg-terracotta-100 text-terracotta-700' },
    { label: 'Total Routes', value: stats?.routes.total || 0, sub: `${stats?.routes.active || 0} active`, icon: MapPin, color: 'bg-blue-100 text-blue-700' },
    { label: 'Students', value: stats?.students.total || 0, sub: `${stats?.students.assigned || 0} assigned`, icon: GraduationCap, color: 'bg-green-100 text-green-700' },
    { label: 'Missed Bus', value: stats?.missedBus.pending || 0, sub: 'pending', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
    { label: 'SOS Alerts', value: stats?.sos.active || 0, sub: 'active', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    { label: 'Delays', value: stats?.delays.active || 0, sub: 'active', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Disruptions', value: stats?.disruptions.active || 0, sub: 'active', icon: Wrench, color: 'bg-purple-100 text-purple-700' },
  ];

  const quickActions = [
    { href: '/teacher/buses', label: 'Manage Buses', icon: Bus, color: 'bg-terracotta-100 text-terracotta-700' },
    { href: '/teacher/routes', label: 'View Routes', icon: MapPin, color: 'bg-blue-100 text-blue-700' },
    { href: '/teacher/passengers', label: 'Passenger Lists', icon: Users, color: 'bg-green-100 text-green-700' },
    { href: '/teacher/assignments', label: 'Bus Assignments', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
    { href: '/teacher/missed-bus', label: 'Missed Bus', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
    { href: '/teacher/delays', label: 'Publish Delay', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { href: '/teacher/disruptions', label: 'Publish Disruption', icon: Wrench, color: 'bg-purple-100 text-purple-700' },
    { href: '/teacher/sos', label: 'SOS Alerts', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    { href: '/teacher/transport-ops', label: 'Transport Ops', icon: Settings, color: 'bg-gray-100 text-gray-700' },
    { href: '/teacher/location', label: 'Live Location', icon: Map, color: 'bg-cyan-100 text-cyan-700' },
    { href: '/teacher/notifications', label: 'Notifications', icon: Bell, color: 'bg-purple-100 text-purple-700' },
  ];

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-28 bg-stone-200 rounded-xl"></div>
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

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-500">Teacher Dashboard</h1>
        <p className="text-stone-600 mt-1">Transport operations overview and quick actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="h-full" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <Badge variant="secondary" size="sm">{stat.sub}</Badge>
            </div>
            <h3 className="font-heading text-3xl font-bold text-charcoal-500 mb-1">{stat.value}</h3>
            <p className="text-sm text-stone-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-terracotta-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href} className="group">
                  <button className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', action.color)}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-500 group-hover:text-terracotta-600 transition-colors">{action.label}</p>
                        <p className="text-sm text-stone-500">Access {action.label.toLowerCase()}</p>
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Transport Overview */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Map className="h-5 w-5 text-terracotta-500" />
              Transport Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <h3 className="font-semibold text-charcoal-500 mb-3">Fleet Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Total Buses</span>
                    <span className="font-mono text-xl font-bold text-charcoal-500">67</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Active</span>
                    <span className="font-mono text-xl font-bold text-green-600">62</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Maintenance</span>
                    <span className="font-mono text-xl font-bold text-orange-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Out of Service</span>
                    <span className="font-mono text-xl font-bold text-red-600">2</span>
                  </div>
                </div>
              </div>
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <h3 className="font-semibold text-charcoal-500 mb-3">Route Coverage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Total Routes</span>
                    <span className="font-mono text-xl font-bold text-charcoal-500">69</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Active Routes</span>
                    <span className="font-mono text-xl font-bold text-blue-600">65</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Zones Covered</span>
                    <span className="font-mono text-xl font-bold text-terracotta-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Boarding Points</span>
                    <span className="font-mono text-xl font-bold text-green-600">389+</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Active Alerts */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal-500 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-terracotta-500" />
                Active Alerts
              </h2>
              <Badge variant="warning">5 Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Bus 101 Delayed</p>
                    <p className="text-sm text-stone-500">15 min delay - Route A1</p>
                  </div>
                </div>
                <Badge variant="warning" size="sm">15 min delay</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">SOS - Medical Emergency</p>
                    <p className="text-sm text-stone-500">Student on Route B2</p>
                  </div>
                </div>
                <Badge variant="danger" size="sm">OPEN</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-500">Road Closure - Route C3</p>
                    <p className="text-sm text-stone-500">Diversion via Highway 44</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-purple-100 text-purple-700" size="sm">Diversion</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card padding="lg">
            <h2 className="font-heading text-lg font-semibold text-charcoal-500 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta-500" />
              Safety & Compliance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 text-center">
                <div className="font-heading text-3xl font-bold text-green-600 mb-1">0</div>
                <p className="text-sm text-green-700">Active Incidents</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                <div className="font-heading text-3xl font-bold text-blue-600 mb-1">98%</div>
                <p className="text-sm text-blue-700">On-Time Performance</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 text-center">
                <div className="font-heading text-3xl font-bold text-green-600 mb-1">0</div>
                <p className="text-sm text-green-700">Safety Violations</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                <div className="font-heading text-3xl font-bold text-blue-600 mb-1">99.2%</div>
                <p className="text-sm text-blue-700">Student Satisfaction</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}