import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-page py-24 flex flex-col items-center justify-center text-center min-h-[70vh]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <div className="h-20 w-20 rounded-3xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <Compass className="h-10 w-10 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white">404</h1>
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mt-3">This page took a wrong turn.</p>
        <p className="text-muted mt-2 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Let's get you back to finding your future university.
        </p>
        <Link to="/">
          <Button className="mt-8">
            <Home className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
