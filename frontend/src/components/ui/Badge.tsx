import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, dotColor, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:border dark:border-stone-700/60',
      primary: 'bg-charcoal-100 text-charcoal-700 dark:bg-stone-800 dark:text-stone-200 dark:border dark:border-stone-700/60',
      secondary: 'bg-terracotta-100 text-terracotta-700 dark:bg-stone-800 dark:text-terracotta-400 dark:border dark:border-terracotta-900/40',
      success: 'bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border dark:border-emerald-800/40',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-amber-950/50 dark:text-amber-400 dark:border dark:border-amber-800/40',
      danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:border dark:border-red-800/40',
      info: 'bg-blue-100 text-blue-700 dark:bg-stone-800 dark:text-blue-200 dark:border dark:border-stone-700/60',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
    };

    return (
      <span
        ref={ref}
        className={twMerge(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor || 'currentColor' }} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';