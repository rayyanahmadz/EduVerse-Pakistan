import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong</h3>
      <p className="text-sm text-muted mt-1 max-w-sm">{message ?? 'Please try again in a moment.'}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
