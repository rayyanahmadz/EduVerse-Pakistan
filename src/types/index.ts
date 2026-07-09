export type Role = 'STUDENT' | 'ADMIN';
export type Sector = 'PUBLIC' | 'PRIVATE' | 'SEMI_GOVERNMENT';
export type GenderPolicy = 'CO_EDUCATION' | 'MALE_ONLY' | 'FEMALE_ONLY';
export type AdmissionChance = 'DREAM' | 'MODERATE' | 'SAFE' | 'UNLIKELY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  province?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface UniversitySummary {
  id: string;
  slug: string;
  name: string;
  shortName?: string | null;
  sector: Sector;
  province: string;
  city: string;
  hecRanking?: number | null;
  hasHostel: boolean;
  hostelFeePerYear?: number | null;
  genderPolicy: GenderPolicy;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  coverImageUrl?: string | null;
  scholarshipsCount: number;
  averageRating: number | null;
  semesterFee?: number | null;
  estimatedMerit?: number | null;
  admissionChance?: AdmissionChance | null;
}

export interface UniversityDetail extends Omit<UniversitySummary, 'semesterFee' | 'estimatedMerit' | 'admissionChance'> {
  address?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  hasLibrary: boolean;
  hasSportsComplex: boolean;
  hasWifi: boolean;
  hasTransport: boolean;
  hasMedical: boolean;
  societiesCount?: number | null;
  campusSizeAcres?: number | null;
  establishedYear?: number | null;
  campuses: { id: string; name: string; type: string; city: string; province: string }[];
  images: { id: string; url: string; caption?: string | null }[];
  degreeOffers: {
    id: string;
    semesterFee?: number | null;
    totalFee?: number | null;
    lastYearAggregate?: number | null;
    seatsAvailable?: number | null;
    entryTestRequired: boolean;
    entryTestName?: string | null;
    degree: { id: string; slug: string; title: string; level: string };
  }[];
  scholarships: { scholarship: { id: string; slug: string; name: string; category: string } }[];
  deadlines: { id: string; type: string; title: string; date: string; notes?: string | null }[];
  reviews: {
    id: string;
    teachingRating: number;
    campusRating: number;
    labsRating: number;
    internetRating: number;
    hostelRating?: number | null;
    cafeteriaRating: number;
    sportsRating: number;
    securityRating: number;
    comment?: string | null;
    createdAt: string;
    user: { name: string; avatarUrl?: string | null };
  }[];
}

export interface Degree {
  id: string;
  slug: string;
  title: string;
  level: string;
  durationYears: number;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  universitiesOfferingCount?: number;
  overview?: string | null;
  eligibility?: string | null;
  careerOpportunities?: string | null;
  futureScope?: string | null;
  skillsNeeded?: string[];
  relatedDegrees?: { slug: string; title: string; level: string }[];
  universityOffers?: {
    id: string;
    semesterFee?: number | null;
    lastYearAggregate?: number | null;
    university: { id: string; slug: string; name: string; city: string; province: string; sector: string; hecRanking?: number | null };
  }[];
}

export interface Scholarship {
  id: string;
  slug: string;
  name: string;
  category: string;
  province?: string | null;
  isInternational: boolean;
  benefits?: string | null;
  eligibility?: string | null;
  requiredDocuments: string[];
  deadline?: string | null;
  officialLink?: string | null;
  description?: string | null;
  _count?: { universities: number };
  universities?: { university: { id: string; slug: string; name: string; city: string; province: string } }[];
}

export interface MeritPredictionResult {
  aggregate: number;
  safeUniversities: MeritMatch[];
  moderateUniversities: MeritMatch[];
  dreamUniversities: MeritMatch[];
}

export interface MeritMatch {
  universityId: string;
  universitySlug: string;
  universityName: string;
  degreeTitle: string;
  city: string;
  province: string;
  lastYearAggregate?: number | null;
  semesterFee?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
  message?: string;
}
