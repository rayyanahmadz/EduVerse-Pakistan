import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calculator, GitCompare, Award, Calendar, Brain, ArrowRight, GraduationCap, Users, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
  { icon: Search, title: 'Smart University Finder', desc: 'Filter by degree, budget, city, hostel and more to find your perfect match.', to: '/universities' },
  { icon: Calculator, title: 'Merit Predictor', desc: 'Enter your marks and instantly see safe, moderate, and dream universities.', to: '/merit-predictor' },
  { icon: GitCompare, title: 'University Compare', desc: 'Compare unlimited universities side-by-side on fee, merit, ranking and more.', to: '/compare' },
  { icon: Award, title: 'Scholarship Hub', desc: 'Discover merit, need-based, provincial and international scholarships.', to: '/scholarships' },
  { icon: Calendar, title: 'Admission Calendar', desc: 'Never miss a deadline — track admissions, tests and merit lists.', to: '/admission-calendar' },
  { icon: Brain, title: 'AI Career Advisor', desc: 'Answer a few questions and get personalized degree & career suggestions.', to: '/career-advisor' },
];

const stats = [
  { icon: Building2, value: '20+', label: 'Universities & growing' },
  { icon: GraduationCap, value: '7+', label: 'Degree programs mapped' },
  { icon: Users, value: '1000s', label: 'Students to be served' },
];

export default function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-brand-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative container-page pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 mb-6">
              🇵🇰 Built for Pakistani students
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Find your perfect <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">university</span> in Pakistan
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
              Search, compare and predict your admission chances across every HEC-recognized university — all in one beautifully designed platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/universities">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Universities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/merit-predictor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Predict My Merit
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <s.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything you need, in one place</h2>
          <p className="mt-3 text-muted">From discovery to admission, EduVerse guides every step of your higher education journey.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
              <Link to={f.to}>
                <Card className="p-6 h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-brand-600 transition-colors">
                    <f.icon className="h-5 w-5 text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted">{f.desc}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-purple-700 p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <h2 className="text-3xl font-bold">Ready to find your future?</h2>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">Create a free account to save universities, track applications, and get personalized recommendations.</p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="mt-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
