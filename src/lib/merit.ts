// Merit / aggregate calculation — runs entirely client-side now that there is
// no long-running backend. Mirrors the widely-used Pakistani university
// aggregate formula for engineering/general programs
// (Matric 10% + Intermediate 40% + Entry Test 50%), falling back to
// Matric 30% + Intermediate 70% when a program has no entry test.

export interface MeritInput {
  matricMarks: number;
  interMarks: number;
  entryTestMarks?: number;
}

export function calculateAggregate(input: MeritInput): number {
  const { matricMarks, interMarks, entryTestMarks } = input;

  if (entryTestMarks !== undefined && entryTestMarks !== null && !Number.isNaN(entryTestMarks)) {
    const aggregate = matricMarks * 0.1 + interMarks * 0.4 + entryTestMarks * 0.5;
    return Math.round(aggregate * 100) / 100;
  }

  const aggregate = matricMarks * 0.3 + interMarks * 0.7;
  return Math.round(aggregate * 100) / 100;
}

export type AdmissionChance = 'DREAM' | 'MODERATE' | 'SAFE' | 'UNLIKELY';

export function estimateAdmissionChance(studentAggregate: number, lastYearClosingMerit: number | null | undefined): AdmissionChance {
  if (lastYearClosingMerit === null || lastYearClosingMerit === undefined) return 'MODERATE';

  const diff = studentAggregate - lastYearClosingMerit;

  if (diff >= 5) return 'SAFE';
  if (diff >= -2) return 'MODERATE';
  if (diff >= -8) return 'DREAM';
  return 'UNLIKELY';
}
