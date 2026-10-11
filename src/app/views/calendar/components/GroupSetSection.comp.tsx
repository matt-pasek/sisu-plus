import React, { useMemo } from 'react';
import type { CalendarCourse, CalendarGroupSet, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  statsForCandidate,
  stillShownThrough,
  type GroupEvents,
  type GroupStats,
  type SharedRelation,
  type Session,
} from '@/app/schedule';
import type { CalendarActions } from '../types';
import { describeRoomShort, sortGroups, weeklyPattern } from '../util';
import { GroupCard } from './GroupCard.comp';

const EMPTY_STATS: GroupStats = { total: 0, clashing: 0, perSession: [], clashCourseNames: [] };

interface Props {
  course: CalendarCourse;
  set: CalendarGroupSet;
  sessionsByGroup: Map<string, Session[]>;
  attended: Session[];
  relations: Map<string, SharedRelation[]>;
  groupEvents: GroupEvents[];
  groupNames: Map<string, string>;
  usual: string | null;
  rooms: Record<string, RoomInfo>;
  locale: string;
  actions: CalendarActions;
  onPreview: (groupId: string | null) => void;
  onDone: () => void;
}

export const GroupSetSection: React.FC<Props> = ({
  course,
  set,
  sessionsByGroup,
  attended,
  relations,
  groupEvents,
  groupNames,
  usual,
  rooms,
  locale,
  actions,
  onPreview,
  onDone,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const roomLabels = { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') };
  const stats = useMemo(() => {
    const siblings = new Set(set.groups.map((group) => group.id));
    return new Map(
      set.groups.map((group) => [group.id, statsForCandidate(sessionsByGroup.get(group.id) ?? [], attended, siblings)]),
    );
  }, [set.groups, sessionsByGroup, attended]);
  const groups = sortGroups(
    set.groups.filter((group) => !group.cancelled && group.eventIds.length > 0),
    stats,
    sessionsByGroup,
  );
  const showUsual = set.groups.filter((group) => group.isInCalendar).length >= 2;
  const withEntry = set.groups.filter((group) => group.hasEntry);
  const hasEntry = (id: string): boolean =>
    course.groupSets.some((item) => item.groups.some((group) => group.id === id && group.hasEntry));

  return (
    <section className="border-t border-border py-3 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <PanelEyebrow>{set.name ?? t('groups.title')}</PanelEyebrow>
        <span className="font-mono text-[10.5px] text-lightGrey">
          {set.max > 0
            ? t('groups.choose', { max: set.max, count: groups.length })
            : t('groups.count', { count: groups.length })}
        </span>
      </div>
      {showUsual && <p className="mb-2 text-[11.5px] text-lightGrey">{t('groups.usualHint')}</p>}
      <ul className="flex flex-col gap-2">
        {groups.map((group) => {
          const sessions = sessionsByGroup.get(group.id) ?? [];
          const groupStats = stats.get(group.id) ?? EMPTY_STATS;
          const details = [
            weeklyPattern(sessions, locale),
            t('groups.sessions', { count: groupStats.total }),
            sessions[0] ? describeRoomShort(sessions[0].locationIds, rooms, roomLabels) : null,
          ]
            .filter((part): part is string => Boolean(part))
            .join(' · ');
          const shownThrough = group.isInCalendar ? [] : stillShownThrough(group.id, groupEvents);
          return (
            <GroupCard
              key={group.id}
              group={group}
              stats={groupStats}
              relations={relations.get(group.id) ?? []}
              groupNames={groupNames}
              shownThrough={shownThrough}
              canUse={groups.length > 1}
              showUsual={showUsual}
              isUsual={usual === group.id}
              details={details}
              locale={locale}
              onToggle={(visible) => actions.setGroups(course, [{ groupId: group.id, visible }])}
              onUse={() => {
                actions.setGroups(
                  course,
                  withEntry
                    .filter((other) => other.isInCalendar !== (other.id === group.id))
                    .map((other) => ({ groupId: other.id, visible: other.id === group.id })),
                );
                onDone();
              }}
              onHideToo={() =>
                actions.setGroups(
                  course,
                  shownThrough.filter(hasEntry).map((id) => ({ groupId: id, visible: false })),
                )
              }
              onUsual={() => actions.makeUsual(course.realisationId, set.id, usual === group.id ? null : group.id)}
              onPreview={onPreview}
            />
          );
        })}
      </ul>
    </section>
  );
};
