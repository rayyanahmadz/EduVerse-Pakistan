// ============================================================================
// Central data-access layer — every page reads/writes through these functions
// instead of calling a backend. Public catalog reads go straight to Supabase
// (protected by the public-read RLS policies in supabase/schema.sql). Writes
// to user-owned tables (saved items, reviews, applications, reminders) also
// go straight to Supabase, protected by owner-only RLS policies. Only admin
// writes and bulk import go through the two Vercel Serverless Functions in
// /api, because those need the service-role key and must never run in the
// browser.
// ============================================================================
import { supabase } from './supabase';
import { calculateAggregate, estimateAdmissionChance } from './merit';
import type {
  UniversitySummary, UniversityDetail, Degree, Scholarship, MeritPredictionResult, MeritMatch,
} from '../types';

type ReviewRatings = {
  teachingRating: number; campusRating: number; labsRating: number; internetRating: number;
  cafeteriaRating: number; sportsRating: number; securityRating: number; hostelRating?: number | null;
};

function averageRating(reviews: ReviewRatings[]): number | null {
  if (!reviews || reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + (r.teachingRating + r.campusRating + r.labsRating + r.internetRating + r.cafeteriaRating + r.sportsRating + r.securityRating) / 7, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Universities — Smart Finder
// ---------------------------------------------------------------------------
export interface UniversityFilterParams {
  search?: string;
  province?: string;
  city?: string;
  sector?: string;
  gender?: string;
  hasHostel?: boolean;
  degreeSlug?: string;
  maxSemesterFee?: number;
  matricMarks?: number;
  interMarks?: number;
  entryTestMarks?: number;
  page?: number;
  pageSize?: number;
}

const UNIVERSITY_SELECT = `
  id, slug, name, shortName, sector, province, city, hecRanking, hasHostel, hostelFeePerYear,
  genderPolicy, website, email, phone, coverImageUrl,
  hasSportsComplex, hasWifi, hasTransport, societiesCount, campusSizeAcres,
  UniversityDegree ( semesterFee, lastYearAggregate, Degree ( slug, title ) ),
  UniversityScholarship ( id ),
  Review ( teachingRating, campusRating, labsRating, internetRating, cafeteriaRating, sportsRating, securityRating )
`;

function shapeUniversitySummary(row: any, studentAggregate: number | null, degreeSlug?: string): UniversitySummary & { _degreeSlugs: string[] } {
  const offers: any[] = row.UniversityDegree ?? [];
  const relevantOffers = degreeSlug ? offers.filter((o) => o.Degree?.slug === degreeSlug) : offers;
  const fees = relevantOffers.map((o) => o.semesterFee).filter((f) => f != null);
  const aggregates = relevantOffers.map((o) => o.lastYearAggregate).filter((a) => a != null);
  const minFee = fees.length ? Math.min(...fees) : null;
  const avgAggregate = aggregates.length ? aggregates.reduce((a: number, b: number) => a + b, 0) / aggregates.length : null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    sector: row.sector,
    province: row.province,
    city: row.city,
    hecRanking: row.hecRanking,
    hasHostel: row.hasHostel,
    hostelFeePerYear: row.hostelFeePerYear,
    genderPolicy: row.genderPolicy,
    website: row.website,
    email: row.email,
    phone: row.phone,
    coverImageUrl: row.coverImageUrl,
    scholarshipsCount: (row.UniversityScholarship ?? []).length,
    averageRating: averageRating(row.Review ?? []),
    semesterFee: minFee,
    estimatedMerit: avgAggregate,
    admissionChance: studentAggregate !== null ? estimateAdmissionChance(studentAggregate, avgAggregate) : null,
    _degreeSlugs: offers.map((o) => o.Degree?.slug).filter(Boolean),
  };
}

export async function listUniversities(params: UniversityFilterParams = {}) {
  let query = supabase.from('University').select(UNIVERSITY_SELECT);

  if (params.search) query = query.ilike('name', `%${params.search}%`);
  if (params.province) query = query.eq('province', params.province);
  if (params.city) query = query.ilike('city', `%${params.city}%`);
  if (params.sector) query = query.eq('sector', params.sector);
  if (params.gender) query = query.eq('genderPolicy', params.gender);
  if (params.hasHostel) query = query.eq('hasHostel', true);

  const { data, error } = await query.order('hecRanking', { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);

  const studentAggregate = params.matricMarks != null && params.interMarks != null
    ? calculateAggregate({ matricMarks: params.matricMarks, interMarks: params.interMarks, entryTestMarks: params.entryTestMarks })
    : null;

  let results = (data ?? []).map((row) => shapeUniversitySummary(row, studentAggregate, params.degreeSlug));

  if (params.degreeSlug) results = results.filter((u) => u._degreeSlugs.includes(params.degreeSlug!));
  if (params.maxSemesterFee) results = results.filter((u) => u.semesterFee == null || u.semesterFee <= params.maxSemesterFee!);

  const total = results.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const paged = results.slice((page - 1) * pageSize, page * pageSize).map(({ _degreeSlugs, ...u }) => u);

  return { data: paged as UniversitySummary[], meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}
export async function listUniversityScholarshipLinks() {
  const { data, error } = await supabase
    .from('UniversityScholarship')
    .select('id, University ( name ), Scholarship ( name )')
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((l: any) => ({ id: l.id, universityName: l.University?.name, scholarshipName: l.Scholarship?.name }));
}
export async function listMediaAssets() {
  const { data, error } = await supabase.from('MediaAsset').select('*').order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function listUniversitiesAdmin() {
  const { data, error } = await supabase.from('University').select('*').order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFilterMeta() {
  const { data, error } = await supabase.from('University').select('province, city');
  if (error) throw new Error(error.message);
  const provinces = Array.from(new Set((data ?? []).map((r) => r.province))).sort();
  const cities = Array.from(new Set((data ?? []).map((r) => r.city))).sort();
  return { provinces, cities };
}
export async function listUniversityDegreeLinks() {
  const { data, error } = await supabase
    .from('UniversityDegree')
    .select('id, semesterFee, lastYearAggregate, University ( name ), Degree ( title )')
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((l: any) => ({ id: l.id, semesterFee: l.semesterFee, lastYearAggregate: l.lastYearAggregate, universityName: l.University?.name, degreeTitle: l.Degree?.title }));
}

export async function getUniversityBySlug(slug: string): Promise<UniversityDetail> {
  const { data, error } = await supabase
    .from('University')
    .select(`
      *,
      Campus ( id, name, type, city, province ),
      UniversityImage ( id, url, caption ),
      UniversityDegree ( id, semesterFee, totalFee, lastYearAggregate, seatsAvailable, entryTestRequired, entryTestName, Degree ( id, slug, title, level ) ),
      UniversityScholarship ( Scholarship ( id, slug, name, category ) ),
      Deadline ( id, type, title, date, notes ),
      Review ( id, teachingRating, campusRating, labsRating, internetRating, hostelRating, cafeteriaRating, sportsRating, securityRating, comment, createdAt, Profile ( name, avatarUrl ) )
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) throw new Error(error?.message ?? 'University not found.');

  return {
    ...data,
    scholarshipsCount: (data.UniversityScholarship ?? []).length,
    averageRating: averageRating(data.Review ?? []),
    campuses: data.Campus ?? [],
    images: data.UniversityImage ?? [],
    degreeOffers: (data.UniversityDegree ?? []).map((o: any) => ({ ...o, degree: o.Degree })),
    scholarships: (data.UniversityScholarship ?? []).map((s: any) => ({ scholarship: s.Scholarship })),
    deadlines: data.Deadline ?? [],
    reviews: (data.Review ?? []).map((r: any) => ({ ...r, user: r.Profile ?? { name: 'Anonymous' } })),
  } as unknown as UniversityDetail;
}

export async function listDeadlines(params: { type?: string; province?: string; upcoming?: boolean } = {}) {
  let query = supabase
    .from('Deadline')
    .select('id, type, title, date, notes, University ( id, slug, name, shortName, province, city )');

  if (params.type) query = query.eq('type', params.type);
  if (params.upcoming) query = query.gte('date', new Date().toISOString());

  const { data, error } = await query.order('date', { ascending: true });
  if (error) throw new Error(error.message);

  let results = (data ?? []).map((d: any) => ({ ...d, university: d.University }));
  if (params.province) results = results.filter((d) => d.university?.province === params.province);
  return results;
}

export async function compareUniversities(ids: string[]) {
  const { data, error } = await supabase.from('University').select(UNIVERSITY_SELECT).in('id', ids);
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => {
    const offers: any[] = row.UniversityDegree ?? [];
    const fees = offers.map((o) => o.semesterFee).filter((f) => f != null);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      sector: row.sector,
      province: row.province,
      city: row.city,
      hecRanking: row.hecRanking,
      hasHostel: row.hasHostel,
      hostelFeePerYear: row.hostelFeePerYear,
      hasSportsComplex: row.hasSportsComplex,
      hasWifi: row.hasWifi,
      hasTransport: row.hasTransport,
      societiesCount: row.societiesCount,
      campusSizeAcres: row.campusSizeAcres,
      averageRating: averageRating(row.Review ?? []),
      minSemesterFee: fees.length ? Math.min(...fees) : null,
      scholarshipsCount: (row.UniversityScholarship ?? []).length,
      degreesOffered: offers.map((o) => o.Degree?.title).filter(Boolean),
    };
  });
}

// ---------------------------------------------------------------------------
// Degrees
// ---------------------------------------------------------------------------
export async function listDegrees(params: { search?: string; level?: string } = {}): Promise<Degree[]> {
  let query = supabase.from('Degree').select('*, UniversityDegree ( id )');
  if (params.search) query = query.ilike('title', `%${params.search}%`);
  if (params.level) query = query.eq('level', params.level);

  const { data, error } = await query.order('title', { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((d: any) => ({ ...d, universitiesOfferingCount: (d.UniversityDegree ?? []).length }));
}

export async function getDegreeBySlug(slug: string): Promise<Degree> {
  const { data, error } = await supabase
    .from('Degree')
    .select('*, UniversityDegree ( id, semesterFee, lastYearAggregate, University ( id, slug, name, city, province, sector, hecRanking ) )')
    .eq('slug', slug)
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Degree not found.');

  let relatedDegrees: { slug: string; title: string; level: string }[] = [];
  if (data.relatedDegreeSlugs?.length) {
    const { data: related } = await supabase.from('Degree').select('slug, title, level').in('slug', data.relatedDegreeSlugs);
    relatedDegrees = related ?? [];
  }

  return {
    ...data,
    universityOffers: (data.UniversityDegree ?? []).map((o: any) => ({ ...o, university: o.University })),
    relatedDegrees,
  };
}

// ---------------------------------------------------------------------------
// Scholarships
// ---------------------------------------------------------------------------
export async function listScholarships(params: { category?: string; province?: string; isInternational?: boolean } = {}): Promise<Scholarship[]> {
  let query = supabase.from('Scholarship').select('*, UniversityScholarship ( id )');
  if (params.category) query = query.eq('category', params.category);
  if (params.province) query = query.eq('province', params.province);
  if (params.isInternational) query = query.eq('isInternational', true);

  const { data, error } = await query.order('deadline', { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((s: any) => ({ ...s, _count: { universities: (s.UniversityScholarship ?? []).length } }));
}

export async function getScholarshipBySlug(slug: string): Promise<Scholarship> {
  const { data, error } = await supabase
    .from('Scholarship')
    .select('*, UniversityScholarship ( University ( id, slug, name, city, province ) )')
    .eq('slug', slug)
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Scholarship not found.');

  return { ...data, universities: (data.UniversityScholarship ?? []).map((u: any) => ({ university: u.University })) };
}

// ---------------------------------------------------------------------------
// Merit Predictor
// ---------------------------------------------------------------------------
export async function predictMerit(input: { matricMarks: number; interMarks: number; entryTestMarks?: number; degreeSlug?: string }): Promise<MeritPredictionResult> {
  const aggregate = calculateAggregate(input);

  let query = supabase
    .from('UniversityDegree')
    .select('id, semesterFee, lastYearAggregate, Degree ( title, slug ), University ( id, slug, name, city, province )');
  if (input.degreeSlug) query = query.eq('Degree.slug', input.degreeSlug);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const matches: (MeritMatch & { chance: string })[] = (data ?? [])
    .filter((o: any) => input.degreeSlug ? o.Degree?.slug === input.degreeSlug : true)
    .map((o: any) => ({
      universityId: o.University?.id,
      universitySlug: o.University?.slug,
      universityName: o.University?.name,
      degreeTitle: o.Degree?.title,
      city: o.University?.city,
      province: o.University?.province,
      lastYearAggregate: o.lastYearAggregate,
      semesterFee: o.semesterFee,
      chance: estimateAdmissionChance(aggregate, o.lastYearAggregate),
    }));

  return {
    aggregate,
    safeUniversities: matches.filter((m) => m.chance === 'SAFE'),
    moderateUniversities: matches.filter((m) => m.chance === 'MODERATE'),
    dreamUniversities: matches.filter((m) => m.chance === 'DREAM'),
  };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function submitReview(payload: { universityId: string; comment?: string } & ReviewRatings) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to leave a review.');

  const { error } = await supabase.from('Review').upsert(
    { ...payload, userId: user.id },
    { onConflict: 'universityId,userId' }
  );
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Dashboard (saved items, applications, reminders, notifications)
// ---------------------------------------------------------------------------
export async function getDashboard(userId: string) {
  const [savedUniversities, savedDegrees, savedScholarships, applications, notifications, reminders] = await Promise.all([
    supabase.from('SavedUniversity').select('id, University (*)').eq('userId', userId).order('createdAt', { ascending: false }),
    supabase.from('SavedDegree').select('id, Degree (*)').eq('userId', userId).order('createdAt', { ascending: false }),
    supabase.from('SavedScholarship').select('id, Scholarship (*)').eq('userId', userId).order('createdAt', { ascending: false }),
    supabase.from('Application').select('id, programName, status, notes, University ( name, slug )').eq('userId', userId).order('updatedAt', { ascending: false }),
    supabase.from('Notification').select('*').eq('userId', userId).order('createdAt', { ascending: false }).limit(20),
    supabase.from('Reminder').select('deadlineId').eq('userId', userId),
  ]);

  for (const r of [savedUniversities, savedDegrees, savedScholarships, applications, notifications, reminders]) {
    if (r.error) throw new Error(r.error.message);
  }

  return {
    savedUniversities: (savedUniversities.data ?? []).map((s: any) => ({ id: s.id, university: s.University })),
    savedDegrees: (savedDegrees.data ?? []).map((s: any) => ({ id: s.id, degree: s.Degree })),
    savedScholarships: (savedScholarships.data ?? []).map((s: any) => ({ id: s.id, scholarship: s.Scholarship })),
    applications: (applications.data ?? []).map((a: any) => ({ ...a, university: a.University })),
    notifications: notifications.data ?? [],
    reminderDeadlineIds: (reminders.data ?? []).map((r: any) => r.deadlineId),
  };
}

export const saveUniversity = (userId: string, universityId: string) =>
  supabase.from('SavedUniversity').upsert({ userId, universityId }, { onConflict: 'userId,universityId' }).then(throwIfError);
export const unsaveUniversity = (userId: string, universityId: string) =>
  supabase.from('SavedUniversity').delete().eq('userId', userId).eq('universityId', universityId).then(throwIfError);

export const saveDegree = (userId: string, degreeId: string) =>
  supabase.from('SavedDegree').upsert({ userId, degreeId }, { onConflict: 'userId,degreeId' }).then(throwIfError);
export const unsaveDegree = (userId: string, degreeId: string) =>
  supabase.from('SavedDegree').delete().eq('userId', userId).eq('degreeId', degreeId).then(throwIfError);

export const saveScholarship = (userId: string, scholarshipId: string) =>
  supabase.from('SavedScholarship').upsert({ userId, scholarshipId }, { onConflict: 'userId,scholarshipId' }).then(throwIfError);
export const unsaveScholarship = (userId: string, scholarshipId: string) =>
  supabase.from('SavedScholarship').delete().eq('userId', userId).eq('scholarshipId', scholarshipId).then(throwIfError);

export const createApplication = (userId: string, payload: { universityId: string; programName: string; notes?: string }) =>
  supabase.from('Application').insert({ ...payload, userId }).then(throwIfError);
export const updateApplicationStatus = (id: string, status: string) =>
  supabase.from('Application').update({ status, updatedAt: new Date().toISOString() }).eq('id', id).then(throwIfError);

export const createReminder = (userId: string, deadlineId: string) =>
  supabase.from('Reminder').upsert({ userId, deadlineId }, { onConflict: 'userId,deadlineId' }).then(throwIfError);
export const deleteReminder = (userId: string, deadlineId: string) =>
  supabase.from('Reminder').delete().eq('userId', userId).eq('deadlineId', deadlineId).then(throwIfError);

export const updateProfile = (userId: string, payload: { name?: string; province?: string; city?: string }) =>
  supabase.from('Profile').update({ ...payload, updatedAt: new Date().toISOString() }).eq('id', userId).then(throwIfError);

function throwIfError<T extends { error: any }>(res: T) {
  if (res.error) throw new Error(res.error.message);
  return res;
}
