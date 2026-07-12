import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Globe, Mail, Phone, Star, Calendar, Wifi, Bus, HeartPulse, Trophy, Library, Bookmark, Loader2 } from 'lucide-react';
import { getUniversityBySlug, saveUniversity, createApplication, submitReview } from '../lib/queries';
import { UniversityDetail as UniversityDetailType } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrencyPKR, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { DataDisclaimer } from '../components/ui/DataDisclaimer';

const facilityIcons: Record<string, any> = {
  hasWifi: Wifi,
  hasTransport: Bus,
  hasMedical: HeartPulse,
  hasSportsComplex: Trophy,
  hasLibrary: Library,
};

export default function UniversityDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['university', slug],
    queryFn: () => getUniversityBySlug(slug!),
    enabled: !!slug,
  });

  const handleSave = async () => {
    if (!user || !data) return;
    setSaving(true);
    try {
      await saveUniversity(user.id, data.id);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page py-10 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) return <ErrorState message="Could not load this university." onRetry={() => refetch()} />;

  const facilities = [
    { key: 'hasWifi', label: 'Campus WiFi', value: data.hasWifi },
    { key: 'hasTransport', label: 'Transport', value: data.hasTransport },
    { key: 'hasMedical', label: 'Medical Center', value: data.hasMedical },
    { key: 'hasSportsComplex', label: 'Sports Complex', value: data.hasSportsComplex },
    { key: 'hasLibrary', label: 'Library', value: data.hasLibrary },
  ].filter((f) => f.value);

  return (
    <div>
      <div className="h-72 bg-gradient-to-br from-brand-600 to-purple-700 relative overflow-hidden">
        {data.coverImageUrl && <img src={data.coverImageUrl} alt={data.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-page pb-6 text-white">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/90 text-slate-900">{data.sector}</Badge>
                {data.hecRanking && <Badge className="bg-white/90 text-slate-900">HEC Rank #{data.hecRanking}</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{data.name}</h1>
              <div className="flex items-center gap-1 mt-2 text-slate-200">
                <MapPin className="h-4 w-4" /> {data.city}, {data.province}
              </div>
            </div>
            {user && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSave} isLoading={saving}>
                  <Bookmark className="h-4 w-4" /> Save University
                </Button>
                <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => setTrackOpen((v) => !v)}>
                  Track Application
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-page py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {trackOpen && (
            <TrackApplicationForm
              universityId={data.id}
              degreeOptions={data.degreeOffers.map((o) => o.degree.title)}
              onDone={() => { setTrackOpen(false); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); }}
            />
          )}
          <Card className="p-6">
            <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-3">Overview</h2>
            <p className="text-muted leading-relaxed">{data.description ?? 'No description available yet.'}</p>
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {facilities.map((f) => {
                  const Icon = facilityIcons[f.key];
                  return (
                    <div key={f.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
                      <Icon className="h-3.5 w-3.5" /> {f.label}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Degree Programs</h2>
            {data.degreeOffers.length === 0 ? (
              <p className="text-sm text-muted">No degree programs listed yet.</p>
            ) : (
              <div className="space-y-3">
                {data.degreeOffers.map((offer) => (
                  <Link key={offer.id} to={`/degrees/${offer.degree.slug}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 transition-colors">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{offer.degree.title}</div>
                      <div className="text-xs text-muted mt-0.5">
  {offer.entryTestRequired && `Entry Test: ${offer.entryTestName ?? 'Required'}`}
  {offer.entryTestRequired && offer.lastYearAggregate && ' • '}
  {offer.lastYearAggregate && `Last year's merit: ${offer.lastYearAggregate}%`}
</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">{formatCurrencyPKR(offer.semesterFee)}</div>
                      <div className="text-xs text-muted">per semester</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <DataDisclaimer compact />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Student Reviews</h2>
              {user && (
                <Button variant="outline" size="sm" onClick={() => setReviewOpen((v) => !v)}>
                  Write a Review
                </Button>
              )}
            </div>
            {reviewOpen && <ReviewForm universityId={data.id} onDone={() => { setReviewOpen(false); queryClient.invalidateQueries({ queryKey: ['university', slug] }); }} />}
            {data.reviews.length === 0 ? (
              <p className="text-sm text-muted mt-2">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4 mt-4">
                {data.reviews.map((r) => (
                  <div key={r.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{r.user.name}</div>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Math.round(((r.teachingRating + r.campusRating + r.labsRating + r.internetRating + r.cafeteriaRating + r.sportsRating + r.securityRating) / 7) * 10) / 10}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              {data.website && (
                <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-600 hover:underline">
                  <Globe className="h-4 w-4" /> Official Website
                </a>
              )}
              {data.email && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="h-4 w-4" /> {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="h-4 w-4" /> {data.phone}
                </div>
              )}
            </div>
          </Card>

          {data.hasHostel && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Hostel</h3>
              <p className="text-sm text-muted">Hostel available on campus.</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">{formatCurrencyPKR(data.hostelFeePerYear)}<span className="text-sm font-normal text-muted"> / year</span></p>
            </Card>
          )}

          {data.deadlines.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Upcoming Dates</h3>
              <div className="space-y-3">
                {data.deadlines.map((d) => (
                  <div key={d.id} className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-brand-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{d.title}</div>
                      <div className="text-xs text-muted">{formatDate(d.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {data.scholarships.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Available Scholarships</h3>
              <div className="space-y-2">
                {data.scholarships.map((s) => (
                  <Link key={s.scholarship.id} to={`/scholarships/${s.scholarship.slug}`} className="block text-sm text-brand-600 hover:underline">
                    {s.scholarship.name}
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackApplicationForm({ universityId, degreeOptions, onDone }: { universityId: string; degreeOptions: string[]; onDone: () => void }) {
  const { user } = useAuth();
  const [programName, setProgramName] = useState(degreeOptions[0] ?? '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim()) {
      setError('Enter the program you are applying to.');
      return;
    }
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      await createApplication(user.id, { universityId, programName, notes: notes || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not track this application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Track This Application</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          list="degree-options"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          placeholder="Program name, e.g. BS Computer Science"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        />
        <datalist id="degree-options">
          {degreeOptions.map((d) => <option key={d} value={d} />)}
        </datalist>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <Button size="sm" type="submit" isLoading={submitting}>Add to My Applications</Button>
      </form>
    </Card>
  );
}

function ReviewForm({ universityId, onDone }: { universityId: string; onDone: () => void }) {
  const [ratings, setRatings] = useState({ teachingRating: 5, campusRating: 5, labsRating: 5, internetRating: 5, cafeteriaRating: 5, sportsRating: 5, securityRating: 5 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fields: { key: keyof typeof ratings; label: string }[] = [
    { key: 'teachingRating', label: 'Teachers' },
    { key: 'campusRating', label: 'Campus' },
    { key: 'labsRating', label: 'Labs' },
    { key: 'internetRating', label: 'Internet' },
    { key: 'cafeteriaRating', label: 'Cafeteria' },
    { key: 'sportsRating', label: 'Sports' },
    { key: 'securityRating', label: 'Security' },
  ];

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitReview({ universityId, ...ratings, comment });
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs text-muted">{f.label}</label>
            <select
              value={ratings[f.key]}
              onChange={(e) => setRatings({ ...ratings, [f.key]: parseInt(e.target.value) })}
              className="w-full mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
      />
      <Button size="sm" onClick={submit} isLoading={submitting}>Submit Review</Button>
    </div>
  );
}
