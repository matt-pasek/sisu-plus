import type { Enrolment, EnrolmentWithStudyEvents, StudyEvent, StudyGroupSet } from '@/app/api/generated/IlmoApi';
import { classifySessionKind, expandSeries, type DateRange, type RecurringSeries, type Session } from '@/app/schedule';
import type { CalendarCourse, CalendarRowsResult, LabelPicker } from './types';

interface SubGroupMatch {
  id: string;
  name: string | null;
  setName: string | null;
}

const isExamRealisation = (typeUrn: string | undefined): boolean => /exam/i.test(typeUrn ?? '');

const selectedSubGroupIds = (enrolment: Enrolment | undefined): Set<string> =>
  new Set([
    ...(enrolment?.studySubGroups ?? []).map((group) => group.studySubGroupId),
    ...(enrolment?.confirmedStudySubGroupIds ?? []),
    ...(enrolment?.tentativeStudySubGroupIds ?? []),
  ]);

const matchSubGroup = (
  studyEventId: string | undefined,
  sets: StudyGroupSet[],
  selected: Set<string>,
  label: LabelPicker,
): SubGroupMatch | null => {
  if (!studyEventId) return null;
  const candidates = sets.flatMap((set) =>
    set.studySubGroups.flatMap((group) =>
      group.id && group.studyEventIds.includes(studyEventId) ? [{ id: group.id, group, set }] : [],
    ),
  );
  const match = candidates.find((candidate) => selected.has(candidate.id)) ?? candidates[0];
  return match ? { id: match.id, name: label(match.group.name), setName: label(match.set.name) } : null;
};

const toSeries = (studyEvent: StudyEvent, fallbackId: string, label: LabelPicker): RecurringSeries => ({
  id: studyEvent.id ?? fallbackId,
  startTime: studyEvent.startTime,
  duration: studyEvent.duration,
  recursEvery: studyEvent.recursEvery,
  recursUntil: studyEvent.recursUntil?.slice(0, 10),
  exceptions: studyEvent.exceptions,
  cancellations: studyEvent.cancellations,
  locationIds: studyEvent.locationIds,
  occurrences: studyEvent.events?.map((event) => ({
    start: event.start,
    end: event.end,
    duration: event.duration,
    excluded: event.excluded,
    cancelled: event.cancelled,
    irregularLocationIds: event.irregularLocationIds,
    notice: label(event.notice),
  })),
});

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
  const selected = selectedSubGroupIds(row.enrolment);

  const sessions = (row.studyEvents ?? []).flatMap((studyEvent) => {
    const group = matchSubGroup(studyEvent.id, realisation.studyGroupSets ?? [], selected, label);
    const kind = classifySessionKind([group?.name, label(studyEvent.name), group?.setName], isExam);
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
        kind,
        colorIndex,
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
      colorIndex,
      isInCalendar: row.enrolment?.isInCalendar !== false,
      isExam,
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
  ].sort((a, b) => Number(a.isExam) - Number(b.isExam) || a.name.localeCompare(b.name));
  return { sessions, courses };
};
