import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, X, Bus, GraduationCap, User, LogOut, Bell, Settings, ChevronDown, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

export function Header() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isPublicPage = ['/', '/login', '/register/student', '/register/teacher', '/forgot-password', '/reset-password', '/verify-otp', '/buses', '/routes', '/timings'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200">
        <nav className="container-app flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2" aria-label="SmartRoute Home">
            <Bus className="h-8 w-8 text-terracotta-500" />
            <span className="font-heading text-xl font-bold text-charcoal-500">SmartRoute</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/buses" className="text-sm font-medium text-stone-600 hover:text-charcoal-500 transition-colors">Buses</NavLink>
            <NavLink to="/routes" className="text-sm font-medium text-stone-600 hover:text-charcoal-500 transition-colors">Routes</NavLink>
            <NavLink to="/timings" className="text-sm font-medium text-stone-600 hover:text-charcoal-500 transition-colors">Timings</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register/student">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 px-4">
            <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
              <NavLink to="/buses" className="text-stone-600 hover:text-charcoal-500" onClick={() => setMobileMenuOpen(false)}>Buses</NavLink>
              <NavLink to="/routes" className="text-stone-600 hover:text-charcoal-500" onClick={() => setMobileMenuOpen(false)}>Routes</NavLink>
              <NavLink to="/timings" className="text-stone-600 hover:text-charcoal-500" onClick={() => setMobileMenuOpen(false)}>Timings</NavLink>
              <div className="flex flex-col gap-2 pt-4 border-t border-stone-200">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Get Started</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    );
  }

  const navigation = hasRole('STUDENT') ? [
    { path: '/student/dashboard', label: 'Dashboard', icon: GraduationCap },
    { path: '/student/my-bus', label: 'My Bus', icon: Bus },
    { path: '/student/my-route', label: 'My Route', icon: Bus },
    { path: '/student/boarding-point', label: 'Boarding Point', icon: Bus },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/missed-bus', label: 'Missed Bus', icon: AlertTriangle },
    { path: '/student/sos', label: 'SOS', icon: AlertCircle },
    { path: '/student/bus-pass', label: 'Bus Pass', icon: GraduationCap },
    { path: '/student/gps', label: 'Location', icon: Bus },
    { path: '/student/payments', label: 'Payments', icon: Settings },
  ] : hasRole('TEACHER') ? [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: GraduationCap },
    { path: '/teacher/buses', label: 'Buses', icon: Bus },
    { path: '/teacher/routes', label: 'Routes', icon: Bus },
    { path: '/teacher/passengers', label: 'Passengers', icon: User },
    { path: '/teacher/assignments', label: 'Assignments', icon: GraduationCap },
    { path: '/teacher/missed-bus', label: 'Missed Bus', icon: AlertTriangle },
    { path: '/teacher/delays', label: 'Delays', icon: AlertCircle },
    { path: '/teacher/disruptions', label: 'Disruptions', icon: AlertTriangle },
    { path: '/teacher/sos', label: 'SOS', icon: AlertCircle },
    { path: '/teacher/transport-ops', label: 'Transport Ops', icon: Settings },
    { path: '/teacher/location', label: 'Location', icon: Bus },
    { path: '/teacher/notifications', label: 'Notifications', icon: Bell },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200">
      <nav className="container-app flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link to={hasRole('STUDENT') ? '/student/dashboard' : '/teacher/dashboard'} className="flex items-center gap-2" aria-label="SmartRoute Home">
          <Bus className="h-8 w-8 text-terracotta-500" />
          <span className="font-heading text-xl font-bold text-charcoal-500">SmartRoute</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-charcoal-500'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-terracotta-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-charcoal-500">{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-stone-50 border border-stone-200 rounded-lg shadow-lg py-1 z-50 animate-slide-down">
                  <div className="px-4 py-2 border-b border-stone-200">
                    <p className="text-sm font-medium text-charcoal-500">{user?.name}</p>
                    <p className="text-xs text-stone-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-terracotta-100 text-terracotta-700">
                      {user?.role}
                    </span>
                  </div>
                  <Link to={hasRole('STUDENT') ? '/student/profile' : '/teacher/profile'} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100" onClick={() => setUserMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link to={hasRole('STUDENT') ? '/student/settings' : '/teacher/settings'} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100" onClick={() => setUserMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-stone-200 my-1" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-stone-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 py-4 px-4">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-stone-200 flex flex-col gap-2">
              <Link to={hasRole('STUDENT') ? '/student/profile' : '/teacher/profile'} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link to={hasRole('STUDENT') ? '/student/settings' : '/teacher/settings'} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
              >
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}