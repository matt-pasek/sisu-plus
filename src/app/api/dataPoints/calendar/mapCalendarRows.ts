import type { EnrolmentWithStudyEvents } from '@/app/api/generated/IlmoApi';
import { classifySessionKind, expandSeries, type DateRange, type Session } from '@/app/schedule';
import { compareCourses } from './courseOrder';
import { mapGroupSets } from './mapGroupSets';
import { toSeries } from './studyEventSeries';
import type { CalendarCourse, CalendarGroup, CalendarGroupSet, CalendarRowsResult, LabelPicker } from './types';

const isExamRealisation = (typeUrn: string | undefined): boolean => /exam/i.test(typeUrn ?? '');

const ownersOf = (studyEventId: string | undefined, groupSets: CalendarGroupSet[]): CalendarGroup[] =>
  studyEventId ? groupSets.flatMap((set) => set.groups.filter((group) => group.eventIds.includes(studyEventId))) : [];

const displayOwner = (owners: CalendarGroup[]): CalendarGroup | undefined =>
  owners.find((group) => group.isInCalendar) ?? owners.find((group) => group.hasEntry) ?? owners[0];

const mapRow = (
  row: EnrolmentWithStudyEvents,
  rowIndex: number,
  range: DateRange,
  label: LabelPicker,
): { sessions: Session[]; course: CalendarCourse | null } => {
  const realisation = row.courseUnitRealisation;
  const realisationId = realisation?.id;
  if (!realisation || !realisationId) return { sessions: [], course: null };

  const courseName = label(realisation.name) ?? realisationId;
  const colorIndex = row.enrolment?.colorIndex ?? rowIndex;
  const isExam = isExamRealisation(realisation.courseUnitRealisationTypeUrn);
  const courseUnitId = row.enrolment?.courseUnitId ?? null;
  const groupSets = mapGroupSets(realisation.studyGroupSets ?? [], row.enrolment, label);
  const setNames = new Map(groupSets.map((set) => [set.id, set.name]));

  const sessions = (row.studyEvents ?? []).flatMap((studyEvent) => {
    const owners = ownersOf(studyEvent.id, groupSets);
    const group = displayOwner(owners);
    const kind = classifySessionKind(
      [group?.name, label(studyEvent.name), group ? setNames.get(group.setId) : null],
      isExam,
    );
    const series = toSeries(studyEvent, `${realisationId}:${studyEvent.startTime}`, label);
    return expandSeries(series, range).map(
      (occurrence): Session => ({
        ...occurrence,
        id: `${occurrence.seriesId}@${occurrence.dateKey}#${occurrence.index}`,
        courseKey: realisationId,
        courseName,
        courseUnitId,
        groupId: group?.id ?? null,
        groupName: group?.name ?? null,
        groupIds: owners.map((owner) => owner.id),
        kind,
        colorIndex,
        source: 'sisu',
        locationText: null,
      }),
    );
  });

  return {
    sessions,
    course: {
      realisationId,
      courseUnitId,
      enrolmentId: row.enrolment?.id ?? null,
      name: courseName,
      realisationName: courseName,
      colorIndex,
      isInCalendar: row.enrolment?.isInCalendar !== false,
      isExam,
      groupSets,
    },
  };
};

export const mapCalendarRows = (
  rows: EnrolmentWithStudyEvents[],
  range: DateRange,
  label: LabelPicker,
): CalendarRowsResult => {
  const mapped = rows.map((row, index) => mapRow(row, index, range, label));
  const sessions = [...new Map(mapped.flatMap((entry) => entry.sessions).map((s) => [s.id, s])).values()].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );
  const courses = [
    ...new Map(
      mapped.flatMap((entry) => (entry.course ? [entry.course] : [])).map((course) => [course.realisationId, course]),
    ).values(),
  ].sort(compareCourses);
  return { sessions, courses };
};
