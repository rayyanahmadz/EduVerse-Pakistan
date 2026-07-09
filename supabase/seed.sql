-- ============================================================================
-- EduVerse Pakistan — Demo/Seed Data
-- Run AFTER schema.sql, once, in the Supabase SQL Editor.
--
-- NOTE ON DATA ACCURACY: these are 20 real, well-known HEC-recognized
-- universities. Fee, merit and ranking figures are reasonable planning
-- estimates for demo purposes — verify against official sources before
-- any real decision-making. Add the rest of Pakistan's HEC-recognized
-- universities anytime via the Admin Panel's CSV/JSON importer.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- UNIVERSITIES
-- ----------------------------------------------------------------------------
insert into public."University"
  (slug, name, "shortName", sector, province, city, "hecRanking", "establishedYear", "genderPolicy", "hasHostel", "hostelFeePerYear", website, description, "hasSportsComplex", "societiesCount", "campusSizeAcres")
values
  ('national-university-of-sciences-and-technology', 'National University of Sciences and Technology', 'NUST', 'PUBLIC', 'Islamabad Capital Territory', 'Islamabad', 1, 1991, 'CO_EDUCATION', true, 150000, 'https://nust.edu.pk', 'One of Pakistan''s top-ranked universities, known for engineering, computer science, and business programs.', true, 40, 700),
  ('lahore-university-of-management-sciences', 'Lahore University of Management Sciences', 'LUMS', 'PRIVATE', 'Punjab', 'Lahore', 2, 1985, 'CO_EDUCATION', true, 300000, 'https://lums.edu.pk', 'Premier private university renowned for its business school and liberal arts programs.', true, 35, 100),
  ('ghulam-ishaq-khan-institute-of-engineering-sciences-and-technology', 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology', 'GIKI', 'PRIVATE', 'Khyber Pakhtunkhwa', 'Topi', 3, 1993, 'CO_EDUCATION', true, 200000, 'https://giki.edu.pk', 'Top engineering-focused university with a fully residential campus.', true, 25, 500),
  ('fast-national-university-of-computer-and-emerging-sciences', 'FAST National University of Computer and Emerging Sciences', 'FAST-NUCES', 'PRIVATE', 'Sindh', 'Karachi', 4, 2000, 'CO_EDUCATION', false, null, 'https://nu.edu.pk', 'Leading computer science and engineering university with multiple campuses across Pakistan.', true, 20, 20),
  ('university-of-engineering-and-technology-lahore', 'University of Engineering and Technology Lahore', 'UET Lahore', 'PUBLIC', 'Punjab', 'Lahore', 5, 1921, 'CO_EDUCATION', true, 60000, 'https://uet.edu.pk', 'One of the oldest and most respected engineering universities in Pakistan.', true, 22, 150),
  ('quaid-i-azam-university', 'Quaid-i-Azam University', 'QAU', 'PUBLIC', 'Islamabad Capital Territory', 'Islamabad', 6, 1967, 'CO_EDUCATION', true, 45000, 'https://qau.edu.pk', 'Leading public research university known for natural sciences and social sciences.', true, 18, 1700),
  ('university-of-the-punjab', 'University of the Punjab', 'PU', 'PUBLIC', 'Punjab', 'Lahore', 7, 1882, 'CO_EDUCATION', true, 40000, 'https://pu.edu.pk', 'Pakistan''s oldest and one of its largest public universities, offering a vast range of disciplines.', true, 30, 1500),
  ('comsats-university-islamabad', 'COMSATS University Islamabad', 'COMSATS', 'PUBLIC', 'Islamabad Capital Territory', 'Islamabad', 8, 1998, 'CO_EDUCATION', true, 80000, 'https://comsats.edu.pk', 'Multi-campus public university strong in engineering, computing and management sciences.', true, 20, 240),
  ('aga-khan-university', 'Aga Khan University', 'AKU', 'PRIVATE', 'Sindh', 'Karachi', 9, 1983, 'CO_EDUCATION', true, 250000, 'https://aku.edu', 'Internationally recognized private university specializing in medicine, nursing, and education.', false, 15, 85),
  ('institute-of-business-administration-karachi', 'Institute of Business Administration Karachi', 'IBA Karachi', 'PUBLIC', 'Sindh', 'Karachi', 10, 1955, 'CO_EDUCATION', true, 120000, 'https://iba.edu.pk', 'Pakistan''s oldest business school, offering top-ranked BBA, MBA and computer science programs.', true, 28, 37),
  ('university-of-karachi', 'University of Karachi', 'KU', 'PUBLIC', 'Sindh', 'Karachi', 11, 1951, 'CO_EDUCATION', true, 35000, 'https://uok.edu.pk', 'One of the largest public universities in Pakistan by enrollment, offering diverse disciplines.', true, 25, 1279),
  ('bahauddin-zakariya-university', 'Bahauddin Zakariya University', 'BZU', 'PUBLIC', 'Punjab', 'Multan', 12, 1975, 'CO_EDUCATION', true, 35000, 'https://bzu.edu.pk', 'Major public university serving South Punjab with a wide range of programs.', true, 15, 900),
  ('university-of-agriculture-faisalabad', 'University of Agriculture Faisalabad', 'UAF', 'PUBLIC', 'Punjab', 'Faisalabad', 13, 1906, 'CO_EDUCATION', true, 40000, 'https://uaf.edu.pk', 'Leading agricultural sciences university, one of the oldest in South Asia.', true, 18, 1500),
  ('university-of-peshawar', 'University of Peshawar', 'UOP', 'PUBLIC', 'Khyber Pakhtunkhwa', 'Peshawar', 14, 1950, 'CO_EDUCATION', true, 30000, 'https://uop.edu.pk', 'Oldest public university in Khyber Pakhtunkhwa, offering a broad academic portfolio.', true, 15, 1200),
  ('university-of-balochistan', 'University of Balochistan', 'UoB', 'PUBLIC', 'Balochistan', 'Quetta', 15, 1970, 'CO_EDUCATION', true, 25000, 'https://uob.edu.pk', 'The leading public university of Balochistan province.', false, 10, 328),
  ('sindh-agriculture-university', 'Sindh Agriculture University', 'SAU', 'PUBLIC', 'Sindh', 'Tandojam', 16, 1977, 'CO_EDUCATION', true, 30000, 'https://sau.edu.pk', 'Public agricultural sciences university serving rural Sindh.', false, 8, 500),
  ('national-university-of-modern-languages', 'National University of Modern Languages', 'NUML', 'PUBLIC', 'Islamabad Capital Territory', 'Islamabad', 17, 1970, 'CO_EDUCATION', true, 60000, 'https://numl.edu.pk', 'Public university specializing in languages, along with management and computer sciences.', true, 12, 20),
  ('institute-of-space-technology', 'Institute of Space Technology', 'IST', 'PUBLIC', 'Islamabad Capital Territory', 'Islamabad', 18, 2002, 'CO_EDUCATION', true, 70000, 'https://ist.edu.pk', 'Specialized public university for aerospace, space science and engineering.', true, 10, 50),
  ('mehran-university-of-engineering-and-technology', 'Mehran University of Engineering and Technology', 'MUET', 'PUBLIC', 'Sindh', 'Jamshoro', 19, 1963, 'CO_EDUCATION', true, 45000, 'https://muet.edu.pk', 'Leading public engineering university in Sindh.', true, 14, 700),
  ('university-of-health-sciences-lahore', 'University of Health Sciences Lahore', 'UHS', 'PUBLIC', 'Punjab', 'Lahore', 20, 2002, 'CO_EDUCATION', false, null, 'https://uhs.edu.pk', 'Regulatory and academic public university overseeing medical and health sciences education in Punjab.', false, 6, 15)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- DEGREES
-- ----------------------------------------------------------------------------
insert into public."Degree"
  (slug, title, level, "durationYears", overview, eligibility, "careerOpportunities", "futureScope", "expectedSalaryMin", "expectedSalaryMax", "skillsNeeded")
values
  ('bs-computer-science', 'BS Computer Science', 'BACHELORS', 4,
    'A comprehensive program covering programming, algorithms, systems, and software engineering.',
    'Intermediate (Pre-Engineering/ICS) or equivalent with at least 60% marks.',
    'Software Engineer, Data Scientist, AI/ML Engineer, Product Manager, Backend/Frontend Developer.',
    'One of the fastest-growing fields globally, with strong demand in Pakistan''s IT export sector.',
    80000, 400000, array['Programming','Data Structures','Problem Solving','Mathematics']),
  ('be-electrical-engineering', 'BE Electrical Engineering', 'BACHELORS', 4,
    'Covers power systems, electronics, control systems, and telecommunications.',
    'Intermediate (Pre-Engineering) with a valid entry test (ECAT/NET/etc).',
    'Power Engineer, Electronics Engineer, Telecom Engineer, Control Systems Engineer.',
    'Strong demand in energy, telecom, and renewable energy sectors.',
    60000, 300000, array['Circuit Analysis','Mathematics','Physics','Problem Solving']),
  ('bba-bachelor-of-business-administration', 'BBA (Bachelor of Business Administration)', 'BACHELORS', 4,
    'Foundational business education covering finance, marketing, HR, and management.',
    'Intermediate (any discipline) with at least 50% marks.',
    'Marketing Manager, Financial Analyst, HR Manager, Entrepreneur, Consultant.',
    'Versatile degree applicable across every industry.',
    50000, 250000, array['Communication','Analytical Thinking','Leadership']),
  ('mbbs-bachelor-of-medicine-bachelor-of-surgery', 'MBBS (Bachelor of Medicine, Bachelor of Surgery)', 'BACHELORS', 5,
    'Professional medical degree qualifying graduates to practice as doctors.',
    'Intermediate (Pre-Medical) with MDCAT score meeting merit criteria.',
    'General Physician, Surgeon, Specialist Consultant, Researcher.',
    'Consistently high demand; further specialization via FCPS/residency available.',
    60000, 500000, array['Biology','Chemistry','Attention to Detail','Empathy']),
  ('bs-software-engineering', 'BS Software Engineering', 'BACHELORS', 4,
    'Focused on software development lifecycle, architecture, and engineering best practices.',
    'Intermediate (Pre-Engineering/ICS) or equivalent.',
    'Software Engineer, DevOps Engineer, QA Engineer, Systems Architect.',
    'High demand in local and international software houses and startups.',
    75000, 380000, array['Programming','System Design','Testing','Teamwork']),
  ('bs-accounting-and-finance', 'BS Accounting and Finance', 'BACHELORS', 4,
    'Covers financial accounting, corporate finance, auditing, and taxation.',
    'Intermediate (any discipline) with at least 50% marks.',
    'Chartered Accountant (with ACCA/CA), Financial Analyst, Auditor, Investment Banker.',
    'Strong demand in banking, auditing firms, and corporate finance departments.',
    55000, 280000, array['Numeracy','Attention to Detail','Analytical Thinking']),
  ('bs-mechanical-engineering', 'BS Mechanical Engineering', 'BACHELORS', 4,
    'Covers thermodynamics, mechanics, manufacturing, and design of mechanical systems.',
    'Intermediate (Pre-Engineering) with a valid entry test.',
    'Design Engineer, Manufacturing Engineer, Automotive Engineer, HVAC Engineer.',
    'Steady demand across manufacturing, automotive, and energy sectors.',
    55000, 280000, array['Physics','Mathematics','CAD Design','Problem Solving'])
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- UNIVERSITY <-> DEGREE OFFERS (realistic sample combinations)
-- ----------------------------------------------------------------------------
insert into public."UniversityDegree" ("universityId", "degreeId", "semesterFee", "totalFee", "lastYearAggregate", "seatsAvailable", "entryTestRequired", "entryTestName")
select u.id, d.id, v.fee, v.fee * 8, v.agg, v.seats, v.test, v.testname
from (values
  ('national-university-of-sciences-and-technology', 'bs-computer-science', 180000, 88.0, 120, true, 'NET'),
  ('national-university-of-sciences-and-technology', 'be-electrical-engineering', 175000, 85.0, 100, true, 'NET'),
  ('lahore-university-of-management-sciences', 'bs-computer-science', 550000, 90.0, 90, true, 'LCAT/SAT'),
  ('lahore-university-of-management-sciences', 'bba-bachelor-of-business-administration', 600000, 89.0, 110, true, 'LCAT/SAT'),
  ('ghulam-ishaq-khan-institute-of-engineering-sciences-and-technology', 'be-electrical-engineering', 320000, 86.0, 80, true, 'GIKI Test'),
  ('ghulam-ishaq-khan-institute-of-engineering-sciences-and-technology', 'bs-mechanical-engineering', 320000, 83.0, 70, true, 'GIKI Test'),
  ('fast-national-university-of-computer-and-emerging-sciences', 'bs-computer-science', 165000, 80.0, 200, true, 'NU Test'),
  ('fast-national-university-of-computer-and-emerging-sciences', 'bs-software-engineering', 165000, 78.0, 150, true, 'NU Test'),
  ('university-of-engineering-and-technology-lahore', 'be-electrical-engineering', 45000, 84.0, 150, true, 'ECAT'),
  ('university-of-engineering-and-technology-lahore', 'bs-mechanical-engineering', 45000, 82.0, 130, true, 'ECAT'),
  ('quaid-i-azam-university', 'bs-computer-science', 30000, 75.0, 100, false, null),
  ('university-of-the-punjab', 'bba-bachelor-of-business-administration', 35000, 70.0, 200, false, null),
  ('university-of-the-punjab', 'bs-accounting-and-finance', 35000, 72.0, 150, false, null),
  ('comsats-university-islamabad', 'bs-computer-science', 70000, 76.0, 250, true, 'NTS-NAT'),
  ('comsats-university-islamabad', 'bs-software-engineering', 70000, 74.0, 200, true, 'NTS-NAT'),
  ('aga-khan-university', 'mbbs-bachelor-of-medicine-bachelor-of-surgery', 900000, 92.0, 100, true, 'MDCAT'),
  ('institute-of-business-administration-karachi', 'bba-bachelor-of-business-administration', 250000, 87.0, 180, true, 'IBA Aptitude Test'),
  ('institute-of-business-administration-karachi', 'bs-accounting-and-finance', 250000, 85.0, 100, true, 'IBA Aptitude Test'),
  ('university-of-karachi', 'bs-computer-science', 25000, 68.0, 300, false, null),
  ('bahauddin-zakariya-university', 'bs-accounting-and-finance', 28000, 65.0, 200, false, null),
  ('university-of-agriculture-faisalabad', 'bs-computer-science', 30000, 66.0, 120, false, null),
  ('university-of-peshawar', 'bs-computer-science', 25000, 64.0, 150, false, null),
  ('mehran-university-of-engineering-and-technology', 'be-electrical-engineering', 35000, 78.0, 100, true, 'MUET Test'),
  ('university-of-health-sciences-lahore', 'mbbs-bachelor-of-medicine-bachelor-of-surgery', 120000, 89.0, 2500, true, 'MDCAT')
) as v(uslug, dslug, fee, agg, seats, test, testname)
join public."University" u on u.slug = v.uslug
join public."Degree" d on d.slug = v.dslug
on conflict ("universityId", "degreeId") do nothing;

-- ----------------------------------------------------------------------------
-- SCHOLARSHIPS
-- ----------------------------------------------------------------------------
insert into public."Scholarship" (slug, name, category, province, "isInternational", benefits, eligibility, "requiredDocuments", deadline, "officialLink", description)
values
  ('hec-need-based-scholarship-program', 'HEC Need-Based Scholarship Program', 'NEED_BASED', null, false,
    'Covers full tuition fee for eligible undergraduate students.',
    'Pakistani nationals with family income below HEC-defined threshold and minimum 60% marks.',
    array['Income Certificate','Domicile','Academic Transcripts','CNIC/B-Form'],
    now() + interval '60 days', 'https://hec.gov.pk',
    'A nationwide need-based financial assistance program funded by the Higher Education Commission.'),
  ('punjab-educational-endowment-fund-peef', 'Punjab Educational Endowment Fund (PEEF)', 'PROVINCIAL', 'Punjab', false,
    'Full or partial tuition support plus stipend for living expenses.',
    'Domicile of Punjab, enrolled in HEC-recognized public/private university, meets income criteria.',
    array['Domicile','Income Certificate','Result Cards'],
    now() + interval '60 days', 'https://peef.org.pk',
    'Provincial scholarship program supporting talented but financially constrained students of Punjab.'),
  ('fulbright-scholarship-pakistan', 'Fulbright Scholarship Pakistan', 'INTERNATIONAL', null, true,
    'Fully funded Master''s/PhD study in the United States, including tuition, living stipend, and travel.',
    'Bachelor''s degree with strong academic record, leadership potential, and English proficiency.',
    array['Transcripts','Statement of Purpose','Recommendation Letters','GRE/TOEFL scores'],
    now() + interval '60 days', 'https://usefpakistan.org',
    'A prestigious US government-funded scholarship for graduate study in the United States.'),
  ('ehsaas-undergraduate-scholarship', 'Ehsaas Undergraduate Scholarship', 'GOVERNMENT', null, false,
    'Tuition fee coverage and monthly stipend for undergraduate students.',
    'Enrolled or admitted in a public sector university, from a low-income household.',
    array['NSER/Income Proof','Admission Letter','CNIC/B-Form'],
    now() + interval '60 days', 'https://ehsaas.gov.pk',
    'Government of Pakistan''s flagship social protection scholarship for undergraduate education.'),
  ('lums-national-outreach-programme', 'LUMS National Outreach Programme', 'MERIT', null, false,
    'Up to 100% financial aid covering tuition, hostel, and books for admitted students.',
    'Admission to LUMS with demonstrated financial need, primarily from underserved districts.',
    array['Income Certificate','Domicile','Academic Records'],
    now() + interval '60 days', 'https://lums.edu.pk/nop',
    'LUMS''s dedicated financial aid initiative to bring talented students from across Pakistan to campus.')
on conflict (slug) do nothing;

-- Link scholarships to universities
insert into public."UniversityScholarship" ("universityId", "scholarshipId")
select u.id, s.id
from (values
  ('national-university-of-sciences-and-technology', 'hec-need-based-scholarship-program'),
  ('university-of-the-punjab', 'punjab-educational-endowment-fund-peef'),
  ('lahore-university-of-management-sciences', 'lums-national-outreach-programme'),
  ('comsats-university-islamabad', 'hec-need-based-scholarship-program'),
  ('university-of-engineering-and-technology-lahore', 'punjab-educational-endowment-fund-peef'),
  ('university-of-karachi', 'ehsaas-undergraduate-scholarship')
) as v(uslug, sslug)
join public."University" u on u.slug = v.uslug
join public."Scholarship" s on s.slug = v.sslug
on conflict ("universityId", "scholarshipId") do nothing;

-- ----------------------------------------------------------------------------
-- ADMISSION CALENDAR
-- ----------------------------------------------------------------------------
insert into public."Deadline" ("universityId", type, title, date)
select u.id, v.dtype, v.title, now() + (v.offset_days || ' days')::interval
from (values
  ('national-university-of-sciences-and-technology', 'ADMISSION_OPEN', 'Undergraduate Admissions Open', 10),
  ('national-university-of-sciences-and-technology', 'ENTRY_TEST', 'NET Entry Test', 40),
  ('national-university-of-sciences-and-technology', 'MERIT_LIST', '1st Merit List Announcement', 65),
  ('fast-national-university-of-computer-and-emerging-sciences', 'ADMISSION_OPEN', 'Fall Admissions Open', 5),
  ('fast-national-university-of-computer-and-emerging-sciences', 'ADMISSION_CLOSE', 'Application Deadline', 35),
  ('lahore-university-of-management-sciences', 'ADMISSION_CLOSE', 'Application Deadline (Round 1)', 20),
  ('lahore-university-of-management-sciences', 'INTERVIEW', 'Admission Interviews', 45),
  ('university-of-engineering-and-technology-lahore', 'ENTRY_TEST', 'ECAT Test', 30),
  ('comsats-university-islamabad', 'ADMISSION_OPEN', 'Undergraduate Admissions Open', 8),
  ('university-of-health-sciences-lahore', 'ENTRY_TEST', 'MDCAT', 50)
) as v(uslug, dtype, title, offset_days)
join public."University" u on u.slug = v.uslug;

-- ============================================================================
-- Demo accounts: Supabase Auth manages auth.users directly, so create demo
-- users the normal way instead of via SQL insert:
--   1. Go to your running app's /register page (or Supabase Dashboard →
--      Authentication → Users → Add User) and create an account.
--   2. Promote it to admin by running:
--        update public."Profile" set role = 'ADMIN' where email = 'you@example.com';
-- ============================================================================
