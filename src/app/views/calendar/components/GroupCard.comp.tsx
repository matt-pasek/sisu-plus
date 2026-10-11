import React from 'react';
import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import { Button } from '@/app/components/ui/Button.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { GroupStats, SharedRelation } from '@/app/schedule';
import { joinNames } from '../util';
import { ToggleSwitch } from './ToggleSwitch.comp';

interface Props {
  group: CalendarGroup;
  stats: GroupStats;
  relations: SharedRelation[];
  groupNames: Map<string, string>;
  shownThrough: string[];
  canUse: boolean;
  showUsual: boolean;
  isUsual: boolean;
  details: string;
  locale: string;
  onToggle: (visible: boolean) => void;
  onUse: () => void;
  onHideToo: () => void;
  onUsual: () => void;
  onPreview: (groupId: string | null) => void;
}

export const GroupCard: React.FC<Props> = ({
  group,
  stats,
  relations,
  groupNames,
  shownThrough,
  canUse,
  showUsual,
  isUsual,
  details,
  locale,
  onToggle,
  onUse,
  onHideToo,
  onUsual,
  onPreview,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const nameOf = (id: string): string => groupNames.get(id) ?? id;
  const verdict =
    stats.total === 0
      ? t('groups.noSessions')
      : stats.clashing === 0
        ? t('groups.fitsAll', { count: stats.total })
        : t('groups.clashes', {
            count: stats.clashing,
            total: stats.total,
            names: joinNames(stats.clashCourseNames.slice(0, 2), locale),
          });

  return (
    <li
      className="rounded-xl bg-container2/60 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
      onMouseEnter={() => onPreview(group.id)}
      onFocus={() => onPreview(group.id)}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug font-semibold text-offwhite">{group.name ?? group.id}</p>
          <p className="mt-0.5 font-mono text-[11px] text-[#a3a3c4] tabular-nums">{details}</p>
        </div>
        <ToggleSwitch
          checked={group.isInCalendar}
          disabled={!group.hasEntry}
          label={t('groups.showInCalendar')}
          onChange={onToggle}
        />
      </div>
      {stats.total > 0 && (
        <div className="mt-2 flex flex-wrap gap-[3px]" aria-hidden="true">
          {stats.perSession.map((entry) => (
            <span
              key={entry.sessionId}
              className={`h-1.5 w-3.5 rounded-full ${entry.clashes ? 'bg-warn' : 'bg-lighterGreen/50'}`}
            />
          ))}
        </div>
      )}
      <p className={`mt-1.5 text-[11.5px] ${stats.clashing > 0 ? 'text-warn' : 'text-lightGrey'}`}>{verdict}</p>
      {relations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {relations.map((relation) => (
            <StatusChip key={relation.groupId} tone="info" className="max-w-full">
              <span className="min-w-0 truncate">
                {relation.kind === 'identical'
                  ? t('groups.sameAs', { name: nameOf(relation.groupId) })
                  : t('groups.sharesWith', { count: relation.count, name: nameOf(relation.groupId) })}
              </span>
            </StatusChip>
          ))}
        </div>
      )}
      {!group.hasEntry && <p className="mt-1.5 text-[11px] text-lightGrey">{t('groups.changeInSisu')}</p>}
      {shownThrough.length > 0 && (
        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-blue-300">
          <span>{t('groups.stillShown', { names: shownThrough.map(nameOf).join(', ') })}</span>
          <button
            type="button"
            onClick={onHideToo}
            className="cursor-pointer font-semibold text-offwhite underline-offset-2 hover:underline"
          >
            {t('groups.hideThatToo')}
          </button>
        </p>
      )}
      {(canUse || (showUsual && group.isInCalendar)) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {canUse && (
            <Button variant="onSurface" className="min-h-7 px-2" onClick={onUse} disabled={!group.hasEntry}>
              {t('groups.useGroup')}
            </Button>
          )}
          {showUsual && group.isInCalendar && (
            <button
              type="button"
              role="radio"
              aria-checked={isUsual}
              onClick={onUsual}
              className={`inline-flex min-h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs transition-colors duration-150 ${isUsual ? 'bg-accent/20 text-accent' : 'text-lightGrey hover:text-offwhite'}`}
            >
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full border ${isUsual ? 'border-accent bg-accent' : 'border-lightGrey'}`}
              />
              {t('groups.usual')}
            </button>
          )}
        </div>
      )}
    </li>
  );
};
