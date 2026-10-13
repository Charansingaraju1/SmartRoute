import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, X, Bus, GraduationCap, User, LogOut, Bell, Settings, ChevronDown, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { clsx } from 'clsx';

export function Header() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isPublicPage = ['/', '/login', '/register/student', '/register/teacher', '/forgot-password', '/reset-password', '/verify-otp', '/buses', '/routes', '/timings', '/scan'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <nav className="container-app flex h-20 items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded-lg p-1" aria-label="SmartRoute Home">
            <Bus className="h-9 w-9 text-terracotta-500 flex-shrink-0" />
            <span className="font-heading text-2xl font-bold text-charcoal-500 dark:text-stone-50 tracking-tight">SmartRoute</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/buses"
              className={({ isActive }) => clsx(
                'text-base font-medium transition-colors px-2 py-1 rounded-md',
                isActive ? 'text-terracotta-600 font-semibold' : 'text-stone-700 dark:text-stone-300 hover:text-charcoal-600 dark:hover:text-stone-100'
              )}
            >
              Buses
            </NavLink>
            <NavLink
              to="/routes"
              className={({ isActive }) => clsx(
                'text-base font-medium transition-colors px-2 py-1 rounded-md',
                isActive ? 'text-terracotta-600 font-semibold' : 'text-stone-700 dark:text-stone-300 hover:text-charcoal-600 dark:hover:text-stone-100'
              )}
            >
              Routes
            </NavLink>
            <NavLink
              to="/timings"
              className={({ isActive }) => clsx(
                'text-base font-medium transition-colors px-2 py-1 rounded-md',
                isActive ? 'text-terracotta-600 font-semibold' : 'text-stone-700 dark:text-stone-300 hover:text-charcoal-600 dark:hover:text-stone-100'
              )}
            >
              Timings
            </NavLink>
            <NavLink
              to="/scan"
              className="text-base font-semibold text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 transition-colors flex items-center gap-2 bg-terracotta-50 dark:bg-terracotta-950/40 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/50 px-4 py-2 rounded-full border border-terracotta-200 dark:border-terracotta-800"
            >
              <QrCode className="w-4 h-4 text-terracotta-500" />
              <span>Scan Bus</span>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-base px-4 py-2">Sign In</Button>
            </Link>
            <Link to="/register/student">
              <Button variant="primary" className="text-base px-5 py-2">Get Started</Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 py-5 px-6 bg-stone-50 dark:bg-stone-900 animate-slide-down">
            <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
              <NavLink to="/buses" className="text-lg font-medium text-stone-700 dark:text-stone-200 hover:text-charcoal-600 py-1" onClick={() => setMobileMenuOpen(false)}>Buses</NavLink>
              <NavLink to="/routes" className="text-lg font-medium text-stone-700 dark:text-stone-200 hover:text-charcoal-600 py-1" onClick={() => setMobileMenuOpen(false)}>Routes</NavLink>
              <NavLink to="/timings" className="text-lg font-medium text-stone-700 dark:text-stone-200 hover:text-charcoal-600 py-1" onClick={() => setMobileMenuOpen(false)}>Timings</NavLink>
              <NavLink to="/scan" className="text-lg text-terracotta-600 dark:text-terracotta-400 font-semibold flex items-center gap-2.5 py-1" onClick={() => setMobileMenuOpen(false)}>
                <QrCode className="w-5 h-5 text-terracotta-500" />Scan Bus QR
              </NavLink>
              <div className="flex flex-col gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-base py-3">Sign In</Button>
                </Link>
                <Link to="/register/student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full text-base py-3">Get Started</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    );
  }

  // Primary shortcuts for authenticated portal header (clean, spacious, no horizontal wrapping)
  const quickShortcuts = hasRole('STUDENT') ? [
    { path: '/student/scan', label: 'Scan Bus QR', icon: QrCode, badge: null },
    { path: '/student/my-bus', label: 'My Bus', icon: Bus, badge: null },
    { path: '/student/bus-pass', label: 'Bus Pass', icon: GraduationCap, badge: null },
    { path: '/student/sos', label: 'SOS', icon: AlertCircle, badge: 'urgent' },
  ] : hasRole('TEACHER') ? [
    { path: '/teacher/scan', label: 'Scan Bus QR', icon: QrCode, badge: null },
    { path: '/teacher/buses', label: 'Buses', icon: Bus, badge: null },
    { path: '/teacher/missed-bus', label: 'Missed Bus', icon: Bus, badge: null },
    { path: '/teacher/sos', label: 'SOS Alerts', icon: AlertCircle, badge: 'urgent' },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <nav className="container-app flex h-20 items-center justify-between" aria-label="Main navigation">
        <div className="flex items-center gap-3">
          <Link to={hasRole('STUDENT') ? '/student/dashboard' : '/teacher/dashboard'} className="flex items-center gap-2.5" aria-label="SmartRoute Home">
            <Bus className="h-9 w-9 text-terracotta-500 flex-shrink-0" />
            <span className="font-heading text-2xl font-bold text-charcoal-500 dark:text-stone-50 tracking-tight">SmartRoute</span>
          </Link>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-100 dark:bg-terracotta-900/50 text-terracotta-800 dark:text-terracotta-300 tracking-wide uppercase">
            {hasRole('STUDENT') ? 'Student Portal' : 'Faculty Portal'}
          </span>
        </div>

        {/* Desktop Quick Shortcuts */}
        <div className="hidden lg:flex items-center gap-2">
          {quickShortcuts.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-[15px] font-medium transition-colors',
                item.badge === 'urgent' && 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800',
                item.badge !== 'urgent' && (isActive
                  ? 'bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-700 dark:text-terracotta-300 font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-charcoal-600 dark:hover:text-stone-100')
              )}
            >
              <item.icon className={clsx('h-4 w-4', item.badge === 'urgent' ? 'text-red-600 dark:text-red-400' : '')} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={hasRole('STUDENT') ? '/student/notifications' : '/teacher/notifications'}
            className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-charcoal-600 dark:hover:text-stone-100 transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-h-[44px]"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-9 h-9 rounded-full bg-terracotta-100 dark:bg-terracotta-900/60 border border-terracotta-200 dark:border-terracotta-700 flex items-center justify-center flex-shrink-0">
                {hasRole('STUDENT') ? (
                  <GraduationCap className="h-5 w-5 text-terracotta-600 dark:text-terracotta-300" />
                ) : (
                  <User className="h-5 w-5 text-terracotta-600 dark:text-terracotta-300" />
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-charcoal-600 dark:text-stone-200 leading-tight max-w-[140px] truncate">{user?.name}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 leading-tight capitalize">{user?.role?.toLowerCase()}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-stone-500 dark:text-stone-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl py-2 z-50 animate-slide-down">
                  <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800">
                    <p className="text-base font-semibold text-charcoal-500 dark:text-stone-100 truncate">{user?.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-terracotta-100 dark:bg-terracotta-900/60 text-terracotta-700 dark:text-terracotta-300">
                      {user?.role}
                    </span>
                  </div>
                  <Link to={hasRole('STUDENT') ? '/student/profile' : '/teacher/profile'} className="flex items-center gap-2.5 px-4 py-2.5 text-base text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => setUserMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link to={hasRole('STUDENT') ? '/student/settings' : '/teacher/settings'} className="flex items-center gap-2.5 px-4 py-2.5 text-base text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800" onClick={() => setUserMenuOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="border-t border-stone-200 dark:border-stone-800 my-1" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer for portal */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 py-4 px-5 bg-stone-50 dark:bg-stone-900 animate-slide-down max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            <p className="text-xs uppercase tracking-wider font-semibold text-stone-400 dark:text-stone-500 px-3 py-1">Quick Actions</p>
            {quickShortcuts.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3.5 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive ? 'bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-700 dark:text-terracotta-300 font-semibold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-1">
              <Link to={hasRole('STUDENT') ? '/student/profile' : '/teacher/profile'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">
                <User className="h-5 w-5" />
                Profile
              </Link>
              <Link to={hasRole('STUDENT') ? '/student/settings' : '/teacher/settings'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left w-full"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}