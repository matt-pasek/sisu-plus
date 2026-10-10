import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatClock } from '../util';
import { RefreshIcon } from './icons';

interface Props {
  updatedAt: number;
  isFetching: boolean;
  onRefresh: () => void;
}

export const ProvenanceFooter: React.FC<Props> = ({ updatedAt, isFetching, onRefresh }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div className="flex items-center justify-between gap-3">
      <span>
        {t('footer.source')}
        {updatedAt > 0 && ` · ${t('footer.updated', { time: formatClock(new Date(updatedAt)) })}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex cursor-pointer items-center gap-1.5 text-lightGrey transition-colors duration-150 hover:text-offwhite disabled:cursor-default disabled:opacity-60"
      >
        <RefreshIcon className={`size-3.5 ${isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`} />
        {t('actions.refresh')}
      </button>
    </div>
  );
};
