import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { LOAD_LEVEL_CLASS } from '../constants/loadLevel.const';
import type { YearDay } from '../types';
import { formatHours, formatSessionDate } from '../util';

const TODAY_RING = '0 0 0 1.5px rgba(221,221,240,0.9)';
const CLASH_RING = 'inset 0 0 0 1.5px rgba(240,168,77,0.9)';

interface Props {
  day: YearDay;
  isCurrentWeek: boolean;
  isFocusTarget: boolean;
  locale: string;
  style: React.CSSProperties;
  onOpen: (dateKey: string) => void;
  onFocusDay: (dateKey: string) => void;
}

export const YearDayCell: React.FC<Props> = ({
  day,
  isCurrentWeek,
  isFocusTarget,
  locale,
  style,
  onOpen,
  onFocusDay,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (!day.inYear) return <span aria-hidden="true" style={style} />;
  const label = [
    t('year.cellAria', { date: formatSessionDate(day.dateKey, locale), hours: formatHours(day.minutes, locale) }),
    day.exam ? t('year.exam') : null,
    day.clash ? t('year.clash') : null,
    day.holiday ? t(`holidays.${day.holiday.id}`) : null,
    day.deadlines > 0 ? t('deadlines.yearDots', { count: day.deadlines }) : null,
  ]
    .filter(Boolean)
    .join(', ');
  const rings = [day.isToday ? TODAY_RING : null, day.clash ? CLASH_RING : null].filter(Boolean).join(', ');
  return (
    <button
      type="button"
      data-date-key={day.dateKey}
      tabIndex={isFocusTarget ? 0 : -1}
      title={label}
      aria-label={label}
      onClick={() => onOpen(day.dateKey)}
      onFocus={() => onFocusDay(day.dateKey)}
      style={{ ...style, boxShadow: rings || undefined }}
      className={`relative aspect-square min-w-[10px] cursor-pointer rounded-[4px] transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-lighterGreen motion-reduce:transition-none motion-reduce:hover:scale-100 ${LOAD_LEVEL_CLASS[day.level]} ${day.holiday ? 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_4px)]' : ''} ${isCurrentWeek ? 'outline-1 outline-offset-1 outline-offwhite/25 outline-solid' : ''}`}
    >
      {day.exam && (
        <span className="absolute inset-[30%] rotate-45 rounded-[1px] bg-offwhite shadow-[0_0_0_1.5px_var(--color-background)]" />
      )}
      {day.deadlines > 0 && (
        <span className="absolute top-[2px] right-[2px] size-[3px] rounded-full bg-offwhite shadow-[0_0_0_1px_var(--color-background)]" />
      )}
    </button>
  );
};
