import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LayoutDashboard, Bus, MapPin, Bell, AlertTriangle, AlertCircle, 
  GraduationCap, Map, CreditCard, User, Settings, Menu, X, ChevronLeft 
} from 'lucide-react';

const navigation = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/my-bus', label: 'My Bus', icon: Bus },
  { path: '/student/my-route', label: 'My Route', icon: MapPin },
  { path: '/student/boarding-point', label: 'Boarding Point', icon: MapPin },
  { path: '/student/notifications', label: 'Notifications', icon: Bell },
  { path: '/student/missed-bus', label: 'Missed Bus', icon: AlertTriangle },
  { path: '/student/sos', label: 'SOS', icon: AlertCircle },
  { path: '/student/bus-pass', label: 'Bus Pass', icon: GraduationCap },
  { path: '/student/gps', label: 'Location', icon: Map },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/profile', label: 'Profile', icon: User },
  { path: '/student/settings', label: 'Settings', icon: Settings },
];

export function StudentLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <aside
          className={clsx(
            'fixed lg:static inset-y-0 left-0 z-30 bg-stone-50 border-r border-stone-200 transition-all duration-300 flex flex-col',
            sidebarCollapsed ? 'w-16' : 'w-64',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
          aria-label="Student navigation"
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-stone-200">
            {!sidebarCollapsed && (
              <span className="font-heading text-lg font-bold text-charcoal-500">SmartRoute</span>
            )}
            <button
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              className="hidden lg:flex p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  sidebarCollapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-terracotta-50 text-terracotta-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-charcoal-500'
                )}
                title={sidebarCollapsed ? item.label : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={clsx('h-5 w-5 flex-shrink-0', sidebarCollapsed && 'mx-auto')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-stone-200">
            <div className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg', sidebarCollapsed ? 'justify-center' : '')}>
              <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-4 w-4 text-terracotta-600" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal-500 truncate">Student</p>
                  <p className="text-xs text-stone-500 truncate">Anurag University</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-1 lg:ml-0 ml-0 p-4 lg:p-6 lg:ml-64 transition-all duration-300">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}