// Vercel Serverless Function: POST /api/import
//
// Bulk-imports universities from CSV text or a JSON array, using the
// service-role key. Same admin-only guard as api/admin.ts. This is how the
// catalog grows to every HEC-recognized university without touching code —
// paste a CSV or JSON payload in the Admin Panel's Bulk Import tab.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { admin, slugify, requireAdmin } from './_lib/supabaseAdmin.js';

interface ImportRow {
  row: number;
  status: 'created' | 'skipped';
  reason?: string;
}

const REQUIRED_FIELDS = ['name', 'province', 'city', 'sector'];
const VALID_SECTORS = ['PUBLIC', 'PRIVATE', 'SEMI_GOVERNMENT'];
const VALID_GENDER_POLICIES = ['CO_EDUCATION', 'MALE_ONLY', 'FEMALE_ONLY'];

/** Minimal CSV parser — handles quoted fields with commas, good enough for a simple flat university sheet. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const cells = parseLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

function normalizeRow(raw: Record<string, any>): { ok: boolean; data?: any; reason?: string } {  for (const field of REQUIRED_FIELDS) {
    if (!raw[field] || String(raw[field]).trim() === '') {
      return { ok: false, reason: `Missing required field "${field}"` };
    }
  }

  const sector = String(raw.sector).toUpperCase().trim();
  if (!VALID_SECTORS.includes(sector)) {
    return { ok: false, reason: `Invalid sector "${raw.sector}" (expected PUBLIC, PRIVATE, or SEMI_GOVERNMENT)` };
  }

  const genderPolicy = raw.genderPolicy ? String(raw.genderPolicy).toUpperCase().trim() : 'CO_EDUCATION';
  if (!VALID_GENDER_POLICIES.includes(genderPolicy)) {
    return { ok: false, reason: `Invalid genderPolicy "${raw.genderPolicy}"` };
  }

  return {
    ok: true,
    data: {
      name: String(raw.name).trim(),
      shortName: raw.shortName || null,
      sector,
      province: String(raw.province).trim(),
      city: String(raw.city).trim(),
      website: raw.website || null,
      email: raw.email || null,
      phone: raw.phone || null,
      hecRanking: raw.hecRanking ? Number(raw.hecRanking) : null,
      establishedYear: raw.establishedYear ? Number(raw.establishedYear) : null,
      genderPolicy,
      hasHostel: raw.hasHostel === true || String(raw.hasHostel).toLowerCase() === 'true',
      hostelFeePerYear: raw.hostelFeePerYear ? Number(raw.hostelFeePerYear) : null,
      description: raw.description || null,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  const caller = await requireAdmin(req);
if ('error' in caller) {
  return res.status(403).json({ success: false, message: caller.error });
}

  const { format, csvText, universities } = req.body ?? {};

  let rawRows: Record<string, any>[] = [];
  if (format === 'csv') {
    if (typeof csvText !== 'string' || !csvText.trim()) {
      return res.status(400).json({ success: false, message: 'csvText is required for format="csv".' });
    }
    rawRows = parseCsv(csvText);
  } else if (format === 'json') {
    if (!Array.isArray(universities)) {
      return res.status(400).json({ success: false, message: 'universities must be an array for format="json".' });
    }
    rawRows = universities;
  } else {
    return res.status(400).json({ success: false, message: 'format must be "csv" or "json".' });
  }

  const details: ImportRow[] = [];
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 1;
    const normalized = normalizeRow(rawRows[i]);

    if (!normalized.ok) {
      skipped++;
details.push({ row: rowNumber, status: 'skipped', reason: normalized.reason ?? 'Invalid row.' });      continue;
    }

    const slug = slugify(normalized.data.name);
    const { error } = await admin.from('University').insert({ ...normalized.data, slug });

    if (error) {
      skipped++;
      details.push({ row: rowNumber, status: 'skipped', reason: error.message.includes('duplicate') ? 'A university with this name already exists.' : error.message });
    } else {
      created++;
      details.push({ row: rowNumber, status: 'created' });
    }
  }

  return res.status(200).json({
    success: true,
    data: { totalRows: rawRows.length, created, skipped, details },
  });
}
