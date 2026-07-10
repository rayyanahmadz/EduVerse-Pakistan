import { AlertTriangle } from 'lucide-react';

export function DataDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 mt-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Fee and merit figures are estimates for planning purposes — confirm exact numbers with the university directly.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <p>
        Fees, merit cutoffs, and salary figures shown here are <strong>estimates for planning purposes only</strong>,
        not official or guaranteed numbers. Always confirm exact figures directly with the university's admissions office
        or official prospectus before making any decisions.
      </p>
    </div>
  );
}