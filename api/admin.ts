// Vercel Serverless Function: POST /api/admin
//
// Handles every admin write (create/update/delete universities, degrees,
// scholarships, calendar deadlines, and admin stats) using the Supabase
// SERVICE ROLE key, which bypasses Row Level Security. This key only ever
// lives here, as a server-side environment variable — it is never sent to
// the browser.
//
// Every request must carry `Authorization: Bearer <supabase access token>`.
// We verify that token belongs to a real user AND that the user's Profile
// row has role = 'ADMIN' before touching the database. Anyone else gets 403.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { admin, slugify, requireAdmin } from './_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  const caller = await requireAdmin(req);
if ('error' in caller) {
  return res.status(403).json({ success: false, message: caller.error });
}

  const { resource, action, id, payload } = req.body ?? {};

  try {
    switch (resource) {
      case 'stats': {
        const [universities, degrees, scholarships, users, reviews] = await Promise.all([
          admin.from('University').select('id', { count: 'exact', head: true }),
          admin.from('Degree').select('id', { count: 'exact', head: true }),
          admin.from('Scholarship').select('id', { count: 'exact', head: true }),
          admin.from('Profile').select('id', { count: 'exact', head: true }),
          admin.from('Review').select('id', { count: 'exact', head: true }),
        ]);
        return res.status(200).json({
          success: true,
          data: {
            universities: universities.count ?? 0,
            degrees: degrees.count ?? 0,
            scholarships: scholarships.count ?? 0,
            users: users.count ?? 0,
            reviews: reviews.count ?? 0,
          },
        });
      }

      case 'university': {
        if (action === 'create') {
          const { data, error } = await admin
            .from('University')
            .insert({ ...payload, slug: slugify(payload.name), hecRanking: payload.hecRanking ? Number(payload.hecRanking) : null })
            .select()
            .single();
          if (error) throw error;
          return res.status(201).json({ success: true, data });
        }
        if (action === 'update') {
          const { data, error } = await admin.from('University').update(payload).eq('id', id).select().single();
          if (error) throw error;
          return res.status(200).json({ success: true, data });
        }
        if (action === 'delete') {
          const { error } = await admin.from('University').delete().eq('id', id);
          if (error) throw error;
          return res.status(200).json({ success: true, data: null });
        }
        break;
      }

     case 'degree': {
  if (action === 'create') {
    const { data, error } = await admin.from('Degree').insert({ ...payload, slug: slugify(payload.title) }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  }
  if (action === 'update') {
    const { data, error } = await admin.from('Degree').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  }
  break;
}

      case 'universityDegree': {
        if (action === 'create') {
          const { data, error } = await admin
            .from('UniversityDegree')
            .upsert(payload, { onConflict: 'universityId,degreeId' })
            .select()
            .single();
          if (error) throw error;
          return res.status(201).json({ success: true, data });
        }
        break;
      }

      case 'scholarship': {
        if (action === 'create') {
          const { data, error } = await admin
            .from('Scholarship')
            .insert({ ...payload, slug: slugify(payload.name), requiredDocuments: payload.requiredDocuments ?? [] })
            .select()
            .single();
          if (error) throw error;
          return res.status(201).json({ success: true, data });
        }
        break;
      }

      case 'deadline': {
        if (action === 'create') {
          const { data, error } = await admin.from('Deadline').insert(payload).select().single();
          if (error) throw error;
          return res.status(201).json({ success: true, data });
        }
        break;
      }

      default:
        return res.status(400).json({ success: false, message: `Unknown resource: ${resource}` });
    }

    return res.status(400).json({ success: false, message: `Unknown action "${action}" for resource "${resource}".` });
  } catch (err) {
    console.error('api/admin error:', err);
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Internal server error.' });
  }
}
