import React from 'react';
import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { GroupStats, SharedRelation } from '@/app/schedule';
import { GroupFit } from './GroupFit.comp';

interface Props {
  group: CalendarGroup;
  name: string;
  stats: GroupStats;
  relations: SharedRelation[];
  groupNames: Map<string, string>;
  details: string;
  locale: string;
  onPreview: (groupId: string | null) => void;
}

export const GroupCard: React.FC<Props> = ({
  group,
  name,
  stats,
  relations,
  groupNames,
  details,
  locale,
  onPreview,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const nameOf = (id: string): string => groupNames.get(id) ?? id;
  return (
    <li
      className="border-t border-white/[0.06] py-2.5 first:border-t-0 first:pt-0"
      onMouseEnter={() => onPreview(group.id)}
      onFocus={() => onPreview(group.id)}
    >
      <p className="text-[13px] leading-snug font-semibold text-offwhite">{name}</p>
      <p className="mt-0.5 font-mono text-[11px] text-[#a3a3c4] tabular-nums">{details}</p>
      <GroupFit stats={stats} locale={locale} />
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
    </li>
  );
};
