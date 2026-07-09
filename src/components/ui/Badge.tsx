import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', className)}
      {...props}
    >
      {children}
    </span>
  );
}
