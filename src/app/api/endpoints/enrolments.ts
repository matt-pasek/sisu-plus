import { z } from 'zod';

const MetadataSchema = z.object({
  revision: z.number(),
  createdBy: z.string(),
  createdOn: z.string(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.string(),
  modificationOrdinal: z.number(),
});

const StudySubGroupSchema = z.object({
  studySubGroupId: z.string(),
  enrolmentStudySubGroupPriority: z.string(),
  isInCalendar: z.boolean(),
});

const StudyGroupSetSchema = z.object({
  studyGroupSetId: z.string(),
  targetStudySubGroupAmount: z.number().nullable(),
});

export const EnrolmentSchema = z
  .object({
    metadata: MetadataSchema,
    documentState: z.string(),
    id: z.string(),
    personId: z.string(),
    courseUnitRealisationId: z.string(),
    courseUnitId: z.string(),
    assessmentItemId: z.string(),
    studyRightId: z.string(),
    openUniversityCartId: z.string().nullable(),
    openUniversityCartItemId: z.string().nullable(),
    status: z.string().nullable(),
    state: z.string(),
    processingState: z.string(),
    studySubGroups: z.array(StudySubGroupSchema),
    studyGroupSets: z.array(StudyGroupSetSchema).nullable(),
    confirmedStudySubGroupIds: z.array(z.string()),
    tentativeStudySubGroupIds: z.array(z.string()),
    enrolmentDateTime: z.string(),
    isInCalendar: z.boolean(),
    colorIndex: z.number().nullable(),
    quotaIds: z.array(z.string()),
    activeQuotaId: z.string().nullable(),
    allocatedQuotaId: z.string().nullable(),
    maximumQuotaIds: z.array(z.string()),
    enrolmentRightId: z.string().nullable(),
    replacedByEnrolmentId: z.string().nullable(),
    cooperationNetworkStatus: z.unknown().nullable(),
    studentConsentForOutboundDataTransfer: z.unknown().nullable(),
  })
  .passthrough();

export const EnrolmentsResponseSchema = z.array(EnrolmentSchema);

export type Enrolment = z.infer<typeof EnrolmentSchema>;
export type EnrolmentsResponse = z.infer<typeof EnrolmentsResponseSchema>;

export const ENROLMENTS_ENDPOINT = '/ilmo/api/my-enrolments';
