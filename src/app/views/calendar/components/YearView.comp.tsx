import React, { useMemo } from 'react';
import type { CalendarData, CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { holidaysInRange, noTeachingWeeks } from '@/app/schedule';
import {
  emptyFutureTerm,
  heaviestWeeks,
  monthBands,
  noTeachingBands,
  periodBands,
  upcomingExams,
  yearWeeks,
} from '../util';
import { YearFooter } from './YearFooter.comp';
import { YearGrid } from './YearGrid.comp';
import { YearLegend } from './YearLegend.comp';

const HEAVIEST_COUNT = 5;

interface Props {
  data: CalendarData;
  deadlines: CalendarDeadline[];
  todayKey: string;
  periods: StudyPeriodInfo[];
  locale: string;
  onOpenWeek: (dateKey: string) => void;
}

export const YearView: React.FC<Props> = ({ data, deadlines, todayKey, periods, locale, onOpenWeek }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const noTeachingLabel = t('year.noTeaching');
  const model = useMemo(() => {
    const weeks = yearWeeks({
      range: data.range,
      todayKey,
      attended: data.attended,
      clashes: data.clashes,
      holidays: holidaysInRange(data.range),
      deadlines,
    });
    return {
      weeks,
      months: monthBands(weeks, locale),
      periods: periodBands(weeks, periods),
      gaps: noTeachingBands(weeks, noTeachingWeeks(data.attended, periods, data.range), noTeachingLabel),
      exams: upcomingExams(data.attended, todayKey, data.range),
      heaviest: heaviestWeeks(weeks, HEAVIEST_COUNT),
      emptyTerm: emptyFutureTerm(data.range, data.attended, todayKey),
    };
  }, [data.range, data.attended, data.clashes, deadlines, periods, todayKey, locale, noTeachingLabel]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <YearGrid
        weeks={model.weeks}
        months={model.months}
        periods={model.periods}
        gaps={model.gaps}
        locale={locale}
        onOpenWeek={onOpenWeek}
      />
      <YearLegend showDeadlines={deadlines.length > 0} />
      <YearFooter exams={model.exams} heaviest={model.heaviest} emptyTerm={model.emptyTerm} locale={locale} />
    </div>
  );
};
