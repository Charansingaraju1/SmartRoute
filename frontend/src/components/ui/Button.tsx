import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-charcoal-500 text-stone-50 hover:bg-charcoal-400 active:bg-charcoal-600 focus-visible:ring-charcoal-500',
      secondary: 'bg-terracotta-500 text-stone-50 hover:bg-terracotta-400 active:bg-terracotta-600 focus-visible:ring-terracotta-500',
      outline: 'border-2 border-charcoal-500 text-charcoal-500 hover:bg-charcoal-500 hover:text-stone-50 active:bg-charcoal-600 focus-visible:ring-charcoal-500',
      ghost: 'text-charcoal-600 hover:bg-stone-100 active:bg-stone-200 focus-visible:ring-charcoal-500',
      danger: 'bg-red-600 text-stone-50 hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500',
      success: 'bg-green-600 text-stone-50 hover:bg-green-500 active:bg-green-700 focus-visible:ring-green-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={twMerge(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';