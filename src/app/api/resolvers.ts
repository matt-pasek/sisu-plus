import { z } from 'zod'
import { sisuRequest } from './client'
import type { Enrolment } from './endpoints/enrolments'

// TODO: expand these schemas as the API is better understood
const courseUnitSchema = z
  .object({
    id: z.string(),
    name: z
      .object({
        en: z.string().optional(),
        fi: z.string().optional(),
        sv: z.string().optional(),
      })
      .optional(),
    credits: z
      .object({ min: z.number(), max: z.number() })
      .optional(),
  })
  .passthrough()

// TODO: expand these schemas as the API is better understood
const assessmentItemSchema = z
  .object({
    id: z.string(),
    courseUnitId: z.string(),
  })
  .passthrough()

// TODO: expand these schemas as the API is better understood
const realisationSchema = z
  .object({
    id: z.string(),
    nameSpecifier: z
      .object({
        en: z.string().optional(),
        fi: z.string().optional(),
        sv: z.string().optional(),
      })
      .optional()
      .nullable(),
    activityPeriod: z
      .object({ startDate: z.string(), endDate: z.string() })
      .optional()
      .nullable(),
  })
  .passthrough()

type CourseUnitResult = { name: string; credits: number | null }
type RealisationResult = { startDate: string | null; endDate: string | null; subtitle: string | null }

const courseUnitCache = new Map<string, CourseUnitResult>()
const assessmentItemCache = new Map<string, string>()
const realisationCache = new Map<string, RealisationResult>()

export interface ResolvedEnrolment {
  id?: string
  courseCode: string
  courseName: string
  subtitle: string | null
  credits: number | null
  startDate: string | null
  endDate: string | null
  status?: string | null
}

function extractCourseCode(id: string): string {
  const match = id.match(/lut-([A-Z][A-Z0-9]*\d[A-Z0-9]*)/)
  return match?.[1] ?? id
}

function pickLabel(obj?: { en?: string; fi?: string; sv?: string } | null): string | null {
  if (!obj) return null
  return obj.en ?? obj.fi ?? obj.sv ?? null
}

export async function resolveCourseUnit(courseUnitId: string): Promise<CourseUnitResult> {
  const cached = courseUnitCache.get(courseUnitId)
  if (cached) return cached

  try {
    const raw = await sisuRequest<unknown>(`/kori/api/course-units/${courseUnitId}`)
    const parsed = courseUnitSchema.parse(raw)
    const result: CourseUnitResult = {
      name: pickLabel(parsed.name as { en?: string; fi?: string; sv?: string }) ?? extractCourseCode(courseUnitId),
      credits: parsed.credits?.min ?? null,
    }
    courseUnitCache.set(courseUnitId, result)
    return result
  } catch {
    const fallback: CourseUnitResult = { name: extractCourseCode(courseUnitId), credits: null }
    courseUnitCache.set(courseUnitId, fallback)
    return fallback
  }
}

export async function resolveAssessmentItem(assessmentItemId: string): Promise<string> {
  const cached = assessmentItemCache.get(assessmentItemId)
  if (cached) return cached

  try {
    const raw = await sisuRequest<unknown>(`/kori/api/assessment-items/${assessmentItemId}`)
    const parsed = assessmentItemSchema.parse(raw)
    assessmentItemCache.set(assessmentItemId, parsed.courseUnitId)
    return parsed.courseUnitId
  } catch {
    assessmentItemCache.set(assessmentItemId, assessmentItemId)
    return assessmentItemId
  }
}

async function resolveRealisation(courseUnitRealisationId: string): Promise<RealisationResult> {
  const cached = realisationCache.get(courseUnitRealisationId)
  if (cached) return cached

  try {
    const raw = await sisuRequest<unknown>(`/kori/api/course-unit-realisations/${courseUnitRealisationId}`)
    const parsed = realisationSchema.parse(raw)
    const result: RealisationResult = {
      startDate: parsed.activityPeriod?.startDate ?? null,
      endDate: parsed.activityPeriod?.endDate ?? null,
      subtitle: pickLabel(parsed.nameSpecifier as { en?: string; fi?: string; sv?: string } | null),
    }
    realisationCache.set(courseUnitRealisationId, result)
    return result
  } catch {
    const fallback: RealisationResult = { startDate: null, endDate: null, subtitle: null }
    realisationCache.set(courseUnitRealisationId, fallback)
    return fallback
  }
}

export async function resolveEnrolment(enrolment: Enrolment): Promise<ResolvedEnrolment> {
  const [courseUnit, realisation] = await Promise.all([
    resolveCourseUnit(enrolment.courseUnitId),
    resolveRealisation(enrolment.courseUnitRealisationId),
  ])

  return {
    id: enrolment.id,
    courseCode: extractCourseCode(enrolment.assessmentItemId),
    courseName: courseUnit.name,
    subtitle: realisation.subtitle,
    credits: courseUnit.credits,
    startDate: realisation.startDate,
    endDate: realisation.endDate,
    status: enrolment.state,
  }
}

export async function resolveAllEnrolments(enrolments: Enrolment[]): Promise<ResolvedEnrolment[]> {
  const uniqueCourseUnitIds = [...new Set(enrolments.map((e) => e.courseUnitId))]
  const uniqueRealisationIds = [...new Set(enrolments.map((e) => e.courseUnitRealisationId))]

  await Promise.all([
    ...uniqueCourseUnitIds.map(resolveCourseUnit),
    ...uniqueRealisationIds.map(resolveRealisation),
  ])

  return Promise.all(enrolments.map(resolveEnrolment))
}
