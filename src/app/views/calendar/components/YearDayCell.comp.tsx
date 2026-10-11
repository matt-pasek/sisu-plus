import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { LOAD_LEVEL_CLASS } from '../constants/loadLevel.const';
import type { YearDay } from '../types';
import { formatHours, formatSessionDate } from '../util';

interface Props {
  day: YearDay;
  isCurrentWeek: boolean;
  locale: string;
  style: React.CSSProperties;
  onOpen: (dateKey: string) => void;
}

export const YearDayCell: React.FC<Props> = ({ day, isCurrentWeek, locale, style, onOpen }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (!day.inYear) return <span aria-hidden="true" style={style} />;
  const label = [
    t('year.cellAria', { date: formatSessionDate(day.dateKey, locale), hours: formatHours(day.minutes, locale) }),
    day.exam ? t('year.exam') : null,
    day.clash ? t('year.clash') : null,
    day.holiday ? t(`holidays.${day.holiday.id}`) : null,
  ]
    .filter(Boolean)
    .join(', ');
  const ring = day.isToday
    ? 'shadow-[0_0_0_1.5px_rgba(221,221,240,0.9)]'
    : day.clash
      ? 'shadow-[inset_0_0_0_1.5px_rgba(240,168,77,0.9)]'
      : '';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => onOpen(day.dateKey)}
      style={style}
      className={`relative aspect-square min-w-[10px] cursor-pointer rounded-[4px] transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-lighterGreen motion-reduce:transition-none motion-reduce:hover:scale-100 ${LOAD_LEVEL_CLASS[day.level]} ${ring} ${day.holiday ? 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_4px)]' : ''} ${isCurrentWeek ? 'outline-1 outline-offset-1 outline-offwhite/25 outline-solid' : ''}`}
    >
      {day.exam && <span className="absolute inset-[30%] rotate-45 rounded-[1px] bg-offwhite" />}
    </button>
  );
};
