import { z } from 'zod'

// TODO: Tighten once real API responses are observed — fields marked optional are guesses
export const EducationSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .object({
        fi: z.string().optional(),
        en: z.string().optional(),
        sv: z.string().optional(),
      })
      .passthrough()
      .optional(),
    targetCredits: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .passthrough()
      .optional(),
    phase1: z
      .object({
        targetCredits: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    phase2: z
      .object({
        targetCredits: z
          .object({ min: z.number().optional(), max: z.number().optional() })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    code: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough()

export const EducationsResponseSchema = z.array(EducationSchema)

export type Education = z.infer<typeof EducationSchema>
export type EducationsResponse = z.infer<typeof EducationsResponseSchema>

export const EDUCATIONS_ENDPOINT = '/kori/api/educations'
