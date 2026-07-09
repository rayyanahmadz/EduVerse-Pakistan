import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Users, Bookmark, SlidersHorizontal, X } from 'lucide-react';
import { listUniversities, getFilterMeta, saveUniversity } from '../lib/queries';
import { UniversitySummary } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { UniversityCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrencyPKR, admissionChanceStyles } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Universities() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const filters = {
    search: params.get('search') ?? '',
    province: params.get('province') ?? '',
    city: params.get('city') ?? '',
    sector: params.get('sector') ?? '',
    gender: params.get('gender') ?? '',
    hasHostel: params.get('hasHostel') ?? '',
    page: params.get('page') ?? '1',
  };

  const { data: filterMeta } = useQuery({
    queryKey: ['university-filters'],
    queryFn: () => getFilterMeta(),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['universities', filters],
    queryFn: () =>
      listUniversities({
        search: filters.search || undefined,
        province: filters.province || undefined,
        city: filters.city || undefined,
        sector: filters.sector || undefined,
        gender: filters.gender || undefined,
        hasHostel: filters.hasHostel === 'true',
        page: Number(filters.page) || 1,
      }),
  });

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const handleSave = async (universityId: string) => {
    if (!user) return;
    try {
      await saveUniversity(user.id, universityId);
    } catch {
      // silently ignore in this MVP UI
    }
  };

  const activeFilterCount = useMemo(() => Object.values(filters).filter((v, i) => v && i !== 0 && i !== 6).length, [filters]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Smart University Finder</h1>
        <p className="text-muted mt-1">Search and filter across every university on EduVerse.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            defaultValue={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by name or city..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="lg:w-auto">
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {showFilters && (
        <Card className="p-6 mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Province" value={filters.province} onChange={(e) => updateFilter('province', e.target.value)}>
            <option value="">All Provinces</option>
            {filterMeta?.provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select label="City" value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}>
            <option value="">All Cities</option>
            {filterMeta?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Sector" value={filters.sector} onChange={(e) => updateFilter('sector', e.target.value)}>
            <option value="">Public & Private</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </Select>
          <Select label="Gender Policy" value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)}>
            <option value="">Any</option>
            <option value="CO_EDUCATION">Co-Education</option>
            <option value="MALE_ONLY">Male Only</option>
            <option value="FEMALE_ONLY">Female Only</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
            <input type="checkbox" checked={filters.hasHostel === 'true'} onChange={(e) => updateFilter('hasHostel', e.target.checked ? 'true' : '')} className="rounded" />
            Hostel Required
          </label>
          {activeFilterCount > 0 && (
            <button onClick={() => setParams({})} className="flex items-center gap-1 text-sm text-rose-600 hover:underline">
              <X className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </Card>
      )}

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <UniversityCardSkeleton key={i} />)}
        </div>
      )}

{isError && <ErrorState message="Could not load universities. Check your Supabase connection and database permissions." onRetry={() => refetch()} />}
      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState icon={Search} title="No universities found" description="Try adjusting your filters or search term." />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((uni, i) => (
              <motion.div key={uni.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-40 bg-gradient-to-br from-brand-500 to-purple-600 relative overflow-hidden">
                    {uni.coverImageUrl && <img src={uni.coverImageUrl} alt={uni.name} className="w-full h-full object-cover" />}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {uni.hecRanking && <Badge className="bg-white/90 text-slate-900">#{uni.hecRanking} HEC</Badge>}
                    </div>
                    {user && (
                      <button onClick={() => handleSave(uni.id)} className="absolute top-3 left-3 h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center text-slate-700 hover:text-brand-600 transition-colors">
                        <Bookmark className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">{uni.shortName || uni.name}</h3>
                      <Badge className={uni.sector === 'PUBLIC' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}>
                        {uni.sector}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {uni.city}, {uni.province}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {uni.averageRating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" /> {uni.averageRating}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted">
                        <Users className="h-3.5 w-3.5" /> {uni.scholarshipsCount} scholarships
                      </div>
                    </div>

                    {uni.admissionChance && (
                      <span className={`inline-flex mt-3 w-fit px-2.5 py-1 rounded-full text-xs font-medium ${admissionChanceStyles[uni.admissionChance].className}`}>
                        {admissionChanceStyles[uni.admissionChance].label}
                      </span>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted">Semester Fee: </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{formatCurrencyPKR(uni.semesterFee)}</span>
                      </div>
                    </div>
                    <Link to={`/universities/${uni.slug}`}>
                      <Button variant="outline" className="w-full mt-4">View Details</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: data.meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter('page', String(i + 1))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${data.meta.page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
