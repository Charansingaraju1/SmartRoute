import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-stone-50 border border-stone-200 dark:bg-[#18181B] dark:border-[#2E2E34]',
      elevated: 'bg-stone-50 border border-stone-200 shadow-lg dark:bg-[#1C1C20] dark:border-[#2E2E34]',
      outlined: 'bg-transparent border-2 border-stone-200 dark:border-[#2E2E34]',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200 dark:hover:shadow-stone-950/60' : '';

    return (
      <div
        ref={ref}
        className={twMerge(
          'rounded-xl text-stone-900 dark:text-[#F4F4F6]',
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={twMerge('mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={twMerge('text-lg font-semibold text-charcoal-500 dark:text-[#F4F4F6]', className)} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={twMerge('text-sm text-stone-500 dark:text-stone-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={twMerge('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={twMerge('mt-4 pt-4 border-t border-stone-200 dark:border-[#2E2E34] flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';