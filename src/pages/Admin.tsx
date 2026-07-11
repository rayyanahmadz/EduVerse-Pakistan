import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, GraduationCap, Award, CalendarPlus, UploadCloud,
  Trash2, Plus, CheckCircle2, XCircle, Users, Star,
} from 'lucide-react';
import { adminApi, importApi } from '../lib/functions';
import { listUniversities, listUniversitiesAdmin, listDegrees } from '../lib/queries';import { listDeadlines } from '../lib/queries';
import { UniversitySummary, Degree } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PAKISTAN_PROVINCES } from '../lib/constants';
import { listUniversityDegreeLinks } from '../lib/queries';
import { listMediaAssets } from '../lib/queries';
interface AdminStats {
  universities: number;
  degrees: number;
  scholarships: number;
  users: number;
  reviews: number;
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'universities', label: 'Universities', icon: Building2 },
  { key: 'import', label: 'Bulk Import', icon: UploadCloud },
  { key: 'degrees', label: 'Degrees', icon: GraduationCap },
  { key: 'scholarships', label: 'Scholarships', icon: Award },
  { key: 'deadlines', label: 'Deadlines', icon: CalendarPlus },
] as const;

export default function Admin() {
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('overview');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats(),
  });

  const { data: universities } = useQuery({
    queryKey: ['universities-admin'],
queryFn: () => listUniversitiesAdmin(),
  });
  const { data: mediaAssets } = useQuery({ queryKey: ['media-admin'], queryFn: () => listMediaAssets() });

  const { data: degrees } = useQuery({
    queryKey: ['degrees-admin'],
    queryFn: () => listDegrees(),
  });
  const { data: links } = useQuery({
  queryKey: ['links-admin'],
  queryFn: () => listUniversityDegreeLinks(),
});
  const { data: deadlines } = useQuery({
  queryKey: ['deadlines-admin'],
  queryFn: () => listDeadlines(),
});

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    queryClient.invalidateQueries({ queryKey: ['universities-admin'] });
    queryClient.invalidateQueries({ queryKey: ['degrees-admin'] });
    queryClient.invalidateQueries({ queryKey: ['deadlines-admin'] });
    queryClient.invalidateQueries({ queryKey: ['links-admin'] });
queryClient.invalidateQueries({ queryKey: ['media-admin'] });
  };


  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
        <p className="text-muted mt-1">Manage universities, degrees, scholarships, and the admission calendar.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Building2} label="Universities" value={stats.universities} />
          <StatCard icon={GraduationCap} label="Degrees" value={stats.degrees} />
          <StatCard icon={Award} label="Scholarships" value={stats.scholarships} />
          <StatCard icon={Users} label="Users" value={stats.users} />
          <StatCard icon={Star} label="Reviews" value={stats.reviews} />
        </div>
      )}

{tab === 'universities' && <UniversitiesTab universities={universities} mediaAssets={mediaAssets} onChanged={refreshAll} />}      {tab === 'import' && <ImportTab onChanged={refreshAll} />}
{tab === 'degrees' && <DegreesTab degrees={degrees} universities={universities} links={links} onChanged={refreshAll} />}      {tab === 'scholarships' && <ScholarshipsTab universities={universities} />}
{tab === 'deadlines' && <DeadlinesTab universities={universities} deadlines={deadlines} onChanged={refreshAll} />}    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </Card>
  );
}

