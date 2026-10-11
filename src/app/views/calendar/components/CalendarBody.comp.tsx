import React from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import type { Session } from '@/app/schedule';
import type { CalendarView, PreviewModel, WeekModel } from '../types';
import { WeekGrid } from './WeekGrid.comp';

interface Props {
  view: CalendarView;
  weekKeys: string[];
  todayKey: string;
  now: Date;
  locale: string;
  data: CalendarData;
  week: WeekModel;
  preview: PreviewModel;
  linkedLabels: Record<string, string>;
  activeSessionId: string | null;
  onSelect: (session: Session, element: HTMLElement) => void;
  onUserScroll: () => void;
}

export const CalendarBody: React.FC<Props> = ({
  view,
  weekKeys,
  todayKey,
  now,
  locale,
  data,
  week,
  preview,
  linkedLabels,
  activeSessionId,
  onSelect,
  onUserScroll,
}) => {
  if (view !== 'week') return null;
  return (
    <WeekGrid
      weekKeys={weekKeys}
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
