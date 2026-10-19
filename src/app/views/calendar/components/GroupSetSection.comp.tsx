import React, { useMemo } from 'react';
import type { CalendarCourse, CalendarGroup, CalendarGroupSet, RoomInfo } from '@/app/api/dataPoints/calendar/types';
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
import type { CalendarActions, GroupRowModel } from '../types';
import { alternativeGroups, describeRoomShort, groupKind, sortGroups, weeklyPattern } from '../util';
import { GroupCard } from './GroupCard.comp';
import { GroupChoiceList } from './GroupChoiceList.comp';
import { GroupVisibilityList } from './GroupVisibilityList.comp';

const EMPTY_STATS: GroupStats = { total: 0, clashing: 0, perSession: [], clashWith: [] };

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
  const isActive = set.groups.some((group) => group.isInCalendar);
  const hasEntry = (id: string): boolean =>
    course.groupSets.some((item) => item.groups.some((group) => group.id === id && group.hasEntry));
  const rowOf = (group: CalendarGroup): GroupRowModel => {
    const sessions = sessionsByGroup.get(group.id) ?? [];
    const groupStats = stats.get(group.id) ?? EMPTY_STATS;
    return {
      group,
      name: groupNames.get(group.id) ?? group.id,
      details: [
        weeklyPattern(sessions, locale),
        t('groups.sessions', { count: groupStats.total }),
        sessions[0] ? describeRoomShort(sessions[0].locationIds, rooms, roomLabels) : null,
      ]
        .filter((part): part is string => Boolean(part))
        .join(' · '),
      stats: groupStats,
      shownThrough: group.isInCalendar ? [] : stillShownThrough(group.id, groupEvents),
    };
  };
  const rows = groups.map(rowOf);
  const alternativeIds = new Set(alternativeGroups(set).map((group) => group.id));
  const choiceRows = isActive
    ? rows.filter(({ group }) => alternativeIds.has(group.id) && (group.isInCalendar || group.hasEntry))
    : [];
  const showChoice = choiceRows.length >= 2;
  const infoRows = rows.filter(
    ({ group }) => group.isInCalendar && !(showChoice && choiceRows.some((row) => row.group.id === group.id)),
  );

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
      {!isActive && <p className="text-[12px] text-lightGrey">{t('groups.notInCalendar')}</p>}
      {showChoice && (
        <GroupChoiceList
          setId={set.id}
          question={t(`groups.question.${groupKind(choiceRows[0].group)}`)}
          rows={choiceRows}
          usual={usual}
          locale={locale}
          onChoose={(group) => {
            if (!group.isInCalendar && group.hasEntry) {
              actions.setGroups(course, [{ groupId: group.id, visible: true }]);
            }
            actions.makeUsual(course.realisationId, set.id, group.id);
          }}
          onVaries={() => actions.makeUsual(course.realisationId, set.id, null)}
          onPreview={onPreview}
        />
      )}
      {infoRows.length > 0 && (
        <ul className={showChoice ? 'mt-3 border-t border-white/[0.06] pt-2.5' : ''}>
          {infoRows.map(({ group, name, details, stats: groupStats }) => (
            <GroupCard
              key={group.id}
              group={group}
              name={name}
              stats={groupStats}
              relations={relations.get(group.id) ?? []}
              groupNames={groupNames}
              details={details}
              locale={locale}
              onPreview={onPreview}
            />
          ))}
        </ul>
      )}
      <GroupVisibilityList
        summary={t('groups.visibility', {
          on: groups.filter((group) => group.isInCalendar).length,
          total: groups.length,
        })}
        defaultOpen={!isActive}
        rows={rows}
        groupNames={groupNames}
        onToggle={(group, visible) => actions.setGroups(course, [{ groupId: group.id, visible }])}
        onHideToo={(row) =>
          actions.setGroups(
            course,
            row.shownThrough.filter(hasEntry).map((id) => ({ groupId: id, visible: false })),
          )
        }
        onPreview={onPreview}
      />
    </section>
  );
};
