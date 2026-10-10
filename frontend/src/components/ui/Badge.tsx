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
      default: 'bg-stone-100 text-stone-700',
      primary: 'bg-charcoal-100 text-charcoal-700',
      secondary: 'bg-terracotta-100 text-terracotta-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
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