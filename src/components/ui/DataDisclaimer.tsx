import { Info } from 'lucide-react';

const DISCLAIMER_TEXT =
  "Figures displayed are approximate and provided for informational purposes only. For accurate, up-to-date information, please consult the university's official admissions office.";

export function DataDisclaimer({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <p className={`flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 ${className}`}>
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
        {DISCLAIMER_TEXT}
      </p>
    );
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400 mb-6 ${className}`}>
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
      <p>{DISCLAIMER_TEXT}</p>
    </div>
  );
}