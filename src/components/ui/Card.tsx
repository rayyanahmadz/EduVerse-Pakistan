import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card-surface shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}
