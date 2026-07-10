import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, Wallet } from 'lucide-react';
import { listUniversities } from '../lib/queries';
import { UniversitySummary } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrencyPKR } from '../lib/utils';
import { DataDisclaimer } from '../components/ui/DataDisclaimer';

export default function FeeCalculator() {
  const [universityId, setUniversityId] = useState('');
  const [costs, setCosts] = useState({
    tuitionPerSemester: '',
    hostelPerYear: '',
    booksPerYear: '20000',
    transportPerMonth: '5000',
    livingPerMonth: '15000',
  });

  const { data: universities } = useQuery({
    queryKey: ['universities-all-basic'],
    queryFn: async () => (await listUniversities({ pageSize: 50 })).data,
  });

  const selectedUni = universities?.find((u) => u.id === universityId);

  const handleUniversitySelect = (id: string) => {
    setUniversityId(id);
    const uni = universities?.find((u) => u.id === id);
    setCosts((prev) => ({
      ...prev,
      tuitionPerSemester: uni?.semesterFee ? String(uni.semesterFee) : prev.tuitionPerSemester,
      hostelPerYear: uni?.hostelFeePerYear ? String(uni.hostelFeePerYear) : prev.hostelPerYear,
    }));
  };

  const totals = useMemo(() => {
    const tuition = (parseFloat(costs.tuitionPerSemester) || 0) * 2;
    const hostel = parseFloat(costs.hostelPerYear) || 0;
    const books = parseFloat(costs.booksPerYear) || 0;
    const transport = (parseFloat(costs.transportPerMonth) || 0) * 12;
    const living = (parseFloat(costs.livingPerMonth) || 0) * 12;
    const total = tuition + hostel + books + transport + living;
    return { tuition, hostel, books, transport, living, total };
  }, [costs]);

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <CalcIcon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fee Calculator</h1>
        <p className="text-muted mt-2">Estimate your total yearly cost of studying — tuition, hostel, books, transport, and living expenses.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        <Card className="p-6 sm:p-8 space-y-4">
          <Select label="University (optional — auto-fills fees)" value={universityId} onChange={(e) => handleUniversitySelect(e.target.value)}>
            <option value="">Enter costs manually</option>
            {universities?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Input label="Tuition per Semester (Rs.)" type="number" min={0} value={costs.tuitionPerSemester} onChange={(e) => setCosts({ ...costs, tuitionPerSemester: e.target.value })} />
          <Input label="Hostel per Year (Rs.)" type="number" min={0} value={costs.hostelPerYear} onChange={(e) => setCosts({ ...costs, hostelPerYear: e.target.value })} />
          <Input label="Books & Supplies per Year (Rs.)" type="number" min={0} value={costs.booksPerYear} onChange={(e) => setCosts({ ...costs, booksPerYear: e.target.value })} />
          <Input label="Transport per Month (Rs.)" type="number" min={0} value={costs.transportPerMonth} onChange={(e) => setCosts({ ...costs, transportPerMonth: e.target.value })} />
          <Input label="Living / Food per Month (Rs.)" type="number" min={0} value={costs.livingPerMonth} onChange={(e) => setCosts({ ...costs, livingPerMonth: e.target.value })} />
        </Card>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 sm:p-8 sticky top-24">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Yearly Estimate {selectedUni && `— ${selectedUni.shortName || selectedUni.name}`}
            </h2>
            <div className="mt-5 space-y-3 text-sm">
              <Row label="Tuition (2 semesters)" value={totals.tuition} />
              <Row label="Hostel" value={totals.hostel} />
              <Row label="Books & Supplies" value={totals.books} />
              <Row label="Transport (12 months)" value={totals.transport} />
              <Row label="Living / Food (12 months)" value={totals.living} />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-4 flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">Total per Year</span>
              <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">{formatCurrencyPKR(totals.total)}</span>
            </div>
<DataDisclaimer compact />          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrencyPKR(value)}</span>
    </div>
  );
}
