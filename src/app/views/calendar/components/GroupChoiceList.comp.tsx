import React from 'react';
import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { GroupRowModel } from '../types';
import { GroupFit } from './GroupFit.comp';

const RADIO =
  'mt-0.5 size-3.5 shrink-0 cursor-pointer appearance-none rounded-full border border-lightGrey transition-[border-color,border-width] duration-150 checked:border-[4px] checked:border-lighterGreen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen';
const OPTION = 'flex cursor-pointer gap-2.5 border-t border-white/[0.06] py-2.5 first:border-t-0';

interface Props {
  setId: string;
  question: string;
  rows: GroupRowModel[];
  usual: string | null;
  locale: string;
  onChoose: (group: CalendarGroup) => void;
  onVaries: () => void;
  onPreview: (groupId: string | null) => void;
}

export const GroupChoiceList: React.FC<Props> = ({
  setId,
  question,
  rows,
  usual,
  locale,
  onChoose,
  onVaries,
  onPreview,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const name = `usual-${setId}`;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[13px] font-semibold text-offwhite">{question}</legend>
      {rows.map(({ group, name: groupName, details, stats }) => (
        <label
          key={group.id}
          className={OPTION}
          onMouseEnter={() => onPreview(group.id)}
          onFocus={() => onPreview(group.id)}
        >
          <input
            type="radio"
            name={name}
            className={RADIO}
            checked={usual === group.id}
            onChange={() => onChoose(group)}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] leading-snug font-semibold text-offwhite">{groupName}</span>
            <span className="mt-0.5 block font-mono text-[11px] text-[#a3a3c4] tabular-nums">{details}</span>
            <GroupFit stats={stats} locale={locale} />
          </span>
        </label>
      ))}
      <label className={OPTION}>
        <input type="radio" name={name} className={RADIO} checked={usual == null} onChange={onVaries} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] leading-snug font-semibold text-offwhite">{t('groups.varies')}</span>
          <span className="mt-0.5 block text-[11.5px] text-lightGrey">{t('groups.variesDetail')}</span>
        </span>
      </label>
      {usual != null && <p className="mt-1 text-[11.5px] text-lightGrey">{t('groups.swapHint')}</p>}
    </fieldset>
  );
};
