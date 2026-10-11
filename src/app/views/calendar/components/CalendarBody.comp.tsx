import React from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Session } from '@/app/schedule';
import type { CalendarView, PreviewModel, WeekModel } from '../types';
import { monthStartKey } from '../util';
import { MonthView } from './MonthView.comp';
import { WeekGrid } from './WeekGrid.comp';

interface Props {
  view: CalendarView;
  anchorKey: string;
  weekKeys: string[];
  todayKey: string;
  now: Date;
  locale: string;
  data: CalendarData;
  week: WeekModel;
  preview: PreviewModel;
  linkedLabels: Record<string, string>;
  activeSessionId: string | null;
  periods: StudyPeriodInfo[];
  showCancelled: boolean;
  onOpenDay: (dateKey: string) => void;
  onOpenWeek: (dateKey: string) => void;
  onSelect: (session: Session, element: HTMLElement) => void;
  onUserScroll: () => void;
}

export const CalendarBody: React.FC<Props> = ({
  view,
  anchorKey,
  weekKeys,
  todayKey,
  now,
  locale,
  data,
  week,
  preview,
  linkedLabels,
  activeSessionId,
  periods,
  showCancelled,
  onOpenDay,
  onOpenWeek,
  onSelect,
  onUserScroll,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (view === 'month') {
    return (
      <MonthView
        data={data}
        sessionsById={week.sessionsById}
        monthKey={monthStartKey(anchorKey)}
        todayKey={todayKey}
        periods={periods}
        showCancelled={showCancelled}
        locale={locale}
        onOpenDay={onOpenDay}
        onOpenWeek={onOpenWeek}
      />
    );
  }
  if (view !== 'week' && view !== 'day') return null;
  const isDay = view === 'day';
  return (
    <WeekGrid
      dayKeys={isDay ? [anchorKey] : weekKeys}
      collapseWeekend={!isDay}
      detailed={isDay}
      emptyLabel={isDay ? t('states.emptyDay') : t('states.emptyWeek')}
      todayKey={todayKey}
      now={now}
      sessions={week.weekSessions}
      alternatives={week.weekAlternatives}
      preview={preview.sessions}
      previewClashIds={preview.clashIds}
      sessionsById={week.sessionsById}
      clashesBySession={data.clashesBySession}
      badges={week.badges}
      rooms={data.rooms}
      courseUnits={data.courseUnits}
      linkedLabels={linkedLabels}
      activeSessionId={activeSessionId}
      locale={locale}
      onSelect={onSelect}
      onUserScroll={onUserScroll}
    />
  );
};
