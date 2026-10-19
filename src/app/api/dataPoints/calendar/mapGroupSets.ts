import type { Enrolment, StudyGroupSet } from '@/app/api/generated/IlmoApi';
import type { CalendarGroupSet, LabelPicker } from './types';

const allocatedIds = (enrolment: Enrolment | undefined): Set<string> =>
  new Set([...(enrolment?.confirmedStudySubGroupIds ?? []), ...(enrolment?.tentativeStudySubGroupIds ?? [])]);

export const mapGroupSets = (
  sets: StudyGroupSet[],
  enrolment: Enrolment | undefined,
  label: LabelPicker,
): CalendarGroupSet[] => {
  const entries = new Map((enrolment?.studySubGroups ?? []).map((entry) => [entry.studySubGroupId, entry]));
  const allocated = allocatedIds(enrolment);
  return sets.map((set) => ({
    id: set.localId,
    name: label(set.name),
    min: set.subGroupRange?.min ?? 0,
    max: set.subGroupRange?.max ?? 0,
    groups: set.studySubGroups.flatMap((group) => {
      if (!group.id) return [];
      const entry = entries.get(group.id);
      return [
        {
          id: group.id,
          name: label(group.name),
          setId: set.localId,
          eventIds: [...new Set(group.studyEventIds)],
          isInCalendar: entry ? entry.isInCalendar !== false : allocated.has(group.id),
          hasEntry: entry != null,
          cancelled: group.cancelled === true,
        },
      ];
    }),
  }));
};
