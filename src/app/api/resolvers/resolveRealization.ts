import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type { CourseUnitRealisation, LocalizedUrl, StudyGroupSet } from '@/app/api/generated/KoriApi';

export type RealisationStudySubGroupResult = {
  id: string;
  name: string | null;
};

export type RealisationStudyGroupSetResult = {
  id: string;
  name: string | null;
  max: number | null;
  min: number;
  subGroups: RealisationStudySubGroupResult[];
};

export type RealisationResult = {
  id: string | null;
  assessmentItemIds: string[];
  cancellationEnd: string | null;
  continuousEnrolment: boolean;
  endDate: string | null;
  enrolmentEnd: string | null;
  enrolmentStart: string | null;
  externalEnrolmentUrl: string | null;
  flowState: string | null;
  lateEnrolmentEnd: string | null;
  name: string | null;
  startDate: string | null;
  studyGroupSets: RealisationStudyGroupSetResult[];
  typeUrn: string | null;
  usesExternalEnrolment: boolean;
};

const realisationCache = new Map<string, RealisationResult>();

function pickUrl(url: LocalizedUrl | undefined): string | null {
  if (!url) return null;
  return url.en ?? url.fi ?? url.sv ?? null;
}

export function toStudyGroupSetResult(studyGroupSet: StudyGroupSet): RealisationStudyGroupSetResult {
  return {
    id: studyGroupSet.localId,
    name: pickLabel(studyGroupSet.name),
    max: studyGroupSet.subGroupRange.max ?? null,
    min: studyGroupSet.subGroupRange.min,
    subGroups: studyGroupSet.studySubGroups
      .filter((subGroup) => subGroup.id != null && subGroup.cancelled !== true)
      .map((subGroup) => ({
        id: subGroup.id!,
        name: pickLabel(subGroup.name),
      })),
  };
}

export function mapRealisationToResult(realisation: CourseUnitRealisation, fallbackId?: string): RealisationResult {
  return {
    id: realisation.id ?? fallbackId ?? null,
    assessmentItemIds: realisation.assessmentItemIds ?? [],
    cancellationEnd: realisation.enrolmentAdditionalCancellationEnd ?? null,
    continuousEnrolment: realisation.continuousEnrolment === true,
    endDate: realisation.activityPeriod?.endDate ?? null,
    enrolmentEnd: realisation.enrolmentPeriod?.endDateTime ?? null,
    enrolmentStart: realisation.enrolmentPeriod?.startDateTime ?? null,
    externalEnrolmentUrl: pickUrl(realisation.externalEnrolmentLink?.url),
    flowState: realisation.flowState ?? null,
    lateEnrolmentEnd: realisation.lateEnrolmentEnd ?? null,
    name: pickLabel(realisation.name),
    startDate: realisation.activityPeriod?.startDate ?? null,
    studyGroupSets: realisation.studyGroupSets?.map(toStudyGroupSetResult) ?? [],
    typeUrn: realisation.courseUnitRealisationTypeUrn ?? null,
    usesExternalEnrolment: realisation.usesExternalEnrolment === true,
  };
}

export const resolveRealisation = async (courseUnitRealisationId: string): Promise<RealisationResult> => {
  const cached = realisationCache.get(courseUnitRealisationId);
  if (cached) return cached;

  try {
    const result = mapRealisationToResult(
      (await koriApi.api.getCourseUnitRealisation(courseUnitRealisationId)).data,
      courseUnitRealisationId,
    );
    realisationCache.set(courseUnitRealisationId, result);
    return result;
  } catch {
    const fallback: RealisationResult = {
      id: courseUnitRealisationId,
      assessmentItemIds: [],
      cancellationEnd: null,
      continuousEnrolment: false,
      endDate: null,
      enrolmentEnd: null,
      enrolmentStart: null,
      externalEnrolmentUrl: null,
      flowState: null,
      lateEnrolmentEnd: null,
      name: null,
      startDate: null,
      studyGroupSets: [],
      typeUrn: null,
      usesExternalEnrolment: false,
    };
    realisationCache.set(courseUnitRealisationId, fallback);
    return fallback;
  }
};
