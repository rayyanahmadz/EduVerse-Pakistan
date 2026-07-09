import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Shield, Sparkles, Target } from 'lucide-react';
import { predictMerit } from '../lib/queries';
import { MeritPredictionResult } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatCurrencyPKR } from '../lib/utils';

export default function MeritPredictor() {
  const [form, setForm] = useState({ matricMarks: '', interMarks: '', entryTestMarks: '' });
  const [result, setResult] = useState<MeritPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await predictMerit({
        matricMarks: parseFloat(form.matricMarks),
        interMarks: parseFloat(form.interMarks),
        entryTestMarks: form.entryTestMarks ? parseFloat(form.entryTestMarks) : undefined,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate. Check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Calculator className="h-7 w-7 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Merit Predictor</h1>
        <p className="text-muted mt-2">Enter your marks to calculate your aggregate and see which universities you're likely to get into.</p>
      </div>

      <Card className="max-w-xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Matric Marks (%)" type="number" min={0} max={100} step="0.01" required value={form.matricMarks} onChange={(e) => setForm({ ...form, matricMarks: e.target.value })} placeholder="e.g. 88.5" />
          <Input label="Intermediate Marks (%)" type="number" min={0} max={100} step="0.01" required value={form.interMarks} onChange={(e) => setForm({ ...form, interMarks: e.target.value })} placeholder="e.g. 85.2" />
          <Input label="Entry Test Score (%) — optional" type="number" min={0} max={100} step="0.01" value={form.entryTestMarks} onChange={(e) => setForm({ ...form, entryTestMarks: e.target.value })} placeholder="e.g. 78 (NET, ECAT, etc.)" />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <Button type="submit" className="w-full" isLoading={loading}>Calculate My Merit</Button>
        </form>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="text-sm text-muted">Your Calculated Aggregate</div>
            <div className="text-5xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">{result.aggregate}%</div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ResultColumn title="Safe Universities" icon={Shield} color="emerald" items={result.safeUniversities} />
            <ResultColumn title="Moderate Universities" icon={Target} color="amber" items={result.moderateUniversities} />
            <ResultColumn title="Dream Universities" icon={Sparkles} color="purple" items={result.dreamUniversities} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ResultColumn({ title, icon: Icon, color, items }: { title: string; icon: any; color: string; items: MeritPredictionResult['safeUniversities'] }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  };
  return (
    <Card className="p-5">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${colorMap[color]}`}>
        <Icon className="h-4 w-4" /> {title}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">No matches found in this category.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="font-medium text-sm text-slate-900 dark:text-white">{it.universityName}</div>
              <div className="text-xs text-muted">{it.degreeTitle} • {it.city}</div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-muted">Last year: {it.lastYearAggregate ?? 'N/A'}%</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrencyPKR(it.semesterFee)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
