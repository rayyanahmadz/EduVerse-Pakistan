export function formatCurrencyPKR(amount?: number | null): string {
  if (amount === undefined || amount === null) return 'N/A';
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBA';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const admissionChanceStyles: Record<string, { label: string; className: string }> = {
  SAFE: { label: 'Safe Choice', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  MODERATE: { label: 'Moderate Chance', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  DREAM: { label: 'Dream University', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  UNLIKELY: { label: 'Unlikely This Year', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
};
