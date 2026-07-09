import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, GraduationCap, Award, ClipboardList, Bell, Trash2, MapPin } from 'lucide-react';
import { getDashboard, unsaveUniversity as unsaveUniversityQuery, unsaveDegree as unsaveDegreeQuery, unsaveScholarship as unsaveScholarshipQuery, updateApplicationStatus as updateApplicationStatusQuery } from '../lib/queries';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { APPLICATION_STATUS_LABELS } from '../lib/constants';

interface DashboardData {
  savedUniversities: { id: string; university: { id: string; slug: string; name: string; city: string; province: string; sector: string } }[];
  savedDegrees: { id: string; degree: { id: string; slug: string; title: string; level: string } }[];
  savedScholarships: { id: string; scholarship: { id: string; slug: string; name: string; category: string } }[];
  applications: { id: string; programName: string; status: string; notes?: string | null; university: { name: string; slug: string } }[];
  notifications: { id: string; title: string; message: string; isRead: boolean; createdAt: string }[];
}

const tabs = [
  { key: 'universities', label: 'Saved Universities', icon: Bookmark },
  { key: 'degrees', label: 'Saved Degrees', icon: GraduationCap },
  { key: 'scholarships', label: 'Saved Scholarships', icon: Award },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'notifications', label: 'Notifications', icon: Bell },
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('universities');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(user!.id),
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboard'] });

  const unsaveUniversity = async (id: string) => {
    if (!user) return;
    await unsaveUniversityQuery(user.id, id);
    invalidate();
  };
  const unsaveDegree = async (id: string) => {
    if (!user) return;
    await unsaveDegreeQuery(user.id, id);
    invalidate();
  };
  const unsaveScholarship = async (id: string) => {
    if (!user) return;
    await unsaveScholarshipQuery(user.id, id);
    invalidate();
  };
  const updateApplicationStatus = async (id: string, status: string) => {
    await updateApplicationStatusQuery(id, status);
    invalidate();
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-muted mt-1">Everything you've saved and tracked, all in one place.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}

      {isError && <ErrorState message="Could not load your dashboard." onRetry={() => refetch()} />}

      {!isLoading && !isError && data && (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'universities' && (
            data.savedUniversities.length === 0 ? (
              <EmptyState icon={Bookmark} title="No saved universities yet" description="Browse the Smart Finder and bookmark universities you're interested in." action={<Link to="/universities"><Button>Explore Universities</Button></Link>} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.savedUniversities.map((s) => (
                  <Card key={s.id} className="p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/universities/${s.university.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400">
                        {s.university.name}
                      </Link>
                      <button onClick={() => unsaveUniversity(s.university.id)} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted mt-2">
                      <MapPin className="h-3.5 w-3.5" /> {s.university.city}, {s.university.province}
                    </div>
                    <Badge className="mt-3 w-fit">{s.university.sector}</Badge>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'degrees' && (
            data.savedDegrees.length === 0 ? (
              <EmptyState icon={GraduationCap} title="No saved degrees yet" description="Explore the Degree Explorer and save programs you're considering." action={<Link to="/degrees"><Button>Explore Degrees</Button></Link>} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.savedDegrees.map((s) => (
                  <Card key={s.id} className="p-5 flex items-start justify-between gap-2">
                    <Link to={`/degrees/${s.degree.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400">
                      {s.degree.title}
                    </Link>
                    <button onClick={() => unsaveDegree(s.degree.id)} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'scholarships' && (
            data.savedScholarships.length === 0 ? (
              <EmptyState icon={Award} title="No saved scholarships yet" description="Browse the Scholarship Hub and save the ones you qualify for." action={<Link to="/scholarships"><Button>Explore Scholarships</Button></Link>} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.savedScholarships.map((s) => (
                  <Card key={s.id} className="p-5 flex items-start justify-between gap-2">
                    <Link to={`/scholarships/${s.scholarship.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400">
                      {s.scholarship.name}
                    </Link>
                    <button onClick={() => unsaveScholarship(s.scholarship.id)} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'applications' && (
            data.applications.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No applications tracked yet" description="Open a university's page to start tracking an application." />
            ) : (
              <div className="space-y-4">
                {data.applications.map((a) => (
                  <Card key={a.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{a.programName}</p>
                      <p className="text-sm text-muted">{a.university.name}</p>
                    </div>
                    <Select value={a.status} onChange={(e) => updateApplicationStatus(a.id, e.target.value)} className="sm:w-56">
                      {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'notifications' && (
            data.notifications.length === 0 ? (
              <EmptyState icon={Bell} title="You're all caught up" description="New deadline reminders and updates will show up here." />
            ) : (
              <div className="space-y-3">
                {data.notifications.map((n) => (
                  <Card key={n.id} className={`p-4 ${!n.isRead ? 'border-brand-300 dark:border-brand-700' : ''}`}>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{n.title}</p>
                    <p className="text-sm text-muted mt-0.5">{n.message}</p>
                  </Card>
                ))}
              </div>
            )
          )}
        </motion.div>
      )}
    </div>
  );
}
