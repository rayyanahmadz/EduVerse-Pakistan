import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, ArrowLeft, RotateCcw, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { listDegrees } from '../lib/queries';
import { Degree } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrencyPKR } from '../lib/utils';

// Rule-based recommendation engine — no external AI API required.
// Each answer nudges a set of interest "tags". Degrees are scored by matching
// keywords in their titles against the student's strongest tags.
type Tag = 'TECH' | 'ENGINEERING' | 'MEDICAL' | 'BUSINESS' | 'CREATIVE' | 'RESEARCH';

const TAG_KEYWORDS: Record<Tag, string[]> = {
  TECH: ['computer', 'software', 'data', 'ai', 'information'],
  ENGINEERING: ['engineering', 'electrical', 'mechanical', 'civil'],
  MEDICAL: ['mbbs', 'medicine', 'health', 'nursing', 'pharma'],
  BUSINESS: ['bba', 'business', 'accounting', 'finance', 'management', 'economics'],
  CREATIVE: ['design', 'arts', 'media', 'architecture'],
  RESEARCH: ['science', 'biology', 'chemistry', 'physics', 'mathematics'],
};

interface Question {
  id: string;
  prompt: string;
  options: { label: string; tags: Tag[] }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'subject',
    prompt: 'Which subject did you enjoy most in school?',
    options: [
      { label: 'Math & Physics', tags: ['ENGINEERING', 'RESEARCH'] },
      { label: 'Biology & Chemistry', tags: ['MEDICAL', 'RESEARCH'] },
      { label: 'Computer Studies', tags: ['TECH'] },
      { label: 'Business & Economics', tags: ['BUSINESS'] },
      { label: 'Art & Languages', tags: ['CREATIVE'] },
    ],
  },
  {
    id: 'workstyle',
    prompt: 'What kind of work energizes you?',
    options: [
      { label: 'Solving technical problems', tags: ['TECH', 'ENGINEERING'] },
      { label: 'Helping people directly', tags: ['MEDICAL'] },
      { label: 'Leading and organizing teams', tags: ['BUSINESS'] },
      { label: 'Creating and designing things', tags: ['CREATIVE'] },
      { label: 'Researching and analyzing data', tags: ['RESEARCH'] },
    ],
  },
  {
    id: 'environment',
    prompt: 'What work environment appeals to you most?',
    options: [
      { label: 'Tech company or startup', tags: ['TECH'] },
      { label: 'Hospital or clinic', tags: ['MEDICAL'] },
      { label: 'Corporate office', tags: ['BUSINESS'] },
      { label: 'Lab, workshop, or field site', tags: ['ENGINEERING', 'RESEARCH'] },
      { label: 'Studio or creative agency', tags: ['CREATIVE'] },
    ],
  },
  {
    id: 'priority',
    prompt: 'What matters most to you in a career?',
    options: [
      { label: 'High growth & innovation', tags: ['TECH'] },
      { label: 'Job stability & structure', tags: ['ENGINEERING', 'BUSINESS'] },
      { label: 'Making a direct impact on people', tags: ['MEDICAL'] },
      { label: 'Creative freedom', tags: ['CREATIVE'] },
      { label: 'Intellectual discovery', tags: ['RESEARCH'] },
    ],
  },
];

function scoreDegree(title: string, tagScores: Record<Tag, number>): number {
  const lowerTitle = title.toLowerCase();
  let score = 0;
  (Object.keys(TAG_KEYWORDS) as Tag[]).forEach((tag) => {
    if (TAG_KEYWORDS[tag].some((kw) => lowerTitle.includes(kw))) {
      score += tagScores[tag] ?? 0;
    }
  });
  return score;
}

export default function CareerAdvisor() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Tag[]>>({});
  const [finished, setFinished] = useState(false);

  const { data: degrees } = useQuery({
    queryKey: ['degrees-all'],
    queryFn: () => listDegrees(),
    enabled: finished,
  });

  const handleAnswer = (tags: Tag[]) => {
    setAnswers((prev) => ({ ...prev, [QUESTIONS[step].id]: tags }));
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setFinished(false);
  };

  const tagScores: Record<Tag, number> = { TECH: 0, ENGINEERING: 0, MEDICAL: 0, BUSINESS: 0, CREATIVE: 0, RESEARCH: 0 };
  Object.values(answers).forEach((tags) => tags.forEach((t) => (tagScores[t] += 1)));

  const recommendations = degrees
    ? [...degrees].map((d) => ({ degree: d, score: scoreDegree(d.title, tagScores) })).sort((a, b) => b.score - a.score).slice(0, 3)
    : [];

  const topTag = (Object.entries(tagScores) as [Tag, number][]).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Compass className="h-7 w-7 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Career Advisor</h1>
        <p className="text-muted mt-2">Answer a few quick questions and get degree, career, and skill recommendations — powered by a transparent rule-based engine, no data leaves your browser.</p>
      </div>

      <div className="max-w-xl mx-auto">
        {!finished && (
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-6">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-xs text-muted mb-2">Question {step + 1} of {QUESTIONS.length}</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">{QUESTIONS[step].prompt}</h2>
                <div className="space-y-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleAnswer(opt.tags)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{opt.label}</span>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted hover:text-slate-700 dark:hover:text-slate-200 mt-6">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        )}

        {finished && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 text-center mb-6">
              <Sparkles className="h-8 w-8 text-brand-600 dark:text-brand-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Based on your answers, you lean towards</h2>
              <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-2">
                {topTag === 'TECH' && 'Technology & Computing'}
                {topTag === 'ENGINEERING' && 'Engineering'}
                {topTag === 'MEDICAL' && 'Medicine & Health Sciences'}
                {topTag === 'BUSINESS' && 'Business & Management'}
                {topTag === 'CREATIVE' && 'Design & Creative Fields'}
                {topTag === 'RESEARCH' && 'Science & Research'}
              </p>
            </Card>

            <div className="space-y-4 mb-6">
              {recommendations.length === 0 && <p className="text-center text-sm text-muted">No matching degrees found in the catalog yet.</p>}
              {recommendations.map(({ degree, score }, i) => (
                <Card key={degree.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge>{`#${i + 1} Match`}</Badge>
                      {score === 0 && <span className="text-xs text-muted">(general suggestion)</span>}
                    </div>
                    <Link to={`/degrees/${degree.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block mt-1">
                      {degree.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {degree.durationYears} yrs</span>
                      {degree.expectedSalaryMax && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> up to {formatCurrencyPKR(degree.expectedSalaryMax)}/mo</span>}
                    </div>
                  </div>
                  <Link to={`/degrees/${degree.slug}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
