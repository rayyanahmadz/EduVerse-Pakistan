import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, TrendingUp, Briefcase, Sparkles, ListChecks, Bookmark, BookmarkCheck, Building2, MapPin } from 'lucide-react';
import { getDegreeBySlug, saveDegree } from '../lib/queries';
import { Degree } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrencyPKR } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { DataDisclaimer } from '../components/ui/DataDisclaimer';

export default function DegreeDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const { data: degree, isLoading, isError, refetch } = useQuery({
    queryKey: ['degree', slug],
    queryFn: () => getDegreeBySlug(slug!),
    enabled: !!slug,
  });

  const handleSave = async () => {
    if (!user || !degree) return;
    await saveDegree(user.id, degree.id);
    setSaved(true);
  };

  if (isLoading) {
    return (
      <div className="container-page py-10 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !degree) {
    return <div className="container-page py-10"><ErrorState message="Could not load this degree." onRetry={() => refetch()} /></div>;
  }

  return (
    <div className="container-page py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <GraduationCap className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{degree.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                <Badge>{degree.level.charAt(0) + degree.level.slice(1).toLowerCase()}</Badge>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {degree.durationYears} years</span>
              </div>
            </div>
          </div>
          {user && (
            <Button variant="outline" onClick={handleSave} disabled={saved}>
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? 'Saved' : 'Save Degree'}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Overview" icon={GraduationCap} content={degree.overview} />
            <Section title="Eligibility" icon={ListChecks} content={degree.eligibility} />
            <Section title="Career Opportunities" icon={Briefcase} content={degree.careerOpportunities} />
            <Section title="Future Scope" icon={Sparkles} content={degree.futureScope} />

            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Universities Offering This Degree
              </h2>
              {!degree.universityOffers || degree.universityOffers.length === 0 ? (
                <p className="text-sm text-muted">No universities currently listed for this program. Check back soon.</p>
              ) : (
                <div className="space-y-3">
                  {degree.universityOffers.map((o) => (
                    <Link
                      key={o.id}
                      to={`/universities/${o.university.slug}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{o.university.name}</p>
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {o.university.city}, {o.university.province} • {o.university.sector}
                        </p>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{formatCurrencyPKR(o.semesterFee)}/sem</div>
                        {o.lastYearAggregate && <div className="text-muted">Merit: {o.lastYearAggregate}%</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <DataDisclaimer compact />
            </Card>
          </div>
          <div className="space-y-6">
            {(degree.expectedSalaryMin || degree.expectedSalaryMax) && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" /> Expected Salary
                </h2>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyPKR(degree.expectedSalaryMin)} – {formatCurrencyPKR(degree.expectedSalaryMax)}
                </p>
                <p className="text-xs text-muted mt-1">Per month, entry to mid-level (Pakistan market estimate)</p>
              </Card>
            )}

            {degree.skillsNeeded && degree.skillsNeeded.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Skills Needed</h2>
                <div className="flex flex-wrap gap-2">
                  {degree.skillsNeeded.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
              </Card>
            )}

            {degree.relatedDegrees && degree.relatedDegrees.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Related Degrees</h2>
                <div className="space-y-2">
                  {degree.relatedDegrees.map((r) => (
                    <Link key={r.slug} to={`/degrees/${r.slug}`} className="block text-sm text-brand-600 dark:text-brand-400 hover:underline">
                      {r.title}
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Section({ title, icon: Icon, content }: { title: string; icon: any; content?: string | null }) {
  if (!content) return null;
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content}</p>
    </Card>
  );
}
