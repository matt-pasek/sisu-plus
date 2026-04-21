import { z } from 'zod'

const MetadataSchema = z.object({
  revision: z.number(),
  createdBy: z.string(),
  createdOn: z.string(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.string(),
  modificationOrdinal: z.number(),
})

const AcceptorPersonSchema = z.object({
  text: z.unknown(),
  personId: z.string(),
  roleUrn: z.string(),
  title: z.unknown(),
})

const OrganisationSchema = z.object({
  organisationId: z.string(),
  educationalInstitutionUrn: z.string().nullable(),
  roleUrn: z.string(),
  share: z.number(),
})

const GradeAverageSchema = z.object({
  gradeScaleId: z.string(),
  value: z.number().nullable(),
  totalIncludedCredits: z.number(),
  method: z.string(),
})

export const AttainmentSchema = z
  .object({
    metadata: MetadataSchema,
    documentState: z.string(),
    id: z.string(),
    personId: z.string(),
    personFirstNames: z.string().nullable(),
    personLastName: z.string().nullable(),
    personStudentNumber: z.string().nullable(),
    verifierPersonId: z.string().nullable(),
    studyRightId: z.string(),
    registrationDate: z.string(),
    expiryDate: z.string().nullable(),
    attainmentLanguageUrn: z.string(),
    acceptorPersons: z.array(AcceptorPersonSchema),
    organisations: z.array(OrganisationSchema),
    state: z.string(),
    misregistration: z.boolean(),
    misregistrationRationale: z.string().nullable(),
    primary: z.boolean(),
    credits: z.number(),
    studyWeeks: z.number().nullable(),
    gradeScaleId: z.string(),
    gradeId: z.number(),
    gradeAverage: GradeAverageSchema.nullable(),
    additionalInfo: z.unknown().nullable(),
    administrativeNote: z.string().nullable(),
    studyFieldUrn: z.string().nullable(),
    workflowId: z.string().nullable(),
    moduleContentApplicationId: z.string().nullable(),
    creditTransferInfo: z.unknown().nullable(),
    cooperationNetworkStatus: z.unknown().nullable(),
    rdiCredits: z.number().nullable(),
    collaborationInstitution: z.unknown().nullable(),
    enrolmentRightId: z.string().nullable(),
    s2r2Classification: z.unknown().nullable(),
    courseUnitId: z.string(),
    courseUnitGroupId: z.string(),
    assessmentItemAttainmentIds: z.array(z.string()).nullish(),
    resolutionRationale: z.string().nullish(),
    evaluationCriteria: z.unknown().nullable(),
    attainmentDate: z.string(),
    type: z.string(),
    studentApplicationId: z.string().nullable(),
  })
  .passthrough()

export const AttainmentsResponseSchema = z.array(AttainmentSchema)

export type Attainment = z.infer<typeof AttainmentSchema>
export type AttainmentsResponse = z.infer<typeof AttainmentsResponseSchema>

export const ATTAINMENTS_ENDPOINT = '/ori/api/my-attainments'
