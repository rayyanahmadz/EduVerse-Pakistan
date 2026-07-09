-- ============================================================================
-- EduVerse Pakistan — Supabase Schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
--
-- Design notes:
--   * auth.users (managed by Supabase Auth) holds email + password.
--     public."Profile" holds app-specific fields (name, role, province, city)
--     and is auto-created by a trigger whenever someone signs up.
--   * Column names are camelCase (quoted) to match the TypeScript types used
--     throughout the frontend one-for-one — no field renaming needed there.
--   * Catalog tables (University, Degree, Scholarship, ...) are PUBLIC READ
--     (any visitor can browse without logging in) but have NO write policies
--     for normal users — only the service-role key can write to them, and
--     that key only ever lives inside Vercel Serverless Functions
--     (api/admin.ts, api/import.ts), never in the browser.
--   * User-owned tables (SavedUniversity, Review, Application, Reminder, ...)
--     are readable/writable ONLY by their owner, enforced by RLS using
--     auth.uid().
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ----------------------------------------------------------------------------

create table if not exists public."Profile" (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null,
  email        text not null,
  role         text not null default 'STUDENT' check (role in ('STUDENT', 'ADMIN')),
  province     text,
  city         text,
  "avatarUrl"  text,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);

-- Auto-create a Profile row whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."Profile" (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- UNIVERSITY (core catalog — unlimited rows, no hardcoding)
-- ----------------------------------------------------------------------------

create table if not exists public."University" (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  "shortName"         text,
  sector              text not null check (sector in ('PUBLIC', 'PRIVATE', 'SEMI_GOVERNMENT')),
  province            text not null,
  city                text not null,
  address             text,
  website             text,
  email               text,
  phone               text,
  "hecRecognized"     boolean not null default true,
  "hecRanking"        integer,
  "establishedYear"   integer,
  "genderPolicy"      text not null default 'CO_EDUCATION' check ("genderPolicy" in ('CO_EDUCATION', 'MALE_ONLY', 'FEMALE_ONLY')),
  "hasHostel"         boolean not null default false,
  "hostelFeePerYear"  integer,
  description         text,
  "logoUrl"           text,
  "coverImageUrl"     text,
  "hasLibrary"        boolean not null default true,
  "hasSportsComplex"  boolean not null default false,
  "hasWifi"           boolean not null default true,
  "hasTransport"      boolean not null default false,
  "hasMedical"        boolean not null default false,
  "societiesCount"    integer,
  "campusSizeAcres"   double precision,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

create index if not exists university_province_city_idx on public."University" (province, city);
create index if not exists university_sector_idx on public."University" (sector);
create index if not exists university_hec_ranking_idx on public."University" ("hecRanking");

create table if not exists public."Campus" (
  id             uuid primary key default gen_random_uuid(),
  "universityId" uuid not null references public."University" (id) on delete cascade,
  name           text not null,
  type           text not null default 'MAIN' check (type in ('MAIN', 'SUB_CAMPUS', 'AFFILIATED_COLLEGE')),
  city           text not null,
  province       text not null,
  address        text
);
create index if not exists campus_university_idx on public."Campus" ("universityId");

create table if not exists public."UniversityImage" (
  id             uuid primary key default gen_random_uuid(),
  "universityId" uuid not null references public."University" (id) on delete cascade,
  url            text not null,
  caption        text,
  "createdAt"    timestamptz not null default now()
);
create index if not exists university_image_university_idx on public."UniversityImage" ("universityId");

-- ----------------------------------------------------------------------------
-- DEGREES
-- ----------------------------------------------------------------------------

create table if not exists public."Degree" (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text unique not null,
  title                  text not null,
  level                  text not null check (level in ('ASSOCIATE', 'BACHELORS', 'MASTERS', 'MPHIL', 'PHD', 'DIPLOMA')),
  "durationYears"        double precision not null,
  overview               text,
  eligibility            text,
  "careerOpportunities"  text,
  "futureScope"          text,
  "expectedSalaryMin"    integer,
  "expectedSalaryMax"    integer,
  "skillsNeeded"         text[] not null default '{}',
  "relatedDegreeSlugs"   text[] not null default '{}',
  "createdAt"            timestamptz not null default now(),
  "updatedAt"            timestamptz not null default now()
);
create index if not exists degree_level_idx on public."Degree" (level);

create table if not exists public."UniversityDegree" (
  id                   uuid primary key default gen_random_uuid(),
  "universityId"       uuid not null references public."University" (id) on delete cascade,
  "degreeId"           uuid not null references public."Degree" (id) on delete cascade,
  "semesterFee"        integer,
  "totalFee"           integer,
  "lastYearAggregate"  double precision,
  "seatsAvailable"     integer,
  "entryTestRequired"  boolean not null default false,
  "entryTestName"      text,
  unique ("universityId", "degreeId")
);
create index if not exists university_degree_degree_idx on public."UniversityDegree" ("degreeId");
create index if not exists university_degree_university_idx on public."UniversityDegree" ("universityId");

-- ----------------------------------------------------------------------------
-- SCHOLARSHIPS
-- ----------------------------------------------------------------------------

create table if not exists public."Scholarship" (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  category             text not null check (category in ('MERIT', 'NEED_BASED', 'PROVINCIAL', 'INTERNATIONAL', 'GOVERNMENT', 'PRIVATE')),
  province             text,
  "isInternational"    boolean not null default false,
  benefits             text,
  eligibility          text,
  "requiredDocuments"  text[] not null default '{}',
  deadline             timestamptz,
  "officialLink"       text,
  description          text,
  "createdAt"          timestamptz not null default now(),
  "updatedAt"          timestamptz not null default now()
);
create index if not exists scholarship_category_idx on public."Scholarship" (category);
create index if not exists scholarship_province_idx on public."Scholarship" (province);

create table if not exists public."UniversityScholarship" (
  id               uuid primary key default gen_random_uuid(),
  "universityId"   uuid not null references public."University" (id) on delete cascade,
  "scholarshipId"  uuid not null references public."Scholarship" (id) on delete cascade,
  unique ("universityId", "scholarshipId")
);
create index if not exists university_scholarship_scholarship_idx on public."UniversityScholarship" ("scholarshipId");

-- ----------------------------------------------------------------------------
-- ADMISSION CALENDAR
-- ----------------------------------------------------------------------------

create table if not exists public."Deadline" (
  id             uuid primary key default gen_random_uuid(),
  "universityId" uuid not null references public."University" (id) on delete cascade,
  type           text not null check (type in ('ADMISSION_OPEN', 'ADMISSION_CLOSE', 'ENTRY_TEST', 'INTERVIEW', 'MERIT_LIST', 'SCHOLARSHIP_DEADLINE', 'CLASSES_START')),
  title          text not null,
  date           timestamptz not null,
  notes          text,
  "createdAt"    timestamptz not null default now()
);
create index if not exists deadline_university_idx on public."Deadline" ("universityId");
create index if not exists deadline_date_idx on public."Deadline" (date);

create table if not exists public."Reminder" (
  id           uuid primary key default gen_random_uuid(),
  "userId"     uuid not null references public."Profile" (id) on delete cascade,
  "deadlineId" uuid not null references public."Deadline" (id) on delete cascade,
  "createdAt"  timestamptz not null default now(),
  unique ("userId", "deadlineId")
);

-- ----------------------------------------------------------------------------
-- REVIEWS
-- ----------------------------------------------------------------------------

create table if not exists public."Review" (
  id                uuid primary key default gen_random_uuid(),
  "universityId"    uuid not null references public."University" (id) on delete cascade,
  "userId"          uuid not null references public."Profile" (id) on delete cascade,
  "teachingRating"  integer not null check ("teachingRating" between 1 and 5),
  "campusRating"    integer not null check ("campusRating" between 1 and 5),
  "labsRating"      integer not null check ("labsRating" between 1 and 5),
  "internetRating"  integer not null check ("internetRating" between 1 and 5),
  "hostelRating"    integer check ("hostelRating" between 1 and 5),
  "cafeteriaRating" integer not null check ("cafeteriaRating" between 1 and 5),
  "sportsRating"    integer not null check ("sportsRating" between 1 and 5),
  "securityRating"  integer not null check ("securityRating" between 1 and 5),
  comment           text,
  "createdAt"       timestamptz not null default now(),
  unique ("universityId", "userId")
);
create index if not exists review_university_idx on public."Review" ("universityId");

-- ----------------------------------------------------------------------------
-- SAVED ITEMS / DASHBOARD
-- ----------------------------------------------------------------------------

create table if not exists public."SavedUniversity" (
  id             uuid primary key default gen_random_uuid(),
  "userId"       uuid not null references public."Profile" (id) on delete cascade,
  "universityId" uuid not null references public."University" (id) on delete cascade,
  "createdAt"    timestamptz not null default now(),
  unique ("userId", "universityId")
);

create table if not exists public."SavedDegree" (
  id          uuid primary key default gen_random_uuid(),
  "userId"    uuid not null references public."Profile" (id) on delete cascade,
  "degreeId"  uuid not null references public."Degree" (id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("userId", "degreeId")
);

create table if not exists public."SavedScholarship" (
  id               uuid primary key default gen_random_uuid(),
  "userId"         uuid not null references public."Profile" (id) on delete cascade,
  "scholarshipId"  uuid not null references public."Scholarship" (id) on delete cascade,
  "createdAt"      timestamptz not null default now(),
  unique ("userId", "scholarshipId")
);

create table if not exists public."Application" (
  id             uuid primary key default gen_random_uuid(),
  "userId"       uuid not null references public."Profile" (id) on delete cascade,
  "universityId" uuid not null references public."University" (id) on delete cascade,
  "programName"  text not null,
  status         text not null default 'PLANNED' check (status in ('PLANNED', 'APPLIED', 'TEST_TAKEN', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'ENROLLED')),
  notes          text,
  "createdAt"    timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now()
);
create index if not exists application_user_idx on public."Application" ("userId");

create table if not exists public."Notification" (
  id          uuid primary key default gen_random_uuid(),
  "userId"    uuid not null references public."Profile" (id) on delete cascade,
  title       text not null,
  message     text not null,
  "isRead"    boolean not null default false,
  "createdAt" timestamptz not null default now()
);
create index if not exists notification_user_idx on public."Notification" ("userId");

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public."Profile"               enable row level security;
alter table public."University"            enable row level security;
alter table public."Campus"                enable row level security;
alter table public."UniversityImage"       enable row level security;
alter table public."Degree"                enable row level security;
alter table public."UniversityDegree"      enable row level security;
alter table public."Scholarship"           enable row level security;
alter table public."UniversityScholarship" enable row level security;
alter table public."Deadline"              enable row level security;
alter table public."Reminder"              enable row level security;
alter table public."Review"                enable row level security;
alter table public."SavedUniversity"       enable row level security;
alter table public."SavedDegree"           enable row level security;
alter table public."SavedScholarship"      enable row level security;
alter table public."Application"           enable row level security;
alter table public."Notification"          enable row level security;

-- Profiles: everyone can read basic profile info (needed to show reviewer names),
-- but you can only edit your own.
drop policy if exists "Profiles are viewable by everyone" on public."Profile";
create policy "Profiles are viewable by everyone" on public."Profile" for select using (true);

drop policy if exists "Users can update own profile" on public."Profile";
create policy "Users can update own profile" on public."Profile" for update using (auth.uid() = id) with check (auth.uid() = id);

-- Public catalog tables: readable by anyone (including logged-out visitors).
-- No insert/update/delete policy is defined on purpose — normal users (anon
-- or authenticated) cannot write to these tables at all. Only the
-- service-role key, used exclusively inside api/admin.ts and api/import.ts,
-- can bypass RLS to write here.
drop policy if exists "University is public" on public."University";
create policy "University is public" on public."University" for select using (true);

drop policy if exists "Campus is public" on public."Campus";
create policy "Campus is public" on public."Campus" for select using (true);

drop policy if exists "UniversityImage is public" on public."UniversityImage";
create policy "UniversityImage is public" on public."UniversityImage" for select using (true);

drop policy if exists "Degree is public" on public."Degree";
create policy "Degree is public" on public."Degree" for select using (true);

drop policy if exists "UniversityDegree is public" on public."UniversityDegree";
create policy "UniversityDegree is public" on public."UniversityDegree" for select using (true);

drop policy if exists "Scholarship is public" on public."Scholarship";
create policy "Scholarship is public" on public."Scholarship" for select using (true);

drop policy if exists "UniversityScholarship is public" on public."UniversityScholarship";
create policy "UniversityScholarship is public" on public."UniversityScholarship" for select using (true);

drop policy if exists "Deadline is public" on public."Deadline";
create policy "Deadline is public" on public."Deadline" for select using (true);

-- Reviews: anyone can read, only the author can write/edit their own.
drop policy if exists "Reviews are public" on public."Review";
create policy "Reviews are public" on public."Review" for select using (true);

drop policy if exists "Users can insert own review" on public."Review";
create policy "Users can insert own review" on public."Review" for insert with check (auth.uid() = "userId");

drop policy if exists "Users can update own review" on public."Review";
create policy "Users can update own review" on public."Review" for update using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Users can delete own review" on public."Review";
create policy "Users can delete own review" on public."Review" for delete using (auth.uid() = "userId");

-- Owner-only tables (dashboard data): a user can only see/change their own rows.
drop policy if exists "Own reminders only" on public."Reminder";
create policy "Own reminders only" on public."Reminder" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Own saved universities only" on public."SavedUniversity";
create policy "Own saved universities only" on public."SavedUniversity" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Own saved degrees only" on public."SavedDegree";
create policy "Own saved degrees only" on public."SavedDegree" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Own saved scholarships only" on public."SavedScholarship";
create policy "Own saved scholarships only" on public."SavedScholarship" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Own applications only" on public."Application";
create policy "Own applications only" on public."Application" for all using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Own notifications only" on public."Notification";
create policy "Own notifications only" on public."Notification" for select using (auth.uid() = "userId");

-- ============================================================================
-- STORAGE (university logos / cover images / gallery)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('university-images', 'university-images', true)
on conflict (id) do nothing;

drop policy if exists "University images are publicly readable" on storage.objects;
create policy "University images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'university-images');

-- Uploads to this bucket happen only through api/admin.ts using the
-- service-role key, so no INSERT/UPDATE/DELETE policy is needed for
-- anon/authenticated roles — the service role bypasses storage RLS too.

-- ============================================================================
-- Done. Next: run supabase/seed.sql to load demo data, then set your admin
-- account's role, e.g.:
--   update public."Profile" set role = 'ADMIN' where email = 'you@example.com';
-- ============================================================================
