import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function About() {
  return (
    <div className="container-page py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">About EduVerse Pakistan</h1>
        <p className="mt-4 text-muted text-lg">
          We're building the platform we wish existed when we were choosing a university — one place to search, compare, and plan your higher education journey across Pakistan.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Target, title: 'Our Mission', desc: 'Make reliable, structured information about every HEC-recognized university accessible to every student, regardless of background.' },
          { icon: Eye, title: 'Our Vision', desc: 'A Pakistan where the right information — not just the right connections — decides where a student goes to university.' },
          { icon: Heart, title: 'Our Values', desc: 'Transparency, accuracy, and putting students first in every feature we build.' },
        ].map((v) => (
          <Card key={v.title} className="p-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <v.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{v.title}</h3>
            <p className="text-sm text-muted">{v.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 md:p-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">A note on our data</h2>
        <p className="text-muted leading-relaxed">
          EduVerse Pakistan is designed to eventually host verified data for every HEC-recognized university. We're growing our database
          continuously — university admins and HEC-affiliated staff can use our CSV/JSON import tools to add and update accurate
          information. Figures shown for fees, merit and rankings should always be confirmed on the university's official website
          before making admission decisions.
        </p>
      </Card>
    </div>
  );
}
