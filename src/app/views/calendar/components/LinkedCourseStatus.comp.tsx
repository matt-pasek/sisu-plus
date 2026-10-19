import React from 'react';
import type { LinkedTimetableState } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatClock } from '../util';
import { LinkIcon } from './icons';

const TEXT_BUTTON =
  'cursor-pointer font-semibold text-lightGrey underline-offset-2 hover:text-offwhite hover:underline';

interface Props {
  noTimes: boolean;
  hasSisuTimes: boolean;
  state: LinkedTimetableState | undefined;
  onAdd: () => void;
  onRefresh: () => void;
  onRemove: () => void;
}

export const LinkedCourseStatus: React.FC<Props> = ({ noTimes, hasSisuTimes, state, onAdd, onRefresh, onRemove }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (!state) {
    if (!noTimes) return null;
    return (
      <div className="mt-1.5 ml-6 text-[11.5px] text-lightGrey">
        <p>{t('sidebar.noTimes')}</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-1 inline-flex cursor-pointer items-center gap-1.5 font-semibold text-accent underline-offset-2 hover:underline"
        >
          <LinkIcon className="size-3" />
          {t('sidebar.addTimetable')}
        </button>
      </div>
    );
  }
  const failing = state.status === 'stale' || state.status === 'error';
  return (
    <div className="mt-1.5 ml-6 flex flex-col gap-1 text-[11.5px]">
      <span className="inline-flex items-center gap-1.5 text-lightGrey">
        <LinkIcon className="size-3" />
        {state.label}
        {state.fetchedAt != null && ` · ${t('footer.updated', { time: formatClock(new Date(state.fetchedAt)) })}`}
      </span>
      {failing && <span className="text-warn">{t('linked.unreachable')}</span>}
      {hasSisuTimes && <span className="text-blue-300">{t('linked.sisuHasTimes')}</span>}
      <span className="flex flex-wrap gap-3">
        <button type="button" className={TEXT_BUTTON} onClick={onRefresh}>
          {failing ? t('linked.retry') : t('linked.refresh')}
        </button>
        <button type="button" className={TEXT_BUTTON} onClick={onAdd}>
          {t('linked.edit')}
        </button>
        <button type="button" className={TEXT_BUTTON} onClick={onRemove}>
          {t('linked.remove')}
        </button>
      </span>
    </div>
  );
};
