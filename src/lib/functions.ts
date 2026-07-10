import { supabase } from './supabase';

/**
 * Calls one of the Vercel Serverless Functions in /api (admin.ts or import.ts).
 * Automatically attaches the current user's Supabase access token so the
 * function can verify the caller is an authenticated admin before touching
 * the database with the service-role key.
 */
async function callFunction<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`/api/${path}`, {
    method: options.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request to /api/${path} failed (${res.status})`);
  }

  return json.data as T;
}

export const adminApi = {
  createUniversity: (payload: unknown) => callFunction('admin', { body: { resource: 'university', action: 'create', payload } }),
  updateUniversity: (id: string, payload: unknown) => callFunction('admin', { body: { resource: 'university', action: 'update', id, payload } }),
  deleteUniversity: (id: string) => callFunction('admin', { body: { resource: 'university', action: 'delete', id } }),

  createDegree: (payload: unknown) => callFunction('admin', { body: { resource: 'degree', action: 'create', payload } }),
  updateDegree: (id: string, payload: unknown) => callFunction('admin', { body: { resource: 'degree', action: 'update', id, payload } }),
  linkDegree: (payload: unknown) => callFunction('admin', { body: { resource: 'universityDegree', action: 'create', payload } }),
unlinkDegree: (id: string) => callFunction('admin', { body: { resource: 'universityDegree', action: 'delete', id } }),
  createScholarship: (payload: unknown) => callFunction('admin', { body: { resource: 'scholarship', action: 'create', payload } }),
  createDeadline: (payload: unknown) => callFunction('admin', { body: { resource: 'deadline', action: 'create', payload } }),
updateDeadline: (id: string, payload: unknown) => callFunction('admin', { body: { resource: 'deadline', action: 'update', id, payload } }),
deleteDeadline: (id: string) => callFunction('admin', { body: { resource: 'deadline', action: 'delete', id } }),
  stats: () => callFunction<{ universities: number; degrees: number; scholarships: number; users: number; reviews: number }>('admin', {
    body: { resource: 'stats', action: 'read' },
  }),
};

export const importApi = {
 importJson: (resource: 'university' | 'degree' | 'scholarship' | 'deadline', rows: unknown[]) =>
  callFunction('import', { body: { resource, format: 'json', rows } }),
importCsv: (resource: 'university' | 'degree' | 'scholarship' | 'deadline', csvText: string) =>
  callFunction('import', { body: { resource, format: 'csv', csvText } }),
};
