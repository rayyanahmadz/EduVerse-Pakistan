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
export async function requireAdmin(req: VercelRequest): Promise<{ id: string } | { error: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return { error: 'No Authorization header sent.' };
  const token = authHeader.slice('Bearer '.length);

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error) return { error: `Token rejected by Supabase: ${error.message}` };
  if (!user) return { error: 'Token valid but no user found.' };

  const { data: profile, error: profileError } = await admin.from('Profile').select('role').eq('id', user.id).single();
  if (profileError) return { error: `Could not read Profile row: ${profileError.message}` };
  if (profile?.role !== 'ADMIN') return { error: `Profile role is "${profile?.role}", not ADMIN.` };

  return { id: user.id };
}
