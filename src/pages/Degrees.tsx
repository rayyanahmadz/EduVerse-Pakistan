import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Clock, TrendingUp, Building2 } from 'lucide-react';
import { listDegrees } from '../lib/queries';
import { Degree } from '../types';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrencyPKR } from '../lib/utils';

const LEVELS = ['ASSOCIATE', 'BACHELORS', 'MASTERS', 'MPHIL', 'PHD', 'DIPLOMA'];

export default function Degrees() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['degrees', search, level],
    queryFn: () => listDegrees({ search: search || undefined, level: level || undefined }),
  });

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Degree Explorer</h1>
        <p className="text-muted mt-1">Discover programs, career paths, and where to study them.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search degrees, e.g. Computer Science"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="sm:w-56">
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase().replace('_', ' ')}</option>)}
        </Select>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
        </div>
      )}

      {isError && <ErrorState message="Could not load degrees." onRetry={() => refetch()} />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState icon={GraduationCap} title="No degrees found" description="Try a different search term or level." />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}>
              <Link to={`/degrees/${d.slug}`}>
                <Card className="p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <GraduationCap className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">{d.title}</h3>
                  <p className="text-xs text-muted mt-1">{d.level.charAt(0) + d.level.slice(1).toLowerCase()}</p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {d.durationYears} yrs</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {d.universitiesOfferingCount ?? 0} unis</span>
                  </div>

                  {(d.expectedSalaryMin || d.expectedSalaryMax) && (
                    <div className="flex items-center gap-1 mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" /> {formatCurrencyPKR(d.expectedSalaryMin)} - {formatCurrencyPKR(d.expectedSalaryMax)}/mo
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
