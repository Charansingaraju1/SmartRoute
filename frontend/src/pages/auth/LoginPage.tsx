import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { RoleSelector, UserRoleType } from '@/components/auth/RoleSelector';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';
import { twMerge } from 'tailwind-merge';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    typeof googleClientId === 'string' &&
    googleClientId.trim().length > 0 &&
    !googleClientId.includes('your-google-client-id')
  );

  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  const [selectedRole, setSelectedRole] = useState<UserRoleType>(initialRole);

  const handleRoleChange = (role: UserRoleType) => {
    setSelectedRole(role);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('role', role);
      return next;
    }, { replace: true });
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const requestedRole: 'STUDENT' | 'TEACHER' = selectedRole === 'teacher' ? 'TEACHER' : 'STUDENT';
      const user = await login(data.email, data.password, requestedRole);
      addToast({ type: 'success', title: 'Welcome back!', message: 'You have been signed in successfully.' });

      const requestedFrom = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      const defaultDashboard = user?.role === 'TEACHER'
        ? '/teacher/dashboard'
        : '/student/dashboard';
      let destination = defaultDashboard;

      if (requestedFrom && requestedFrom !== '/login' && requestedFrom !== '/') {
        if (user?.role === 'TEACHER' && requestedFrom.startsWith('/teacher')) {
          destination = requestedFrom;
        } else if (user?.role === 'STUDENT' && requestedFrom.startsWith('/student')) {
          destination = requestedFrom;
        }
      }

      navigate(destination, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Invalid email or password';
      addToast({ type: 'error', title: 'Sign in failed', message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      addToast({
        type: 'warning',
        title: 'Google Sign-In Disabled',
        message: 'Google Workspace Single Sign-On (SSO) is disabled because VITE_GOOGLE_CLIENT_ID is not configured. Please sign in using your university email and password.',
      });
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              addToast({ type: 'error', title: 'Sign in failed', message: 'No credential returned by Google.' });
              setLoading(false);
              return;
            }
            try {
              const requestedRole: 'STUDENT' | 'TEACHER' = selectedRole === 'teacher' ? 'TEACHER' : 'STUDENT';
              const user = await loginWithGoogle(response.credential, requestedRole);
              addToast({ type: 'success', title: 'Welcome back!', message: 'Signed in with Google successfully.' });
              const defaultDashboard = user?.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard';
              navigate(defaultDashboard, { replace: true });
            } catch (err: any) {
              const message = err.response?.data?.message || err.message || 'Google authentication failed';
              addToast({ type: 'error', title: 'Sign in failed', message });
            } finally {
              setLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        addToast({
          type: 'info',
          title: 'Google Sign-In Initializing',
          message: 'Google Identity services are initializing. Please try again in a moment.',
        });
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      addToast({
        type: 'error',
        title: 'Sign in failed',
        message: err.message || 'Failed to initiate Google Sign-In',
      });
    }
  };

  const handleGitHubSignIn = () => {
    addToast({
      type: 'info',
      title: 'GitHub Sign-In Unavailable',
      message: 'GitHub Single Sign-On is not configured. Please sign in using your university email and password.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Bus className="h-10 w-10 text-terracotta-500" />
            <span className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">SmartRoute</span>
          </Link>
          <h2 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Sign in to your account</h2>
          <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">Use your university email to access the transport portal.</p>
        </div>

        <Card className="p-8">
          <RoleSelector
            value={selectedRole}
            onChange={handleRoleChange}
            className="mb-6"
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder={selectedRole === 'teacher' ? 'teacher@anuraguniversity.edu.in' : 'student@anuraguniversity.edu.in'}
              leftIcon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              autoComplete="email"
              disabled={loading}
            />

            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pointer-events-auto p-1 text-stone-400 dark:text-slate-400 hover:text-stone-600 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300 dark:border-slate-700 dark:bg-[#111827] text-terracotta-500 focus:ring-terracotta-500" />
                <span className="text-sm text-stone-600 dark:text-slate-300">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-terracotta-600 dark:text-blue-400 hover:text-terracotta-700 dark:hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-stone-50 dark:bg-[#182235] text-stone-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className={twMerge(
                "w-full relative opacity-75 hover:opacity-100",
                !isGoogleConfigured && "opacity-60 cursor-not-allowed hover:opacity-60"
              )}
              onClick={handleGoogleSignIn}
              disabled={!isGoogleConfigured || loading}
              aria-disabled={!isGoogleConfigured}
              title={
                isGoogleConfigured
                  ? "Sign in with Google"
                  : "Google Single Sign-On requires VITE_GOOGLE_CLIENT_ID configuration"
              }
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.25h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>Google</span>
              {!isGoogleConfigured && (
                <span className="ml-1 text-[10px] uppercase font-semibold text-stone-500 bg-stone-200 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">Off</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full relative opacity-75 hover:opacity-100"
              onClick={handleGitHubSignIn}
              title="GitHub Single Sign-On is not configured"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.175 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.28-1.56 3.285-1.23 3.285-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>GitHub</span>
              <span className="ml-1 text-[10px] uppercase font-semibold text-stone-500 bg-stone-200 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">Off</span>
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-stone-500 dark:text-slate-400">
            {isGoogleConfigured
              ? "Or sign in with your email and password above."
              : "Single Sign-On (Google / GitHub) is unconfigured. Google requires VITE_GOOGLE_CLIENT_ID. Please sign in with your email and password."}
          </p>
        </Card>

        <div className="space-y-2 text-center">
          <p className="text-sm text-stone-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to={selectedRole === 'teacher' ? '/register/teacher' : '/register/student'}
              className="font-medium text-terracotta-600 dark:text-blue-400 hover:text-terracotta-700 dark:hover:text-blue-300"
            >
              Sign up as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
            </Link>
          </p>
          <p className="text-xs text-stone-500 dark:text-slate-500">
            Switch role to register:{' '}
            <Link
              to="/register/student"
              className={twMerge('font-medium hover:underline', selectedRole === 'student' ? 'text-terracotta-600 dark:text-blue-400 underline' : 'text-stone-600 dark:text-slate-400')}
            >
              Student
            </Link>
            {' '}&bull;{' '}
            <Link
              to="/register/teacher"
              className={twMerge('font-medium hover:underline', selectedRole === 'teacher' ? 'text-terracotta-600 underline' : 'text-stone-600')}
            >
              Teacher
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}