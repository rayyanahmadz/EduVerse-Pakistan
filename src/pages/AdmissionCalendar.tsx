import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Bell, BellRing, MapPin } from 'lucide-react';
import { listDeadlines, getDashboard, createReminder, deleteReminder } from '../lib/queries';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';
import { DEADLINE_TYPE_LABELS, PAKISTAN_PROVINCES } from '../lib/constants';
import { useAuth } from '../context/AuthContext';

interface DeadlineItem {
  id: string;
  type: string;
  title: string;
  date: string;
  notes?: string | null;
  university: { id: string; slug: string; name: string; shortName?: string | null; province: string; city: string };
}

const typeStyles: Record<string, string> = {
  ADMISSION_OPEN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ADMISSION_CLOSE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  ENTRY_TEST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  MERIT_LIST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SCHOLARSHIP_DEADLINE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  CLASSES_START: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function AdmissionCalendar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [type, setType] = useState('');
  const [province, setProvince] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['deadlines', type, province],
    queryFn: () => listDeadlines({ upcoming: true, type: type || undefined, province: province || undefined }),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(user!.id),
    enabled: !!user,
  });

  const reminderIds = new Set(dashboard?.reminderDeadlineIds ?? []);

  const toggleReminder = async (deadlineId: string, isSet: boolean) => {
    if (!user) return;
    if (isSet) await deleteReminder(user.id, deadlineId);
    else await createReminder(user.id, deadlineId);
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admission Calendar</h1>
        <p className="text-muted mt-1">Upcoming admission windows, entry tests, interviews, and merit lists.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-64">
          <option value="">All Event Types</option>
          {Object.entries(DEADLINE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
        <Select value={province} onChange={(e) => setProvince(e.target.value)} className="sm:w-56">
          <option value="">All Provinces</option>
          {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {isError && <ErrorState message="Could not load the admission calendar." onRetry={() => refetch()} />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="Check back later, or adjust your filters." />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
          {data.map((d, i) => {
            const isSet = reminderIds.has(d.id);
            return (
              <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="relative pl-8">
                <div className="absolute -left-[9px] top-5 h-4 w-4 rounded-full bg-brand-600 border-4 border-white dark:border-slate-950" />
                <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={typeStyles[d.type]}>{DEADLINE_TYPE_LABELS[d.type] ?? d.type}</Badge>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(d.date)}</span>
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-100 mt-2">{d.title}</p>
                    <Link to={`/universities/${d.university.slug}`} className="text-sm text-muted flex items-center gap-1 mt-1 hover:text-brand-600 dark:hover:text-brand-400 w-fit">
                      <MapPin className="h-3.5 w-3.5" /> {d.university.shortName || d.university.name} — {d.university.city}
                    </Link>
                    {d.notes && <p className="text-xs text-muted mt-1">{d.notes}</p>}
                  </div>
                  {user && (
                    <Button variant={isSet ? 'secondary' : 'outline'} size="sm" onClick={() => toggleReminder(d.id, isSet)} className="shrink-0">
                      {isSet ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {isSet ? 'Reminder Set' : 'Remind Me'}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
