import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Save, CheckCircle2 } from 'lucide-react';
import { updateProfile } from '../lib/queries';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PAKISTAN_PROVINCES } from '../lib/constants';

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: user?.name ?? '', province: user?.province ?? '', city: user?.city ?? '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile(user.id, form);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-muted mt-1">Manage your profile and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-lg">{user.name}</h2>
              <p className="text-sm text-muted">{user.email}</p>
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-400">
                {user.role === 'ADMIN' ? 'Administrator' : 'Student'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                <option value="">Not specified</option>
                {PAKISTAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Lahore" />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={saving}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</p>
              <p className="text-xs text-muted">Switch between light and dark mode.</p>
            </div>
            <Button variant="outline" onClick={toggleTheme} type="button">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
