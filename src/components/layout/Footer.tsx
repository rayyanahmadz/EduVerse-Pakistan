import { Link } from 'react-router-dom';
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mt-24">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            EduVerse Pakistan
          </div>
          <p className="text-sm text-muted max-w-xs">Pakistan's complete university & higher education platform — helping students find, compare and get into the right university.</p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/universities" className="hover:text-brand-600">Universities</Link></li>
            <li><Link to="/degrees" className="hover:text-brand-600">Degrees</Link></li>
            <li><Link to="/scholarships" className="hover:text-brand-600">Scholarships</Link></li>
            <li><Link to="/compare" className="hover:text-brand-600">Compare</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Tools</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/merit-predictor" className="hover:text-brand-600">Merit Predictor</Link></li>
            <li><Link to="/career-advisor" className="hover:text-brand-600">Career Advisor</Link></li>
            <li><Link to="/admission-calendar" className="hover:text-brand-600">Admission Calendar</Link></li>
            <li><Link to="/fee-calculator" className="hover:text-brand-600">Fee Calculator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/about" className="hover:text-brand-600">About</Link></li>
            <li><Link to="/contact" className="hover:text-brand-600">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} EduVerse Pakistan. All rights reserved.
      </div>
    </footer>
  );
}
