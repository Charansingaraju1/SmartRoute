import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAuthState } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    setErrorBanner(null);
    try {
      await forgotPassword(data.email);
      setOtpEmail(data.email);
      setStep('otp');
      addToast({ type: 'success', title: 'OTP sent', message: 'If the email exists, a password reset code has been sent.' });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset code. Please try again.';
      setErrorBanner(message);
      addToast({ type: 'error', title: 'Failed to send reset code', message });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (data: OtpForm) => {
    try {
      await getAuthState()?.verifyOTP(otpEmail, data.otp, 'FORGOT_PASSWORD');
      setStep('reset');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired OTP';
      addToast({ type: 'error', title: 'Verification failed', message });
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    try {
      // Note: We need the OTP from the previous step. 
      // Since we don't have it in the form, we'll need to track it
      // For now, we'll need the OTP from the otpForm
      const otp = otpForm.getValues('otp');
      await getAuthState()?.resetPassword(otpEmail, otp, data.newPassword, data.confirmPassword);
      addToast({ type: 'success', title: 'Password reset', message: 'Your password has been updated successfully.' });
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password';
      addToast({ type: 'error', title: 'Reset failed', message });
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
        </div>

        <Card className="p-8">
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="text-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Forgot Password?</h2>
                <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">Enter your university email and we'll send you a reset code.</p>
              </div>

              {errorBanner && (
                <div className="p-3.5 rounded-lg bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-900 text-red-800 dark:text-rose-300 text-xs sm:text-sm leading-relaxed" role="alert">
                  <p className="font-semibold text-red-900 dark:text-rose-200 mb-0.5">Configuration Required</p>
                  <p>{errorBanner}</p>
                </div>
              )}

              <Input
                {...emailForm.register('email')}
                type="email"
                label="Email Address"
                placeholder="student@anuraguniversity.edu.in"
                leftIcon={<Mail className="h-5 w-5" />}
                error={emailForm.formState.errors.email?.message}
                autoComplete="email"
                disabled={loading}
              />

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send Reset Code
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(handleOTPVerify)} className="space-y-6" noValidate>
              <div className="text-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Verify Your Identity</h2>
                <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">We've sent a 6-digit code to <strong>{otpEmail}</strong></p>
              </div>

              <div className="flex gap-3 justify-center">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    {...otpForm.register('otp')}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl font-medium rounded-lg border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-[#182235] text-stone-900 dark:text-[#F1F5F9] focus:border-terracotta-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-terracotta-500/20 dark:focus:ring-blue-400/20 focus:outline-none"
                    autoComplete="one-time-code"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value && i < 5) {
                        const nextInput = document.querySelectorAll('input[maxLength="1"]')[i + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && i > 0) {
                        const prevInput = document.querySelectorAll('input[maxLength="1"]')[i - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    disabled={loading}
                  />
                ))}
              </div>

              {otpForm.formState.errors.otp && (
                <p className="text-center text-sm text-red-600 dark:text-rose-400">{otpForm.formState.errors.otp.message}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>Verify Code</Button>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={() => { setStep('email'); otpForm.reset(); }}>
                  ← Back to Email
                </Button>
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => { setStep('email'); otpForm.reset(); }}>
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-6" noValidate>
              <div className="text-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">Set New Password</h2>
                <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">Your new password must be different from previous passwords.</p>
              </div>

              <div className="relative">
                <Input
                  {...resetForm.register('newPassword')}
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
                  error={resetForm.formState.errors.newPassword?.message}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Input
                  {...resetForm.register('confirmPassword')}
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
                  error={resetForm.formState.errors.confirmPassword?.message}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Reset Password
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 dark:text-blue-400 dark:hover:text-blue-300">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}