import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, X, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { compareUniversities } from '../lib/queries';
import { UniversitySummary } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrencyPKR } from '../lib/utils';

interface CompareRow {
  id: string;
  slug: string;
  name: string;
  sector: string;
  province: string;
  city: string;
  hecRanking: number | null;
  hasHostel: boolean;
  hostelFeePerYear: number | null;
  hasSportsComplex: boolean;
  hasWifi: boolean;
  hasTransport: boolean;
  societiesCount: number | null;
  campusSizeAcres: number | null;
  averageRating: number | null;
  minSemesterFee: number | null;
  scholarshipsCount: number;
  degreesOffered: string[];
}

export default function Compare() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UniversitySummary[]>([]);
  const [compareData, setCompareData] = useState<CompareRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: searchResults } = useQuery({
    queryKey: ['compare-search', search],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('University')
        .select('id, slug, name, shortName, city, province, sector, hecRanking, hasHostel, hostelFeePerYear, genderPolicy, website, email, phone, coverImageUrl')
        .ilike('name', `%${search}%`)
        .limit(5);
      if (error) throw new Error(error.message);
      return (data ?? []) as UniversitySummary[];
    },
    enabled: search.length > 1,
  });

  const addUniversity = (u: UniversitySummary) => {
    if (selected.find((s) => s.id === u.id) || selected.length >= 6) return;
    setSelected([...selected, u]);
    setSearch('');
  };

  const removeUniversity = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
    setCompareData(null);
  };

  const runCompare = async () => {
    setLoading(true);
    try {
      const rows = await compareUniversities(selected.map((s) => s.id));
      setCompareData(rows as unknown as CompareRow[]);
    } finally {
      setLoading(false);
    }
  };

  const rows: { label: string; render: (r: CompareRow) => React.ReactNode }[] = [
    { label: 'Sector', render: (r) => r.sector },
    { label: 'Location', render: (r) => `${r.city}, ${r.province}` },
    { label: 'HEC Ranking', render: (r) => (r.hecRanking ? `#${r.hecRanking}` : 'N/A') },
    { label: 'Min. Semester Fee', render: (r) => formatCurrencyPKR(r.minSemesterFee) },
    { label: 'Hostel', render: (r) => (r.hasHostel ? formatCurrencyPKR(r.hostelFeePerYear) + '/yr' : 'Not Available') },
    { label: 'Sports Complex', render: (r) => (r.hasSportsComplex ? '✅' : '—') },
    { label: 'WiFi', render: (r) => (r.hasWifi ? '✅' : '—') },
    { label: 'Transport', render: (r) => (r.hasTransport ? '✅' : '—') },
    { label: 'Societies', render: (r) => r.societiesCount ?? 'N/A' },
    { label: 'Campus Size', render: (r) => (r.campusSizeAcres ? `${r.campusSizeAcres} acres` : 'N/A') },
    { label: 'Scholarships', render: (r) => r.scholarshipsCount },
    { label: 'Rating', render: (r) => (r.averageRating ? `⭐ ${r.averageRating}` : 'No reviews yet') },
    { label: 'Degrees Offered', render: (r) => (r.degreesOffered.length ? r.degreesOffered.join(', ') : 'N/A') },
  ];

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <GitCompare className="h-7 w-7 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">University Compare</h1>
        <p className="text-muted mt-2">Add up to 6 universities and compare them side-by-side.</p>
      </div>

      <Card className="max-w-2xl mx-auto p-6 mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a university to add..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searchResults && searchResults.length > 0 && search.length > 1 && (
            <div className="absolute z-10 mt-1 w-full card-surface shadow-lg overflow-hidden">
              {searchResults.map((u) => (
                <button key={u.id} onClick={() => addUniversity(u)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>{u.name}</span>
                  <span className="text-xs text-muted">{u.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-slate-800 text-sm text-brand-700 dark:text-brand-300">
              {s.shortName || s.name}
              <button onClick={() => removeUniversity(s.id)}><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" disabled={selected.length < 2} isLoading={loading} onClick={runCompare}>
          Compare {selected.length > 0 && `(${selected.length})`}
        </Button>
      </Card>

      {compareData && compareData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm text-muted font-medium sticky left-0 bg-white dark:bg-slate-950">Metric</th>
                {compareData.map((r) => (
                  <th key={r.id} className="p-3 text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">{r.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3 text-sm font-medium text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-950">{row.label}</td>
                  {compareData.map((r) => (
                    <td key={r.id} className="p-3 text-sm text-slate-700 dark:text-slate-300">{row.render(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!compareData && selected.length === 0 && (
        <EmptyState icon={GitCompare} title="Start comparing" description="Search and add universities above to see a detailed side-by-side comparison." />
      )}
    </div>
  );
}
