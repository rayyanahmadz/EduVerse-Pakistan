// Shared by api/admin.ts and api/import.ts.
// NOT a route itself — files under api/_lib are not treated as endpoints by
// Vercel (only top-level files directly in /api are).
import type { VercelRequest } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

/** Service-role client — full database access. Server-side only, never import this in frontend code. */
export const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Verifies the request's Bearer token belongs to a logged-in user with role = 'ADMIN'. */
export async function requireAdmin(req: VercelRequest): Promise<{ id: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await admin.from('Profile').select('role').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') return null;

  return { id: user.id };
}
