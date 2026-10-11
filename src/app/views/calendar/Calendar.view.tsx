import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { PageHeader } from '@/app/components/ui/PageHeader.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  addDaysToDateKey,
  HELSINKI_TIME_ZONE,
  isoWeekNumber,
  seriesKeyOf,
  startOfWeekKey,
  summarizeSeriesClashes,
  todayKey,
  type Session,
} from '@/app/schedule';
import { CalendarSidebar } from './components/CalendarSidebar.comp';
import { CalendarState } from './components/CalendarState.comp';
import { CalendarToolbar } from './components/CalendarToolbar.comp';
import { EventPopover } from './components/EventPopover.comp';
import { ProvenanceFooter } from './components/ProvenanceFooter.comp';
import { SessionsInspector } from './components/SessionsInspector.comp';
import { WeekGrid } from './components/WeekGrid.comp';
import { useCalendarKeyboard } from './hooks/useCalendarKeyboard';
import { useNow } from './hooks/useNow';
import type { PopoverTarget } from './types';
import { findPeriodName, formatWeekRange, seriesOf, sessionsInRange, weekDateKeys } from './util';

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const PROGRAMMATIC_SCROLL_MS = 500;

const CalendarView: React.FC = () => {
  const { t, i18n } = useTranslationWithPrefix('views.calendar');
  const locale = i18n.language;
  const [prefs, setPrefs] = useChromeStorage();
  const now = useNow();
  const today = todayKey(now);
  const [anchorKey, setAnchorKey] = useState(today);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const [inspectorSeriesKey, setInspectorSeriesKey] = useState<string | null>(null);
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
  const coursesByKey = useMemo(
    () => new Map(data.courses.map((course) => [course.realisationId, course])),
    [data.courses],
  );
  const popoverSeriesKey = popover ? seriesKeyOf(popover.session) : null;
  const popoverSeries = useMemo(
    () => (popoverSeriesKey ? seriesOf(popoverSeriesKey, data.sessions) : []),
    [popoverSeriesKey, data.sessions],
  );
  const popoverSummary = useMemo(
    () => (popoverSeriesKey ? summarizeSeriesClashes(popoverSeriesKey, data.sessions, data.clashesBySession) : null),
    [popoverSeriesKey, data.sessions, data.clashesBySession],
  );
  const inspectorSeries = useMemo(
    () => (inspectorSeriesKey ? seriesOf(inspectorSeriesKey, data.sessions) : []),
    [inspectorSeriesKey, data.sessions],
  );

  const closePopover = useCallback(() => setPopover(null), []);
  const ignoreScrollUntil = useRef(0);
  // Scroll events fire a frame after scrollIntoView, so our own scrolling must not close the popover it opens.
  const closePopoverOnUserScroll = useCallback(() => {
    if (Date.now() >= ignoreScrollUntil.current) setPopover(null);
  }, []);
  const goToWeek = useCallback((delta: number) => {
    setPopover(null);
    setAnchorKey((current) => addDaysToDateKey(startOfWeekKey(current), delta * 7));
  }, []);
  const goToPreviousWeek = useCallback(() => goToWeek(-1), [goToWeek]);
  const goToNextWeek = useCallback(() => goToWeek(1), [goToWeek]);
  const goToToday = useCallback(() => {
    setPopover(null);
    setAnchorKey(today);
  }, [today]);
  const closeOverlays = useCallback(() => {
    if (popover) setPopover(null);
    else setInspectorSeriesKey(null);
  }, [popover]);

  useCalendarKeyboard({
    onPrevious: goToPreviousWeek,
    onNext: goToNextWeek,
    onToday: goToToday,
    onEscape: closeOverlays,
  });

  const selectSession = useCallback((session: Session, element: HTMLElement) => setPopover({ session, element }), []);

  // The app renders inside a shadow root, so document.querySelector cannot reach session blocks.
  const showFirstClash = () => {
    const sessionId = weekClashes[0]?.sessionIds.find((id) => weekSessionIds.has(id));
    const session = sessionId ? sessionsById.get(sessionId) : undefined;
    const element = sessionId
      ? gridRef.current?.querySelector<HTMLElement>(`[data-session-id="${CSS.escape(sessionId)}"]`)
      : null;
    if (!session || !element) return;
    ignoreScrollUntil.current = Date.now() + PROGRAMMATIC_SCROLL_MS;
    element.scrollIntoView({ block: 'nearest' });
    setPopover({ session, element });
  };

  const showAllSessions = (seriesKey: string) => {
    setInspectorSeriesKey(seriesKey);
    setPopover(null);
  };

  const status = data.isLoading ? 'loading' : data.error ? 'error' : data.courses.length === 0 ? 'emptyTerm' : null;
  const inspectorOpen = inspectorSeries.length > 0;

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
      <div
        className={`grid min-h-0 flex-1 gap-4 ${
          inspectorOpen ? 'lg:grid-cols-[244px_minmax(0,1fr)_316px]' : 'lg:grid-cols-[244px_minmax(0,1fr)]'
        }`}
      >
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
            onToday={goToToday}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
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
                courseUnits={data.courseUnits}
                activeSessionId={popover?.session.id ?? null}
                locale={locale}
                onSelect={selectSession}
                onScroll={closePopoverOnUserScroll}
              />
            </div>
          )}
        </Panel>
        {inspectorOpen && (
          <SessionsInspector
            series={inspectorSeries}
            clashesBySession={data.clashesBySession}
            rooms={data.rooms}
            now={now}
            locale={locale}
            onClose={() => setInspectorSeriesKey(null)}
          />
        )}
      </div>
      {popover && popoverSeriesKey && popoverSummary && (
        <EventPopover
          target={popover}
          seriesKey={popoverSeriesKey}
          series={popoverSeries}
          summary={popoverSummary}
          rooms={data.rooms}
          course={coursesByKey.get(popover.session.courseKey)}
          courseUnit={popover.session.courseUnitId ? data.courseUnits[popover.session.courseUnitId] : undefined}
          locale={locale}
          onClose={closePopover}
          onShowAllSessions={showAllSessions}
        />
      )}
    </div>
  );
};

export default CalendarView;
