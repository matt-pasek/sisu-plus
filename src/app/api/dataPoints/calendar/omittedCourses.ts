import type { CourseUnitRealisation, Enrolment, EnrolmentWithStudyEvents } from '@/app/api/generated/IlmoApi';
import type { DateRange } from '@/app/schedule';

const ACTIVE_STATES = new Set<Enrolment['state']>(['ENROLLED', 'CONFIRMED']);

const isActive = (enrolment: Enrolment): boolean => ACTIVE_STATES.has(enrolment.state);

const overlapsRange = (realisation: CourseUnitRealisation, range: DateRange): boolean => {
  const { startDate, endDate } = realisation.activityPeriod ?? {};
  return startDate != null && startDate < range.endKey && (endDate == null || endDate > range.startKey);
};

// study-events-in-calendar leaves out enrolments with no study events in the calendar: courses taught outside Sisu,
// hidden courses and courses with every group switched off. They still belong in the course list.
export const activeRealisationIds = (enrolments: Enrolment[]): string[] =>
  [...new Set(enrolments.filter(isActive).map((enrolment) => enrolment.courseUnitRealisationId))].sort();

export const omittedRows = (
  enrolments: Enrolment[],
  realisations: CourseUnitRealisation[],
  knownKeys: Set<string>,
  range: DateRange,
): EnrolmentWithStudyEvents[] => {
  const byId = new Map(realisations.flatMap((realisation) => (realisation.id ? [[realisation.id, realisation]] : [])));
  return enrolments.flatMap((enrolment) => {
    const realisation = byId.get(enrolment.courseUnitRealisationId);
    if (!realisation || !isActive(enrolment) || knownKeys.has(enrolment.courseUnitRealisationId)) return [];
    if (!overlapsRange(realisation, range)) return [];
    return [{ enrolment, courseUnitRealisation: realisation, studyEvents: [] }];
  });
};
