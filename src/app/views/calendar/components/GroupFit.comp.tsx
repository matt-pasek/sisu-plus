import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { GroupStats } from '@/app/schedule';
import { joinNames } from '../util';

interface Props {
  stats: GroupStats;
  locale: string;
}

export const GroupFit: React.FC<Props> = ({ stats, locale }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const verdict =
    stats.total === 0
      ? t('groups.noSessions')
      : stats.clashing === 0
        ? t('groups.fitsAll', { count: stats.total })
        : t('groups.clashes', {
            count: stats.clashing,
            total: stats.total,
            names: joinNames(
              stats.clashWith
                .slice(0, 2)
                .map((entry) => `${entry.courseName} ${t(`kinds.${entry.kind}`).toLowerCase()}`),
              locale,
            ),
          });
  return (
    <>
      {stats.total > 0 && (
        <span className="mt-1.5 flex flex-wrap gap-[3px]" aria-hidden="true">
          {stats.perSession.map((entry) => (
            <span
              key={entry.sessionId}
              className={`h-1.5 w-3.5 rounded-full ${entry.clashes ? 'bg-warn' : 'bg-lighterGreen/50'}`}
            />
          ))}
        </span>
      )}
      <span className={`mt-1 block text-[11.5px] ${stats.clashing > 0 ? 'text-warn' : 'text-lightGrey'}`}>
        {verdict}
      </span>
    </>
  );
};
