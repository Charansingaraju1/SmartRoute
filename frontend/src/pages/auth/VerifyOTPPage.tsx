import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getAuthState } from '@/features/auth/context/AuthContext';
import { useToast } from '@/components/ui/Toaster';

const verifyOTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type VerifyOTPForm = z.infer<typeof verifyOTPSchema>;

export function VerifyOTPPage() {
  const { verifyOTP } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get('email') || '';
  const type = (searchParams.get('type') as 'REGISTRATION' | 'FORGOT_PASSWORD' | 'LOGIN' | 'EMAIL_VERIFICATION') || 'REGISTRATION';

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOTPForm>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = async (data: VerifyOTPForm) => {
    setLoading(true);
    try {
      await verifyOTP(email, data.otp, type);
      addToast({ type: 'success', title: 'Verified', message: 'Your email has been verified successfully.' });
      
      if (type === 'REGISTRATION') {
        navigate('/login');
      } else if (type === 'FORGOT_PASSWORD') {
        navigate('/reset-password', { state: { email, otp: data.otp } });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired OTP';
      addToast({ type: 'error', title: 'Verification failed', message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await getAuthState()?.resendOTP(email, type);
      addToast({ type: 'success', title: 'OTP sent', message: 'A new verification code has been sent.' });
      setResendCooldown(60);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: 'Failed to resend OTP' });
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const getTitle = () => {
    switch (type) {
      case 'REGISTRATION': return 'Verify Your Email';
      case 'FORGOT_PASSWORD': return 'Verify Reset Code';
      case 'LOGIN': return 'Verify Login Code';
      case 'EMAIL_VERIFICATION': return 'Verify Email';
      default: return 'Verify Code';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'REGISTRATION': return 'Enter the 6-digit code sent to your email to complete registration.';
      case 'FORGOT_PASSWORD': return 'Enter the 6-digit code sent to your email to reset your password.';
      case 'LOGIN': return 'Enter the 6-digit code sent to your email to sign in.';
      case 'EMAIL_VERIFICATION': return 'Enter the 6-digit code sent to your email to verify your email address.';
      default: return 'Enter the 6-digit code sent to your email.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Bus className="h-10 w-10 text-terracotta-500" />
            <span className="font-heading text-2xl font-bold text-charcoal-500">SmartRoute</span>
          </Link>
          <h2 className="font-heading text-3xl font-bold text-charcoal-500">{getTitle()}</h2>
          <p className="mt-2 text-stone-600">{getMessage()}</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="flex gap-3 justify-center">
              {Array.from({ length: 6 }, (_, i) => (
                <input
                  key={i}
                  {...register('otp')}
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

            {errors.otp && (
              <p className="text-center text-sm text-red-600">{errors.otp.message}</p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {type === 'FORGOT_PASSWORD' ? 'Verify & Continue' : 'Verify'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-stone-600">Didn't receive the code?</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </Button>
            <Link to={type === 'FORGOT_PASSWORD' ? '/forgot-password' : '/login'} className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700">
              ← Back
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}