import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend endpoint for contact messages in this MVP — this simulates submission.
    setSubmitted(true);
  };

  return (
    <div className="container-page py-16 grid md:grid-cols-2 gap-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h1>
        <p className="text-muted mb-8">Have a question, feedback, or want to add your university's data? We'd love to hear from you.</p>

        <div className="space-y-5">
          {[
            { icon: Mail, label: 'Email', value: 'hello@eduverse.pk' },
            { icon: Phone, label: 'Phone', value: '+92 300 1234567' },
            { icon: MapPin, label: 'Address', value: 'Islamabad, Pakistan' },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <c.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <div className="text-xs text-muted">{c.label}</div>
                <div className="font-medium text-slate-900 dark:text-white">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <Card className="p-8">
        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Message sent!</h3>
            <p className="text-sm text-muted mt-1">We'll get back to you within 1-2 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
