import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Calendar, Globe2, Building2 } from 'lucide-react';
import { listScholarships } from '../lib/queries';
import { Scholarship } from '../types';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate } from '../lib/utils';
import { PAKISTAN_PROVINCES } from '../lib/constants';

const CATEGORIES = ['MERIT', 'NEED_BASED', 'PROVINCIAL', 'INTERNATIONAL', 'GOVERNMENT', 'PRIVATE'];

const categoryStyles: Record<string, string> = {
  MERIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  NEED_BASED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PROVINCIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  INTERNATIONAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  GOVERNMENT: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  PRIVATE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function Scholarships() {
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['scholarships', category, province],
    queryFn: () => listScholarships({ category: category || undefined, province: province || undefined }),
  });

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Scholarship Hub</h1>
        <p className="text-muted mt-1">Merit, need-based, provincial, and international funding opportunities.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-56">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </Select>
        <Select value={province} onChange={(e) => setProvince(e.target.value)} className="sm:w-56">
          <option value="">All Provinces</option>
          {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      )}

      {isError && <ErrorState message="Could not load scholarships." onRetry={() => refetch()} />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState icon={Award} title="No scholarships found" description="Try a different category or province." />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link to={`/scholarships/${s.slug}`}>
                <Card className="p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center">
                      <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <Badge className={categoryStyles[s.category]}>{s.category.replace('_', ' ')}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mt-4 leading-snug">{s.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
                    {s.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(s.deadline)}</span>}
                    {s.isInternational && <span className="flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> International</span>}
                    {s._count && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {s._count.universities} unis</span>}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
