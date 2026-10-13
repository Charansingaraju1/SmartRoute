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
import { OTPInput } from '@/components/auth/OTPInput';

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

  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<VerifyOTPForm>({
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
      const message = err.response?.data?.message || 'Failed to resend OTP';
      addToast({ type: 'error', title: 'Failed', message });
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
            <span className="font-heading text-2xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">SmartRoute</span>
          </Link>
          <h2 className="font-heading text-3xl font-bold text-charcoal-500 dark:text-[#F1F5F9]">{getTitle()}</h2>
          <p className="mt-2 text-stone-600 dark:text-[#A7B3C7]">{getMessage()}</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <OTPInput
              value={watch('otp') || ''}
              onChange={(val) => setValue('otp', val, { shouldValidate: true })}
              disabled={loading}
              error={!!errors.otp}
            />

            {errors.otp && (
              <p className="text-center text-sm text-red-600 dark:text-rose-400">{errors.otp.message}</p>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
              {type === 'FORGOT_PASSWORD' ? 'Verify & Continue' : 'Verify'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-stone-600 dark:text-slate-400">Didn't receive the code?</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </Button>
            <Link to={type === 'FORGOT_PASSWORD' ? '/forgot-password' : '/login'} className="text-sm font-medium text-terracotta-600 dark:text-blue-400 hover:text-terracotta-700 dark:hover:text-blue-300">
              ← Back
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}