function FormMessage({ ok, text }: { ok: boolean | null; text: string }) {
  if (ok === null) return null;
  return (
    <p className={`flex items-center gap-1.5 text-sm ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {text}
    </p>
  );
}

// ---------------- Universities Tab ----------------
function UniversitiesTab({ universities, mediaAssets, onChanged }: { universities?: UniversitySummary[]; mediaAssets?: any[]; onChanged: () => void }) {  const emptyForm = {
    name: '', shortName: '', sector: 'PUBLIC', province: 'Punjab', city: '', website: '', email: '', phone: '',
    hecRanking: '', establishedYear: '', genderPolicy: 'CO_EDUCATION', hasHostel: false, hostelFeePerYear: '', description: '',
    hasSportsComplex: false, hasWifi: true, hasTransport: false, societiesCount: '', campusSizeAcres: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean | null; text: string }>({ ok: null, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const startEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      name: u.name ?? '',
      shortName: u.shortName ?? '',
      sector: u.sector ?? 'PUBLIC',
      province: u.province ?? 'Punjab',
      city: u.city ?? '',
      website: u.website ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      hecRanking: u.hecRanking != null ? String(u.hecRanking) : '',
      establishedYear: u.establishedYear != null ? String(u.establishedYear) : '',
      genderPolicy: u.genderPolicy ?? 'CO_EDUCATION',
      hasHostel: !!u.hasHostel,
      hostelFeePerYear: u.hostelFeePerYear != null ? String(u.hostelFeePerYear) : '',
      description: u.description ?? '',
      hasSportsComplex: !!u.hasSportsComplex,
      hasWifi: u.hasWifi !== false,
      hasTransport: !!u.hasTransport,
      societiesCount: u.societiesCount != null ? String(u.societiesCount) : '',
      campusSizeAcres: u.campusSizeAcres != null ? String(u.campusSizeAcres) : '',
    });
    setMsg({ ok: null, text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMsg({ ok: null, text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      hecRanking: form.hecRanking ? Number(form.hecRanking) : null,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : null,
      hostelFeePerYear: form.hostelFeePerYear ? Number(form.hostelFeePerYear) : null,
      societiesCount: form.societiesCount ? Number(form.societiesCount) : null,
      campusSizeAcres: form.campusSizeAcres ? Number(form.campusSizeAcres) : null,
    };
    try {
      if (editingId) {
        await adminApi.updateUniversity(editingId, payload);
        setMsg({ ok: true, text: `${form.name} updated.` });
        setEditingId(null);
      } else {
        await adminApi.createUniversity(payload);
        setMsg({ ok: true, text: `${form.name} created.` });
      }
      setForm(emptyForm);
      onChanged();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to save.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    await adminApi.deleteUniversity(id);
    if (editingId === id) cancelEdit();
    onChanged();
  };

  const filtered = universities?.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
  <>
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> {editingId ? 'Edit University' : 'Add University'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Your entire existing form remains unchanged */}
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
          All Universities ({universities?.length ?? 0})
        </h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="space-y-2 max-h-[32rem] overflow-y-auto">
          {filtered?.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {u.name}
                </p>
                <p className="text-xs text-muted">
                  {u.city}, {u.province} • <Badge className="ml-1">{u.sector}</Badge>
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => startEdit(u)}>
                  Edit
                </Button>

                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* 👇 Add this section */}
    <div className="mt-8">
      <ImageLibrary
        assets={mediaAssets}
        universities={universities}
        onChanged={onChanged}
      />
    </div>
  </>
);

// ---------------- Bulk Import Tab ----------------
const IMPORT_FIELDS: Record<string, string> = {
  university: 'name,shortName,sector,province,city,website,email,phone,hecRanking,establishedYear,genderPolicy,hasHostel,hostelFeePerYear,description',
  degree: 'title,level,durationYears,overview,eligibility,careerOpportunities,futureScope,expectedSalaryMin,expectedSalaryMax,skillsNeeded',
  scholarship: 'name,category,province,isInternational,benefits,eligibility,requiredDocuments,deadline,officialLink,description',
  deadline: 'universitySlug,type,title,date,notes',
  universityDegree: 'universitySlug,degreeSlug,semesterFee,totalFee,lastYearAggregate,seatsAvailable,entryTestRequired,entryTestName',
universityScholarship: 'universitySlug,scholarshipSlug',
};

const IMPORT_JSON_EXAMPLE: Record<string, string> = {
  university: '{\n  "rows": [\n    { "name": "Example University", "province": "Punjab", "city": "Lahore", "sector": "PUBLIC" }\n  ]\n}',
  degree: '{\n  "rows": [\n    { "title": "BS Data Science", "level": "BACHELORS", "durationYears": 4, "skillsNeeded": "Python;SQL;Statistics" }\n  ]\n}',
  scholarship: '{\n  "rows": [\n    { "name": "Example Scholarship", "category": "MERIT" }\n  ]\n}',
  deadline: '{\n  "rows": [\n    { "universitySlug": "the-university-of-lahore", "type": "ADMISSION_OPEN", "title": "Fall 2026 Admissions Open", "date": "2026-08-01" }\n  ]\n}',
universityDegree: '{\n  "rows": [\n    { "universitySlug": "the-university-of-lahore", "degreeSlug": "doctor-of-pharmacy-pharmd", "semesterFee": 85000, "lastYearAggregate": 72.5 }\n  ]\n}',
universityScholarship: '{\n  "rows": [\n    { "universityName": "The University of Lahore", "scholarshipName": "HEC Need-Based Scholarship Program" }\n  ]\n}',
};

function ImportTab({ onChanged }: { onChanged: () => void }) {
  const [resource, setResource] = useState<'university' | 'degree' | 'scholarship' | 'deadline'>('university');
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState(IMPORT_JSON_EXAMPLE.university);
  const [csvResult, setCsvResult] = useState<any>(null);
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);

  const changeResource = (r: 'university' | 'degree' | 'scholarship' | 'deadline') => {
    setResource(r);
    setJsonText(IMPORT_JSON_EXAMPLE[r]);
    setCsvResult(null);
    setJsonResult(null);
    setError('');
  };

  const handleCsvImport = async () => {
    if (!file) return;
    setLoadingCsv(true);
    setError('');
    try {
      const csvText = await file.text();
      const result = await importApi.importCsv(resource, csvText);
      setCsvResult(result);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV import failed.');
    } finally {
      setLoadingCsv(false);
    }
  };

  const handleJsonImport = async () => {
    setLoadingJson(true);
    setError('');
    try {
      const parsed = JSON.parse(jsonText);
      const result = await importApi.importJson(resource, parsed.rows ?? parsed);
      setJsonResult(result);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON import failed — check formatting.');
    } finally {
      setLoadingJson(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Select label="What are you importing?" value={resource} onChange={(e) => changeResource(e.target.value as any)}>
          <option value="university">Universities</option>
          <option value="degree">Degrees</option>
          <option value="scholarship">Scholarships</option>
          <option value="deadline">Admission Calendar Deadlines</option>
          <option value="universityDegree">Link Degrees to Universities (Fee + Merit)</option>
       <option value="universityScholarship">Link Scholarships to Universities</option>
        </Select>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 sm:p-8">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><UploadCloud className="h-4 w-4" /> CSV Importer</h2>
          <p className="text-xs text-muted mb-4">
            Header row required: <code className="text-[11px]">{IMPORT_FIELDS[resource]}</code>
            {resource === 'deadline' && <> — <code>universitySlug</code> must match an existing university's slug exactly.</>}
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 dark:file:bg-slate-800 file:text-brand-700 dark:file:text-brand-300 file:text-sm mb-4"
          />
          <Button onClick={handleCsvImport} disabled={!file} isLoading={loadingCsv}>Import CSV</Button>
          {csvResult && (
            <div className="mt-4 text-sm space-y-1">
              <p className="text-emerald-600 dark:text-emerald-400">{csvResult.created} created</p>
              <p className="text-amber-600 dark:text-amber-400">{csvResult.skipped} skipped</p>
              {csvResult.details?.filter((d: any) => d.status === 'skipped').map((d: any, i: number) => (
                <p key={i} className="text-xs text-rose-500">Row {d.row}: {d.reason}</p>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><UploadCloud className="h-4 w-4" /> JSON Importer</h2>
          <p className="text-xs text-muted mb-4">Paste a JSON object with a <code>rows</code> array.</p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
          />
          <Button onClick={handleJsonImport} isLoading={loadingJson}>Import JSON</Button>
          {jsonResult && (
            <div className="mt-4 text-sm space-y-1">
              <p className="text-emerald-600 dark:text-emerald-400">{jsonResult.created} created</p>
              <p className="text-amber-600 dark:text-amber-400">{jsonResult.skipped} skipped</p>
              {jsonResult.details?.filter((d: any) => d.status === 'skipped').map((d: any, i: number) => (
                <p key={i} className="text-xs text-rose-500">Row {d.row}: {d.reason}</p>
              ))}
            </div>
          )}
        </Card>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}
// ---------------- Degrees Tab ----------------
function DegreesTab({ degrees, universities, links, onChanged }: { degrees?: Degree[]; universities?: UniversitySummary[]; links?: any[]; onChanged: () => void }) {
  const emptyForm = { title: '', level: 'BACHELORS', durationYears: '4', overview: '', expectedSalaryMin: '', expectedSalaryMax: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [link, setLink] = useState({ universityId: '', degreeId: '', semesterFee: '', lastYearAggregate: '' });
  const [msg, setMsg] = useState<{ ok: boolean | null; text: string }>({ ok: null, text: '' });
  const [linkMsg, setLinkMsg] = useState<{ ok: boolean | null; text: string }>({ ok: null, text: '' });

  const startEdit = (d: Degree) => {
    setEditingId(d.id);
    setForm({
      title: d.title,
      level: d.level,
      durationYears: String(d.durationYears ?? 4),
      overview: d.overview ?? '',
      expectedSalaryMin: d.expectedSalaryMin != null ? String(d.expectedSalaryMin) : '',
      expectedSalaryMax: d.expectedSalaryMax != null ? String(d.expectedSalaryMax) : '',
    });
    setMsg({ ok: null, text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMsg({ ok: null, text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      level: form.level,
      durationYears: parseFloat(form.durationYears),
      overview: form.overview,
      expectedSalaryMin: form.expectedSalaryMin ? parseInt(form.expectedSalaryMin) : null,
      expectedSalaryMax: form.expectedSalaryMax ? parseInt(form.expectedSalaryMax) : null,
    };
    try {
      if (editingId) {
        await adminApi.updateDegree(editingId, payload);
        setMsg({ ok: true, text: `${form.title} updated.` });
        setEditingId(null);
      } else {
        await adminApi.createDegree(payload);
        setMsg({ ok: true, text: `${form.title} created.` });
      }
      setForm(emptyForm);
      onChanged();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to save degree.' });
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.linkDegree({
        universityId: link.universityId,
        degreeId: link.degreeId,
        semesterFee: link.semesterFee ? parseInt(link.semesterFee) : undefined,
        lastYearAggregate: link.lastYearAggregate ? parseFloat(link.lastYearAggregate) : undefined,
        entryTestRequired: false,
      });
      setLinkMsg({ ok: true, text: 'Program linked to university.' });
      onChanged();
    } catch (err) {
      setLinkMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to link.' });
    }
  };

  const handleUnlink = async (id: string, label: string) => {
    if (!confirm(`Unlink ${label}?`)) return;
    await adminApi.unlinkDegree(id);
    onChanged();
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 sm:p-8">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> {editingId ? 'Edit Degree' : 'Add Degree'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. BS Data Science" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {['ASSOCIATE', 'BACHELORS', 'MASTERS', 'MPHIL', 'PHD', 'DIPLOMA'].map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
              <Input label="Duration (Years)" type="number" step="0.5" value={form.durationYears} onChange={(e) => setForm({ ...form, durationYears: e.target.value })} />
            </div>
            <Input label="Overview" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Expected Salary Min (Rs./mo)" type="number" value={form.expectedSalaryMin} onChange={(e) => setForm({ ...form, expectedSalaryMin: e.target.value })} />
              <Input label="Expected Salary Max (Rs./mo)" type="number" value={form.expectedSalaryMax} onChange={(e) => setForm({ ...form, expectedSalaryMax: e.target.value })} />
            </div>
            <FormMessage ok={msg.ok} text={msg.text} />
            <div className="flex gap-3">
              <Button type="submit" className="w-full">{editingId ? 'Update Degree' : 'Create Degree'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Link Degree to University</h2>
          <form onSubmit={handleLink} className="space-y-4">
            <Select label="University" required value={link.universityId} onChange={(e) => setLink({ ...link, universityId: e.target.value })}>
              <option value="">Select a university</option>
              {universities?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Select label="Degree" required value={link.degreeId} onChange={(e) => setLink({ ...link, degreeId: e.target.value })}>
              <option value="">Select a degree</option>
              {degrees?.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </Select>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Semester Fee (Rs.)" type="number" value={link.semesterFee} onChange={(e) => setLink({ ...link, semesterFee: e.target.value })} />
              <Input label="Last Year Aggregate (%)" type="number" step="0.01" value={link.lastYearAggregate} onChange={(e) => setLink({ ...link, lastYearAggregate: e.target.value })} />
            </div>
            <FormMessage ok={linkMsg.ok} text={linkMsg.text} />
            <Button type="submit" className="w-full">Link Program</Button>
          </form>
        </Card>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Existing University-Degree Links ({links?.length ?? 0})</h2>
        {!links || links.length === 0 ? (
          <p className="text-sm text-muted">No links yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {links.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{l.degreeTitle} @ {l.universityName}</p>
                  <p className="text-xs text-muted">
                    {l.semesterFee ? `Rs. ${l.semesterFee}/sem` : 'No fee set'} · {l.lastYearAggregate ? `${l.lastYearAggregate}% merit` : 'No merit set'}
                  </p>
                </div>
                <button
                  onClick={() => handleUnlink(l.id, `${l.degreeTitle} from ${l.universityName}`)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-2 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">All Degrees ({degrees?.length ?? 0})</h2>
        {!degrees || degrees.length === 0 ? (
          <p className="text-sm text-muted">No degrees yet.</p>
        ) : (
          <div className="space-y-2">
            {degrees.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{d.title}</p>
                  <p className="text-xs text-muted">
                    {d.level} · {d.durationYears} yrs
                    {(d.expectedSalaryMin || d.expectedSalaryMax) && ` · Rs. ${d.expectedSalaryMin ?? '?'} - ${d.expectedSalaryMax ?? '?'}/mo`}
                  </p>
                </div>
                <Button variant="outline" onClick={() => startEdit(d)}>Edit</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
// ---------------- Scholarships Tab ----------------
function ScholarshipsTab({ universities }: { universities?: UniversitySummary[] }) {
  const [form, setForm] = useState({ name: '', category: 'MERIT', province: '', benefits: '', eligibility: '', deadline: '', officialLink: '' });
  const [msg, setMsg] = useState<{ ok: boolean | null; text: string }>({ ok: null, text: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createScholarship({ ...form, province: form.province || undefined, deadline: form.deadline || undefined });
      setMsg({ ok: true, text: `${form.name} created.` });
      setForm({ name: '', category: 'MERIT', province: '', benefits: '', eligibility: '', deadline: '', officialLink: '' });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to create scholarship.' });
    }
  };

  return (
    <Card className="p-6 sm:p-8 max-w-2xl">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Scholarship</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['MERIT', 'NEED_BASED', 'PROVINCIAL', 'INTERNATIONAL', 'GOVERNMENT', 'PRIVATE'].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Province (optional)" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
            <option value="">Nationwide</option>
            {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <Input label="Benefits" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
        <Input label="Eligibility" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Input label="Official Link" type="url" value={form.officialLink} onChange={(e) => setForm({ ...form, officialLink: e.target.value })} placeholder="https://" />
        </div>
        <FormMessage ok={msg.ok} text={msg.text} />
        <Button type="submit" className="w-full">Create Scholarship</Button>
      </form>
    </Card>
  );
}

// ---------------- Deadlines Tab ----------------
interface DeadlineItem {
  id: string; type: string; title: string; date: string; notes?: string | null;
  university?: { id: string; name: string } | null;
}

function DeadlinesTab({ universities, deadlines, onChanged }: { universities?: UniversitySummary[]; deadlines?: DeadlineItem[]; onChanged: () => void }) {
  const emptyForm = { universityId: '', type: 'ADMISSION_OPEN', title: '', date: '', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean | null; text: string }>({ ok: null, text: '' });

  const startEdit = (d: DeadlineItem) => {
    setEditingId(d.id);
    setForm({
      universityId: d.university?.id ?? '',
      type: d.type,
      title: d.title,
      date: d.date?.slice(0, 10) ?? '',
      notes: d.notes ?? '',
    });
    setMsg({ ok: null, text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMsg({ ok: null, text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateDeadline(editingId, form);
        setMsg({ ok: true, text: 'Deadline updated.' });
        setEditingId(null);
      } else {
        await adminApi.createDeadline(form);
        setMsg({ ok: true, text: 'Deadline added to the admission calendar.' });
      }
      setForm(emptyForm);
      onChanged();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to save deadline.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await adminApi.deleteDeadline(id);
    onChanged();
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8 max-w-2xl">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> {editingId ? 'Edit Admission Calendar Event' : 'Add Admission Calendar Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="University" required value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })}>
            <option value="">Select a university</option>
            {universities?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Select label="Event Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['ADMISSION_OPEN', 'ADMISSION_CLOSE', 'ENTRY_TEST', 'INTERVIEW', 'MERIT_LIST', 'SCHOLARSHIP_DEADLINE', 'CLASSES_START'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </Select>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Undergraduate Admissions Open" />
          <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <FormMessage ok={msg.ok} text={msg.text} />
          <div className="flex gap-3">
            <Button type="submit" className="w-full">{editingId ? 'Update Event' : 'Add to Calendar'}</Button>
            {editingId && <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">All Calendar Events ({deadlines?.length ?? 0})</h2>
        {!deadlines || deadlines.length === 0 ? (
          <p className="text-sm text-muted">No calendar events yet.</p>
        ) : (
          <div className="space-y-2">
            {deadlines.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">{d.title}</p>
                  <p className="text-xs text-muted">
                    {d.university?.name ?? 'Unknown university'} · {d.type.replace('_', ' ')} · {new Date(d.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => startEdit(d)}>Edit</Button>
                  <button onClick={() => handleDelete(d.id, d.title)} className="text-slate-400 hover:text-rose-500 transition-colors p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
function ImageLibrary({ assets, universities, onChanged }: { assets?: any[]; universities?: UniversitySummary[]; onChanged: () => void }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  const addLink = async () => {
    if (!linkUrl.trim()) return;
    await adminApi.addImageLink(linkUrl.trim(), linkLabel.trim() || linkUrl);
    setLinkUrl('');
    setLinkLabel('');
    onChanged();
  };

  const uploadFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setMsg('Image too large — under 4MB please.');
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await adminApi.uploadImage(base64, file.name, file.type);
      onChanged();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const assign = async (assetUrl: string, universityId: string) => {
    if (!universityId) return;
    await adminApi.updateUniversity(universityId, { coverImageUrl: assetUrl });
    setMsg('Image assigned.');
    onChanged();
  };

  const removeAsset = async (id: string) => {
    if (!confirm('Remove this image from the library? (Universities already using it keep their photo.)')) return;
    await adminApi.deleteImageAsset(id);
    onChanged();
  };

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Image Library</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Paste an image URL..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
        <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Label (optional)" className="sm:w-40 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
        <Button type="button" onClick={addLink}>Add Link</Button>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          className="block text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 dark:file:bg-slate-800 file:text-brand-700 dark:file:text-brand-300 file:text-xs" />
        {uploading && <span className="text-xs text-muted">Uploading...</span>}
      </div>
      {msg && <p className="text-xs text-muted mb-4">{msg}</p>}

      {!assets || assets.length === 0 ? (
        <p className="text-sm text-muted">No images yet — add one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <img src={a.url} alt={a.label} className="h-28 w-full object-cover" />
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted truncate">{a.label}</p>
                <select
                  value={assignTarget[a.id] ?? ''}
                  onChange={(e) => setAssignTarget({ ...assignTarget, [a.id]: e.target.value })}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">Assign to university...</option>
                  {universities?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button type="button" className="flex-1 text-xs" onClick={() => assign(a.url, assignTarget[a.id])}>Set as Cover</Button>
                  <button onClick={() => removeAsset(a.id)} className="text-slate-400 hover:text-rose-500 p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}}