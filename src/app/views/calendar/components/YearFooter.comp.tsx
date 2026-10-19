import React from 'react';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { addDaysToDateKey, type DateRange, type Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { HeavyWeek } from '../types';
import { formatClock, formatHours, formatSessionDate, formatWeekRange } from '../util';
import { TermCard } from './TermCard.comp';

const ROW = 'grid grid-cols-[62px_8px_minmax(0,1fr)_auto] items-center gap-2 py-1 text-[12.5px] text-offwhite';

interface Props {
  exams: Session[];
  heaviest: HeavyWeek[];
  emptyTerm: DateRange | null;
  locale: string;
}

export const YearFooter: React.FC<Props> = ({ exams, heaviest, emptyTerm, locale }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div
      className={`grid flex-1 content-start border-t border-border md:content-stretch ${emptyTerm ? 'md:grid-cols-[1fr_1fr_1.2fr]' : 'md:grid-cols-2'}`}
    >
      <div className="px-[18px] py-3">
        <PanelEyebrow>{t('year.exams')}</PanelEyebrow>
        {exams.length === 0 ? (
          <p className="mt-1.5 text-[12.5px] text-lightGrey">{t('year.noExams')}</p>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className={ROW}>
              <span className="font-mono text-[11px] text-lightGrey">{formatSessionDate(exam.dateKey, locale)}</span>
              <span
                aria-hidden="true"
                className="size-[7px] rounded-full"
                style={{ backgroundColor: getModuleColorValueByIndex(exam.colorIndex) }}
              />
              <span className="truncate">{exam.courseName}</span>
              <span className="font-mono text-[11px] text-lightGrey">{formatClock(exam.start)}</span>
            </div>
          ))
        )}
      </div>
      <div className="border-border px-[18px] py-3 md:border-l">
        <PanelEyebrow>{t('year.heaviest')}</PanelEyebrow>
        {heaviest.map((week) => (
          <div key={week.weekKey} className={ROW}>
            <span className="font-mono text-[11px] text-lightGrey">
              {t('year.weekRange', { week: week.weekNumber })}
            </span>
            <span aria-hidden="true" className="size-[7px] rounded-full bg-offwhite/60" />
            <span className="truncate">{formatWeekRange(week.weekKey, addDaysToDateKey(week.weekKey, 6), locale)}</span>
            <span className="font-mono text-[11px] text-lightGrey">
              {t('year.hours', { hours: formatHours(week.minutes, locale) })}
            </span>
          </div>
        ))}
      </div>
      {emptyTerm && <TermCard term={emptyTerm} />}
    </div>
  );
};
