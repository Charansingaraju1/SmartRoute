import React from 'react';
import { GraduationCap, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type UserRoleType = 'student' | 'teacher';

interface RoleSelectorProps {
  value: UserRoleType;
  onChange: (role: UserRoleType) => void;
  className?: string;
  id?: string;
}

export function RoleSelector({ value, onChange, className, id = 'role-selector' }: RoleSelectorProps) {
  return (
    <div
      id={id}
      className={twMerge('grid grid-cols-2 p-1 bg-stone-200/80 dark:bg-[#18181B] rounded-xl border border-transparent dark:border-[#2E2E34]', className)}
      role="tablist"
      aria-label="Account role selector"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'student'}
        onClick={() => onChange('student')}
        className={twMerge(
          'flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500',
          value === 'student'
            ? 'bg-charcoal-500 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
            : 'text-stone-600 dark:text-stone-400 hover:text-charcoal-500 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
        )}
      >
        <GraduationCap className="h-4 w-4" />
        <span>Student</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'teacher'}
        onClick={() => onChange('teacher')}
        className={twMerge(
          'flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500',
          value === 'teacher'
            ? 'bg-charcoal-500 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
            : 'text-stone-600 dark:text-stone-400 hover:text-charcoal-500 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
        )}
      >
        <User className="h-4 w-4" />
        <span>Teacher</span>
      </button>
    </div>
  );
}
