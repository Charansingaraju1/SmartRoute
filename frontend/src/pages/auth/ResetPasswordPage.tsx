import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';

const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp, newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true);
    try {
      await resetPassword(email, data.otp, data.newPassword, data.confirmPassword);
      addToast({ type: 'success', title: 'Password reset', message: 'Your password has been updated successfully.' });
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password';
      addToast({ type: 'error', title: 'Reset failed', message });
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
          <h2 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Reset Password</h2>
          <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">Enter your new password below.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              {...register('otp')}
              type="text"
              label="OTP Code"
              placeholder="Enter 6-digit code"
              leftIcon={<Lock className="h-5 w-5" />}
              error={errors.otp?.message}
              autoComplete="one-time-code"
              disabled={loading}
            />

            <div className="relative">
              <Input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="At least 8 characters"
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
                error={errors.newPassword?.message}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Re-enter your password"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="pointer-events-auto p-1 text-stone-400 dark:text-slate-400 hover:text-stone-600 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 rounded transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-stone-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-terracotta-600 dark:text-blue-400 hover:text-terracotta-700 dark:hover:text-blue-300">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}