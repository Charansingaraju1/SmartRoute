import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAuthState } from '@/features/auth/context/AuthContext';
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

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type RegisterForm = z.infer<typeof registerSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export function StudentRegisterPage() {
  const { registerStudent } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpEmail, setOtpEmail] = useState('');

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerStudent(data);
      setOtpEmail(data.email);
      setStep('otp');
      addToast({ type: 'success', title: 'Registration successful', message: 'Please check your email for the verification code.' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      addToast({ type: 'error', title: 'Registration failed', message });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (data: OtpForm) => {
    try {
      await getAuthState()?.verifyOTP(otpEmail, data.otp, 'REGISTRATION');
      addToast({ type: 'success', title: 'Email verified', message: 'Your account is now active. Please sign in.' });
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired OTP';
      addToast({ type: 'error', title: 'Verification failed', message });
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Bus className="h-10 w-10 text-terracotta-500" />
              <span className="font-heading text-2xl font-bold text-charcoal-500">SmartRoute</span>
            </Link>
            <h2 className="font-heading text-3xl font-bold text-charcoal-500">Verify your email</h2>
            <p className="mt-2 text-stone-600">We've sent a 6-digit code to <strong>{otpEmail}</strong></p>
          </div>

          <Card className="p-8">
            <form onSubmit={otpForm.handleSubmit(handleOTPVerify)} className="space-y-6">
              <div className="flex gap-3 justify-center">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    {...otpForm.register('otp')}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-2xl font-medium rounded-lg border border-stone-300 bg-stone-50 focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 focus:outline-none"
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
                <p className="text-center text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>Verify Code</Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600">Didn't receive the code? </p>
              <Button variant="ghost" size="sm" onClick={() => { setStep('form'); otpForm.reset(); }}>
                Resend OTP
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Bus className="h-10 w-10 text-terracotta-500" />
            <span className="font-heading text-2xl font-bold text-charcoal-500">SmartRoute</span>
          </Link>
          <h2 className="font-heading text-3xl font-bold text-charcoal-500">Create Student Account</h2>
          <p className="mt-2 text-stone-600">Register with your university email to access transport services.</p>
        </div>

        <Card className="p-8">
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
                    className="text-stone-400 hover:text-stone-600"
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
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Re-enter your password"
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-stone-400 hover:text-stone-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={registerForm.formState.errors.confirmPassword?.message}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <p className="text-xs text-stone-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-terracotta-600 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-terracotta-600 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-terracotta-600 hover:text-terracotta-700">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}