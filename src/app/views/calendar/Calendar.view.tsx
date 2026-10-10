import React, { useMemo, useRef, useState } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { PageHeader } from '@/app/components/ui/PageHeader.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { addDaysToDateKey, HELSINKI_TIME_ZONE, isoWeekNumber, startOfWeekKey, todayKey } from '@/app/schedule';
import { CalendarSidebar } from './components/CalendarSidebar.comp';
import { CalendarState } from './components/CalendarState.comp';
import { CalendarToolbar } from './components/CalendarToolbar.comp';
import { ProvenanceFooter } from './components/ProvenanceFooter.comp';
import { WeekGrid } from './components/WeekGrid.comp';
import { useNow } from './hooks/useNow';
import { findPeriodName, formatWeekRange, sessionsInRange, weekDateKeys } from './util';

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const CalendarView: React.FC = () => {
  const { t, i18n } = useTranslationWithPrefix('views.calendar');
  const locale = i18n.language;
  const [prefs, setPrefs] = useChromeStorage();
  const now = useNow();
  const today = todayKey(now);
  const [anchorKey, setAnchorKey] = useState(today);
  const gridRef = useRef<HTMLDivElement>(null);
  const data = getCalendarData(anchorKey);
  const { studyPeriodMap } = getStudyPeriodMap();

  const weekKeys = useMemo(() => weekDateKeys(anchorKey), [anchorKey]);
  const weekNumber = isoWeekNumber(weekKeys[0]);
  const visibleSessions = useMemo(
    () => (prefs.calendarShowCancelled ? data.sessions : data.sessions.filter((session) => !session.cancelled)),
    [data.sessions, prefs.calendarShowCancelled],
  );
  const weekSessions = useMemo(
    () => sessionsInRange(visibleSessions, weekKeys[0], addDaysToDateKey(weekKeys[6], 1)),
    [visibleSessions, weekKeys],
  );
  const weekSessionIds = useMemo(() => new Set(weekSessions.map((session) => session.id)), [weekSessions]);
  const weekClashes = useMemo(
    () => data.clashes.filter((clash) => clash.sessionIds.some((id) => weekSessionIds.has(id))),
    [data.clashes, weekSessionIds],
  );
  const busyDateKeys = useMemo(() => new Set(data.sessions.map((session) => session.dateKey)), [data.sessions]);
  const sessionsById = useMemo(() => new Map(data.sessions.map((session) => [session.id, session])), [data.sessions]);
  const periodName = useMemo(
    () => findPeriodName(anchorKey, [...studyPeriodMap.values()]),
    [anchorKey, studyPeriodMap],
  );

  const goToWeek = (delta: number) => setAnchorKey(addDaysToDateKey(startOfWeekKey(anchorKey), delta * 7));

  // The app renders inside a shadow root, so document.querySelector cannot reach session blocks.
  const showFirstClash = () => {
    const sessionId = weekClashes[0]?.sessionIds.find((id) => weekSessionIds.has(id));
    const element = sessionId
      ? gridRef.current?.querySelector<HTMLElement>(`[data-session-id="${CSS.escape(sessionId)}"]`)
      : null;
    element?.scrollIntoView({ block: 'nearest' });
    element?.focus();
  };

  const status = data.isLoading ? 'loading' : data.error ? 'error' : data.courses.length === 0 ? 'emptyTerm' : null;

  return (
    <div className="-mx-6 -mt-6 flex h-[calc(100dvh-3rem)] flex-col gap-4 overflow-hidden px-6 pt-6 pb-6">
      <PageHeader
        title={t('title')}
        subtitle={periodName ?? t('weekLabel', { week: weekNumber })}
        aside={
          browserTimeZone !== HELSINKI_TIME_ZONE ? (
            <span className="font-mono text-[11px] text-lightGrey">{t('timeZoneNote')}</span>
          ) : undefined
        }
      />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[244px_minmax(0,1fr)]">
        <CalendarSidebar
          anchorKey={anchorKey}
          todayKey={today}
          busyDateKeys={busyDateKeys}
          locale={locale}
          courses={data.courses}
          courseUnits={data.courseUnits}
          showCancelled={prefs.calendarShowCancelled}
          onSelectDate={setAnchorKey}
          onShowCancelledChange={(value) => setPrefs({ calendarShowCancelled: value })}
        />
        <Panel
          footer={<ProvenanceFooter updatedAt={data.updatedAt} isFetching={data.isFetching} onRefresh={data.refetch} />}
        >
          <CalendarToolbar
            rangeLabel={formatWeekRange(weekKeys[0], weekKeys[6], locale)}
            weekNumber={weekNumber}
            clashCount={weekClashes.length}
            onToday={() => setAnchorKey(today)}
            onPrevious={() => goToWeek(-1)}
            onNext={() => goToWeek(1)}
            onShowClash={showFirstClash}
          />
          {status ? (
            <CalendarState status={status} onRetry={data.refetch} />
          ) : (
            <div ref={gridRef} className="flex min-h-0 flex-1 flex-col">
              <WeekGrid
                weekKeys={weekKeys}
                todayKey={today}
                now={now}
                sessions={weekSessions}
                sessionsById={sessionsById}
                clashesBySession={data.clashesBySession}
                rooms={data.rooms}
                activeSessionId={null}
                locale={locale}
                onSelect={(_session, element) => element.focus()}
                onScroll={() => undefined}
              />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default CalendarView;
