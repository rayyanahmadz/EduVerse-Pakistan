// Vercel Serverless Function: POST /api/import
//
// Bulk-imports universities, degrees, scholarships, or admission-calendar
// deadlines from CSV text or a JSON array, using the service-role key.
// Same admin-only guard as api/admin.ts. This is how the catalog grows
// without touching code — paste a CSV or JSON payload in the Admin Panel's
// Bulk Import tab, pick which resource it's for, and go.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { admin, slugify, requireAdmin } from './_lib/supabaseAdmin.js';

interface ImportRow {
  row: number;
  status: 'created' | 'skipped';
  reason?: string;
}

/** Minimal CSV parser — handles quoted fields with commas. */
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

function splitList(value: any): string[] {
  if (!value) return [];
  return String(value).split(/[;|]/).map((s) => s.trim()).filter(Boolean);
}

type NormalizeResult = { ok: boolean; data?: any; reason?: string };

// ---------------------------------------------------------------------------
// University
// ---------------------------------------------------------------------------
const VALID_SECTORS = ['PUBLIC', 'PRIVATE', 'SEMI_GOVERNMENT'];
const VALID_GENDER_POLICIES = ['CO_EDUCATION', 'MALE_ONLY', 'FEMALE_ONLY'];

function normalizeUniversity(raw: Record<string, any>): NormalizeResult {
  for (const field of ['name', 'province', 'city', 'sector']) {
    if (!raw[field] || String(raw[field]).trim() === '') return { ok: false, reason: `Missing required field "${field}"` };
  }
  const sector = String(raw.sector).toUpperCase().trim();
  if (!VALID_SECTORS.includes(sector)) return { ok: false, reason: `Invalid sector "${raw.sector}" (expected PUBLIC, PRIVATE, or SEMI_GOVERNMENT)` };

  const genderPolicy = raw.genderPolicy ? String(raw.genderPolicy).toUpperCase().trim() : 'CO_EDUCATION';
  if (!VALID_GENDER_POLICIES.includes(genderPolicy)) return { ok: false, reason: `Invalid genderPolicy "${raw.genderPolicy}"` };

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

// ---------------------------------------------------------------------------
// Degree
// ---------------------------------------------------------------------------
const VALID_LEVELS = ['ASSOCIATE', 'BACHELORS', 'MASTERS', 'MPHIL', 'PHD', 'DIPLOMA'];

function normalizeDegree(raw: Record<string, any>): NormalizeResult {
  if (!raw.title || String(raw.title).trim() === '') return { ok: false, reason: 'Missing required field "title"' };
  const level = raw.level ? String(raw.level).toUpperCase().trim() : 'BACHELORS';
  if (!VALID_LEVELS.includes(level)) return { ok: false, reason: `Invalid level "${raw.level}" (expected one of ${VALID_LEVELS.join(', ')})` };

  return {
    ok: true,
    data: {
      title: String(raw.title).trim(),
      level,
      durationYears: raw.durationYears ? Number(raw.durationYears) : 4,
      overview: raw.overview || null,
      eligibility: raw.eligibility || null,
      careerOpportunities: raw.careerOpportunities || null,
      futureScope: raw.futureScope || null,
      expectedSalaryMin: raw.expectedSalaryMin ? Number(raw.expectedSalaryMin) : null,
      expectedSalaryMax: raw.expectedSalaryMax ? Number(raw.expectedSalaryMax) : null,
      skillsNeeded: splitList(raw.skillsNeeded),
    },
  };
}

// ---------------------------------------------------------------------------
// Scholarship
// ---------------------------------------------------------------------------
const VALID_CATEGORIES = ['MERIT', 'NEED_BASED', 'PROVINCIAL', 'INTERNATIONAL', 'GOVERNMENT', 'PRIVATE'];

function normalizeScholarship(raw: Record<string, any>): NormalizeResult {
  if (!raw.name || String(raw.name).trim() === '') return { ok: false, reason: 'Missing required field "name"' };
  const category = raw.category ? String(raw.category).toUpperCase().trim() : '';
  if (!VALID_CATEGORIES.includes(category)) return { ok: false, reason: `Invalid category "${raw.category}" (expected one of ${VALID_CATEGORIES.join(', ')})` };

  return {
    ok: true,
    data: {
      name: String(raw.name).trim(),
      category,
      province: raw.province || null,
      isInternational: raw.isInternational === true || String(raw.isInternational).toLowerCase() === 'true',
      benefits: raw.benefits || null,
      eligibility: raw.eligibility || null,
      requiredDocuments: splitList(raw.requiredDocuments),
      deadline: raw.deadline ? new Date(raw.deadline).toISOString() : null,
      officialLink: raw.officialLink || null,
      description: raw.description || null,
    },
  };
}
// ---------------------------------------------------------------------------
// UniversityDegree — links an existing degree to an existing university
// with per-program fee and merit data. Needs both FKs resolved.
// ---------------------------------------------------------------------------
async function normalizeUniversityDegree(raw: Record<string, any>): Promise<NormalizeResult> {
  const universityKey = raw.universitySlug || raw.universityName;
  const degreeKey = raw.degreeSlug || raw.degreeTitle;
  if (!universityKey) return { ok: false, reason: 'Missing required field "universitySlug" (or "universityName")' };
  if (!degreeKey) return { ok: false, reason: 'Missing required field "degreeSlug" (or "degreeTitle")' };

  let uQuery = admin.from('University').select('id').limit(1);
  uQuery = raw.universitySlug ? uQuery.eq('slug', String(raw.universitySlug).trim()) : uQuery.ilike('name', String(raw.universityName).trim());
  const { data: uni, error: uniError } = await uQuery.maybeSingle();
  if (uniError) return { ok: false, reason: `University lookup failed: ${uniError.message}` };
  if (!uni) return { ok: false, reason: `No university found matching "${universityKey}"` };

  let dQuery = admin.from('Degree').select('id').limit(1);
  dQuery = raw.degreeSlug ? dQuery.eq('slug', String(raw.degreeSlug).trim()) : dQuery.ilike('title', String(raw.degreeTitle).trim());
  const { data: deg, error: degError } = await dQuery.maybeSingle();
  if (degError) return { ok: false, reason: `Degree lookup failed: ${degError.message}` };
  if (!deg) return { ok: false, reason: `No degree found matching "${degreeKey}"` };

  return {
    ok: true,
    data: {
      universityId: uni.id,
      degreeId: deg.id,
      semesterFee: raw.semesterFee ? Number(raw.semesterFee) : null,
      totalFee: raw.totalFee ? Number(raw.totalFee) : null,
      lastYearAggregate: raw.lastYearAggregate ? Number(raw.lastYearAggregate) : null,
      seatsAvailable: raw.seatsAvailable ? Number(raw.seatsAvailable) : null,
      entryTestRequired: raw.entryTestRequired === true || String(raw.entryTestRequired).toLowerCase() === 'true',
      entryTestName: raw.entryTestName || null,
    },
  };
}
// ---------------------------------------------------------------------------
// UniversityScholarship — links an existing scholarship to an existing
// university. Needs both FKs resolved.
// ---------------------------------------------------------------------------
async function normalizeUniversityScholarship(raw: Record<string, any>): Promise<NormalizeResult> {
  const universityKey = raw.universitySlug || raw.universityName;
  const scholarshipKey = raw.scholarshipSlug || raw.scholarshipName;
  if (!universityKey) return { ok: false, reason: 'Missing required field "universitySlug" (or "universityName")' };
  if (!scholarshipKey) return { ok: false, reason: 'Missing required field "scholarshipSlug" (or "scholarshipName")' };

  let uQuery = admin.from('University').select('id').limit(1);
  uQuery = raw.universitySlug ? uQuery.eq('slug', String(raw.universitySlug).trim()) : uQuery.ilike('name', String(raw.universityName).trim());
  const { data: uni, error: uniError } = await uQuery.maybeSingle();
  if (uniError) return { ok: false, reason: `University lookup failed: ${uniError.message}` };
  if (!uni) return { ok: false, reason: `No university found matching "${universityKey}"` };

  let sQuery = admin.from('Scholarship').select('id').limit(1);
  sQuery = raw.scholarshipSlug ? sQuery.eq('slug', String(raw.scholarshipSlug).trim()) : sQuery.ilike('name', String(raw.scholarshipName).trim());
  const { data: sch, error: schError } = await sQuery.maybeSingle();
  if (schError) return { ok: false, reason: `Scholarship lookup failed: ${schError.message}` };
  if (!sch) return { ok: false, reason: `No scholarship found matching "${scholarshipKey}"` };

  return { ok: true, data: { universityId: uni.id, scholarshipId: sch.id } };
}
// ---------------------------------------------------------------------------
// Deadline — needs a university lookup (slug or name) to resolve the FK
// ---------------------------------------------------------------------------
const VALID_DEADLINE_TYPES = ['ADMISSION_OPEN', 'ADMISSION_CLOSE', 'ENTRY_TEST', 'INTERVIEW', 'MERIT_LIST', 'SCHOLARSHIP_DEADLINE', 'CLASSES_START'];

async function normalizeDeadline(raw: Record<string, any>): Promise<NormalizeResult> {
  const universityKey = raw.universitySlug || raw.universityName;
  if (!universityKey) return { ok: false, reason: 'Missing required field "universitySlug" (or "universityName")' };
  if (!raw.title) return { ok: false, reason: 'Missing required field "title"' };
  if (!raw.date) return { ok: false, reason: 'Missing required field "date"' };

  const type = raw.type ? String(raw.type).toUpperCase().trim() : '';
  if (!VALID_DEADLINE_TYPES.includes(type)) return { ok: false, reason: `Invalid type "${raw.type}" (expected one of ${VALID_DEADLINE_TYPES.join(', ')})` };

  const date = new Date(raw.date);
  if (Number.isNaN(date.getTime())) return { ok: false, reason: `Invalid date "${raw.date}" (use YYYY-MM-DD)` };

  let query = admin.from('University').select('id').limit(1);
  query = raw.universitySlug ? query.eq('slug', String(raw.universitySlug).trim()) : query.ilike('name', String(raw.universityName).trim());
  const { data: uni, error: uniError } = await query.maybeSingle();
  if (uniError) return { ok: false, reason: `University lookup failed: ${uniError.message}` };
  if (!uni) return { ok: false, reason: `No university found matching "${universityKey}"` };

  return {
    ok: true,
    data: {
      universityId: uni.id,
      type,
      title: String(raw.title).trim(),
      date: date.toISOString(),
      notes: raw.notes || null,
    },
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
const TABLES: Record<string, string> = {
  university: 'University',
  degree: 'Degree',
  scholarship: 'Scholarship',
  deadline: 'Deadline',
  universityDegree: 'UniversityDegree',
  universityScholarship: 'UniversityScholarship',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed. Use POST.' });
  }

  const caller = await requireAdmin(req);
  if ('error' in caller) {
    return res.status(403).json({ success: false, message: caller.error });
  }

  const { resource = 'university', format, csvText, rows: jsonRows, universities } = req.body ?? {};

  if (!TABLES[resource]) {
    return res.status(400).json({ success: false, message: `Unknown resource "${resource}". Expected university, degree, scholarship, or deadline.` });
  }

  let rawRows: Record<string, any>[] = [];
  if (format === 'csv') {
    if (typeof csvText !== 'string' || !csvText.trim()) {
      return res.status(400).json({ success: false, message: 'csvText is required for format="csv".' });
    }
    rawRows = parseCsv(csvText);
  } else if (format === 'json') {
    // "universities" is kept as a legacy alias so old frontend code calling
    // importJson(universities) for university imports keeps working.
    const arr = jsonRows ?? universities;
    if (!Array.isArray(arr)) {
      return res.status(400).json({ success: false, message: '"rows" must be an array for format="json".' });
    }
    rawRows = arr;
  } else {
    return res.status(400).json({ success: false, message: 'format must be "csv" or "json".' });
  }

  const details: ImportRow[] = [];
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 1;

    let normalized: NormalizeResult;
    if (resource === 'university') normalized = normalizeUniversity(rawRows[i]);
    else if (resource === 'degree') normalized = normalizeDegree(rawRows[i]);
    else if (resource === 'scholarship') normalized = normalizeScholarship(rawRows[i]);
    else if (resource === 'deadline') normalized = await normalizeDeadline(rawRows[i]);
    else if (resource === 'universityDegree') normalized = await normalizeUniversityDegree(rawRows[i]);
    else normalized = await normalizeUniversityScholarship(rawRows[i]);
    if (!normalized.ok) {
      skipped++;
      details.push({ row: rowNumber, status: 'skipped', reason: normalized.reason ?? 'Invalid row.' });
      continue;
    }

    const table = TABLES[resource];
    const isLinkResource = resource === 'universityDegree' || resource === 'universityScholarship';
    const needsSlug = resource !== 'deadline' && !isLinkResource;
    const insertData = needsSlug ? { ...normalized.data, slug: slugify(normalized.data.name ?? normalized.data.title) } : normalized.data;

    const { error } = resource === 'universityDegree'
      ? await admin.from(table).upsert(insertData, { onConflict: 'universityId,degreeId' })
      : resource === 'universityScholarship'
      ? await admin.from(table).upsert(insertData, { onConflict: 'universityId,scholarshipId' })
      : await admin.from(table).insert(insertData);

    if (error) {
      skipped++;
      details.push({ row: rowNumber, status: 'skipped', reason: error.message.includes('duplicate') ? 'A row with this name/title already exists.' : error.message });
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