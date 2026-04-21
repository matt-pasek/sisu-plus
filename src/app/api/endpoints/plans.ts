import { z } from 'zod'

const MetadataSchema = z.object({
  revision: z.number(),
  createdBy: z.string(),
  createdOn: z.string(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.string(),
  modificationOrdinal: z.number(),
})

const ModuleSelectionSchema = z.object({
  moduleId: z.string(),
  parentModuleId: z.string().nullable(),
})

const CourseUnitSelectionSchema = z.object({
  courseUnitId: z.string(),
  parentModuleId: z.string().nullable(),
  completionMethodId: z.string().nullable(),
  substitutedBy: z.array(z.string()),
  substituteFor: z.array(z.string()),
  plannedPeriods: z.array(z.string()),
  gradeRaiseAttempt: z.unknown().nullable(),
})

const AssessmentItemSelectionSchema = z.object({
  assessmentItemId: z.string(),
  courseUnitId: z.string(),
})

export const PlanSchema = z
  .object({
    metadata: MetadataSchema,
    documentState: z.string(),
    id: z.string(),
    rootId: z.string(),
    learningOpportunityId: z.string(),
    userId: z.string(),
    name: z.string(),
    curriculumPeriodId: z.string(),
    moduleSelections: z.array(ModuleSelectionSchema),
    courseUnitSelections: z.array(CourseUnitSelectionSchema),
    customModuleAttainmentSelections: z.array(z.unknown()),
    customCourseUnitAttainmentSelections: z.array(z.unknown()),
    assessmentItemSelections: z.array(AssessmentItemSelectionSchema),
    timelineNotes: z.array(z.unknown()),
    customStudyDrafts: z.array(z.unknown()),
    primary: z.boolean(),
  })
  .passthrough()

export const PlansResponseSchema = z.array(PlanSchema)

export type Plan = z.infer<typeof PlanSchema>
export type PlansResponse = z.infer<typeof PlansResponseSchema>

export const PLANS_ENDPOINT = '/osuva/api/my-plans'
