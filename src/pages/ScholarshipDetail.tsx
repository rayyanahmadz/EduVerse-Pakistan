import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Calendar, ExternalLink, FileText, ListChecks, Bookmark, BookmarkCheck, Building2, MapPin } from 'lucide-react';
import { getScholarshipBySlug, saveScholarship } from '../lib/queries';
import { Scholarship } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function ScholarshipDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const { data: scholarship, isLoading, isError, refetch } = useQuery({
    queryKey: ['scholarship', slug],
    queryFn: () => getScholarshipBySlug(slug!),
    enabled: !!slug,
  });

  const handleSave = async () => {
    if (!user || !scholarship) return;
    await saveScholarship(user.id, scholarship.id);
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

  if (isError || !scholarship) {
    return <div className="container-page py-10"><ErrorState message="Could not load this scholarship." onRetry={() => refetch()} /></div>;
  }

  return (
    <div className="container-page py-10 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Award className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{scholarship.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                <Badge>{scholarship.category.replace('_', ' ')}</Badge>
                {scholarship.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Deadline: {formatDate(scholarship.deadline)}</span>}
              </div>
            </div>
          </div>
          {user && (
            <Button variant="outline" onClick={handleSave} disabled={saved}>
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>

        {scholarship.description && <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{scholarship.description}</p>}

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {scholarship.benefits && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Benefits</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{scholarship.benefits}</p>
            </Card>
          )}
          {scholarship.eligibility && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><ListChecks className="h-4 w-4" /> Eligibility</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{scholarship.eligibility}</p>
            </Card>
          )}
        </div>

        {scholarship.requiredDocuments.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Required Documents</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {scholarship.requiredDocuments.map((doc) => (
                <li key={doc} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {doc}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {scholarship.universities && scholarship.universities.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> Available At</h2>
            <div className="space-y-2">
              {scholarship.universities.map((u) => (
                <Link key={u.university.id} to={`/universities/${u.university.slug}`} className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline">
                  <MapPin className="h-3.5 w-3.5" /> {u.university.name} — {u.university.city}
                </Link>
              ))}
            </div>
          </Card>
        )}

        {scholarship.officialLink && (
          <a href={scholarship.officialLink} target="_blank" rel="noopener noreferrer">
            <Button>
              <ExternalLink className="h-4 w-4" /> Visit Official Page
            </Button>
          </a>
        )}
      </motion.div>
    </div>
  );
}
