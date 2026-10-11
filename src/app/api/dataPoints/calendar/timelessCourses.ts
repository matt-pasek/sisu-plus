import type { CourseUnitRealisation, Enrolment, EnrolmentWithStudyEvents } from '@/app/api/generated/IlmoApi';
import type { DateRange } from '@/app/schedule';

const ACTIVE_STATES = new Set<Enrolment['state']>(['ENROLLED', 'CONFIRMED']);

const isActive = (enrolment: Enrolment, knownKeys: Set<string>): boolean =>
  ACTIVE_STATES.has(enrolment.state) && !knownKeys.has(enrolment.courseUnitRealisationId);

const overlapsRange = (realisation: CourseUnitRealisation, range: DateRange): boolean => {
  const { startDate, endDate } = realisation.activityPeriod ?? {};
  return startDate != null && startDate < range.endKey && (endDate == null || endDate > range.startKey);
};

const hasNoStudyEvents = (realisation: CourseUnitRealisation): boolean =>
  (realisation.studyGroupSets ?? []).every((set) =>
    set.studySubGroups.every((group) => (group.studyEventIds ?? []).length === 0),
  );

// study-events-in-calendar leaves out enrolments without any study events, so courses taught outside Sisu need their own rows.
export const timelessRealisationIds = (enrolments: Enrolment[], knownKeys: Set<string>): string[] =>
  [
    ...new Set(
      enrolments
        .filter((enrolment) => isActive(enrolment, knownKeys))
        .map((enrolment) => enrolment.courseUnitRealisationId),
    ),
  ].sort();

export const timelessRows = (
  enrolments: Enrolment[],
  realisations: CourseUnitRealisation[],
  knownKeys: Set<string>,
  range: DateRange,
): EnrolmentWithStudyEvents[] => {
  const byId = new Map(realisations.flatMap((realisation) => (realisation.id ? [[realisation.id, realisation]] : [])));
  return enrolments.flatMap((enrolment) => {
    const realisation = byId.get(enrolment.courseUnitRealisationId);
    if (!realisation || !isActive(enrolment, knownKeys)) return [];
    if (!overlapsRange(realisation, range) || !hasNoStudyEvents(realisation)) return [];
    return [{ enrolment, courseUnitRealisation: realisation, studyEvents: [] }];
  });
};
