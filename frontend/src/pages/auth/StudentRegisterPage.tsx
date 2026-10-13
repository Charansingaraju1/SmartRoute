import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function StudentRegisterPage() {
  const { registerStudent } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerStudent(data);
      addToast({
        type: 'success',
        title: 'Registration successful',
        message: 'Account created successfully! Please sign in with your credentials.'
      });
      navigate('/login?role=student');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast({ type: 'error', title: 'Registration failed', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Bus className="h-10 w-10 text-terracotta-500" />
            <span className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">SmartRoute</span>
          </Link>
          <h2 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Create Student Account</h2>
          <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">Register with your university email to access transport services.</p>
        </div>

        <Card className="p-8">
          <RoleSelector
            value="student"
            onChange={(role) => {
              if (role === 'teacher') navigate('/register/teacher');
            }}
            className="mb-6"
          />

          <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              {...registerForm.register('name')}
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              leftIcon={<User className="h-5 w-5" />}
              error={registerForm.formState.errors.name?.message}
              autoComplete="name"
              disabled={loading}
            />

            <Input
              {...registerForm.register('email')}
              type="email"
              label="University Email"
              placeholder="student@anuraguniversity.edu.in"
              leftIcon={<Mail className="h-5 w-5" />}
              error={registerForm.formState.errors.email?.message}
              autoComplete="email"
              disabled={loading}
            />

            <div className="relative">
              <Input
                {...registerForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="At least 8 characters"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pointer-events-auto p-1 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={registerForm.formState.errors.password?.message}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Input
                {...registerForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Re-enter your password"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pointer-events-auto p-1 text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={registerForm.formState.errors.confirmPassword?.message}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <p className="text-xs text-stone-500 dark:text-slate-400 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-terracotta-600 dark:text-blue-400 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-terracotta-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Student Account
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-stone-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login?role=student" className="font-medium text-terracotta-600 dark:text-blue-400 hover:text-terracotta-700 dark:hover:text-blue-300">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-stone-500 dark:text-slate-500">
              Are you a faculty member?{' '}
              <Link to="/register/teacher" className="text-stone-600 dark:text-slate-400 hover:underline font-medium">
                Register as Teacher
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
