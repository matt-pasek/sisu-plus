import React, { useMemo } from 'react';
import type { CalendarCourse, RoomInfo } from '@/app/api/dataPoints/calendar/types';
import { Button } from '@/app/components/ui/Button.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { sharedRelations, type AttendancePlan, type Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { CalendarActions } from '../types';
import { sessionsByGroup } from '../util';
import { GroupSetSection } from './GroupSetSection.comp';
import { CloseIcon } from './icons';

interface Props {
  course: CalendarCourse;
  focusSetId: string | null;
  candidates: Session[];
  attended: Session[];
  plan: AttendancePlan | undefined;
  rooms: Record<string, RoomInfo>;
  isLoading: boolean;
  isFailed: boolean;
  locale: string;
  actions: CalendarActions;
  onPreview: (groupId: string | null) => void;
  onRetry: () => void;
  onClose: () => void;
}

export const GroupPicker: React.FC<Props> = ({
  course,
  focusSetId,
  candidates,
  attended,
  plan,
  rooms,
  isLoading,
  isFailed,
  locale,
  actions,
  onPreview,
  onRetry,
  onClose,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const byGroup = useMemo(() => sessionsByGroup(candidates, course.realisationId), [candidates, course.realisationId]);
  const groupEvents = useMemo(
    () =>
      course.groupSets.flatMap((set) =>
        set.groups.map((group) => ({ id: group.id, eventIds: group.eventIds, visible: group.isInCalendar })),
      ),
    [course.groupSets],
  );
  const relations = useMemo(() => sharedRelations(groupEvents), [groupEvents]);
  const groupNames = useMemo(
    () => new Map(course.groupSets.flatMap((set) => set.groups.map((group) => [group.id, group.name ?? group.id]))),
    [course.groupSets],
  );
  const sets = useMemo(() => {
    const withEvents = course.groupSets.filter((set) => set.groups.some((group) => group.eventIds.length > 0));
    return [...withEvents.filter((set) => set.id === focusSetId), ...withEvents.filter((set) => set.id !== focusSetId)];
  }, [course.groupSets, focusSetId]);

  return (
    <Panel
      className="max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-40 max-lg:max-h-[60dvh]"
      header={
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="w-1 self-stretch rounded-full"
              style={{ backgroundColor: getModuleColorValueByIndex(course.colorIndex) }}
            />
            <div className="min-w-0">
              <PanelEyebrow>{t('groups.title')}</PanelEyebrow>
              <p className="truncate text-sm font-semibold text-offwhite">{course.name}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={onClose}
            className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5" onMouseLeave={() => onPreview(null)}>
        {isFailed ? (
          <div className="flex flex-col items-center gap-2.5 py-6 text-sm text-lightGrey">
            <p>{t('groups.failed')}</p>
            <Button variant="onSurface" className="min-h-8 px-2.5" onClick={onRetry}>
              {t('states.retry')}
            </Button>
          </div>
        ) : isLoading && byGroup.size === 0 ? (
          <p className="py-6 text-center text-sm text-lightGrey">{t('groups.loading')}</p>
        ) : (
          sets.map((set) => (
            <GroupSetSection
              key={set.id}
              course={course}
              set={set}
              sessionsByGroup={byGroup}
              attended={attended}
              relations={relations}
              groupEvents={groupEvents}
              groupNames={groupNames}
              usual={plan?.usual[set.id] ?? null}
              rooms={rooms}
              locale={locale}
              actions={actions}
              onPreview={onPreview}
              onDone={onClose}
            />
          ))
        )}
      </div>
    </Panel>
  );
};
