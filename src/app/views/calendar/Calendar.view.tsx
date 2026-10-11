import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import { useCalendarVisibility } from '@/app/api/dataPoints/calendar/useCalendarVisibility';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { notify } from '@/app/components/ui/notify';
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
import { GroupPicker } from './components/GroupPicker.comp';
import { ProvenanceFooter } from './components/ProvenanceFooter.comp';
import { SessionsInspector } from './components/SessionsInspector.comp';
import { WeekGrid } from './components/WeekGrid.comp';
import { useCalendarActions } from './hooks/useCalendarActions';
import { useCalendarKeyboard } from './hooks/useCalendarKeyboard';
import { useNow } from './hooks/useNow';
import { useWeekModel } from './hooks/useWeekModel';
import type { InspectorState, PopoverTarget } from './types';
import { findPeriodName, formatWeekRange, previewModel, promptId, seriesOf, weekDateKeys } from './util';

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const NO_COURSE_KEYS: string[] = [];

const CalendarView: React.FC = () => {
  const { t, i18n } = useTranslationWithPrefix('views.calendar');
  const locale = i18n.language;
  const [prefs, setPrefs] = useChromeStorage();
  const now = useNow();
  const today = todayKey(now);
  const [anchorKey, setAnchorKey] = useState(today);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const [inspector, setInspector] = useState<InspectorState | null>(null);
  const [previewGroupId, setPreviewGroupId] = useState<string | null>(null);
  const inspectorSeriesKey = inspector?.type === 'sessions' ? inspector.seriesKey : null;
  const pickerCourseKey = inspector?.type === 'groups' ? inspector.courseKey : null;
  const candidateCourseKeys = useMemo(() => (pickerCourseKey ? [pickerCourseKey] : NO_COURSE_KEYS), [pickerCourseKey]);
  const gridRef = useRef<HTMLDivElement>(null);
  const onPlanWriteError = useCallback(() => notify.error(t('plan.saveFailed')), [t]);
  const data = getCalendarData(anchorKey, { candidateCourseKeys, onPlanWriteError });
  const onVisibilityError = useCallback(() => notify.error(t('visibility.failed')), [t]);
  const visibility = useCalendarVisibility(onVisibilityError);
  const actions = useCalendarActions(data.updatePlan, visibility.mutate);
  const { studyPeriodMap } = getStudyPeriodMap();

  const weekKeys = useMemo(() => weekDateKeys(anchorKey), [anchorKey]);
  const preview = useMemo(
    () =>
      previewModel(
        data.candidates,
        data.attended,
        data.groups,
        pickerCourseKey ? previewGroupId : null,
        weekKeys[0],
        addDaysToDateKey(weekKeys[6], 1),
      ),
    [data.candidates, data.attended, data.groups, pickerCourseKey, previewGroupId, weekKeys],
  );
  const pickerCourse = pickerCourseKey
    ? data.courses.find((course) => course.realisationId === pickerCourseKey)
    : undefined;
  const weekNumber = isoWeekNumber(weekKeys[0]);
  const { weekSessions, weekAlternatives, weekClashes, weekSessionIds, badges, knownSessions, sessionsById } =
    useWeekModel(data, weekKeys, prefs.calendarShowCancelled);
  const busyDateKeys = useMemo(() => new Set(data.attended.map((session) => session.dateKey)), [data.attended]);
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
    () => (popoverSeriesKey ? seriesOf(popoverSeriesKey, knownSessions) : []),
    [popoverSeriesKey, knownSessions],
  );
  const popoverSummary = useMemo(
    () => (popoverSeriesKey ? summarizeSeriesClashes(popoverSeriesKey, data.attended, data.clashesBySession) : null),
    [popoverSeriesKey, data.attended, data.clashesBySession],
  );
  const inspectorSeries = useMemo(
    () => (inspectorSeriesKey ? seriesOf(inspectorSeriesKey, knownSessions) : []),
    [inspectorSeriesKey, knownSessions],
  );

  const closePopover = useCallback(() => setPopover(null), []);
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
    else setInspector(null);
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
    element.scrollIntoView({ block: 'nearest' });
    setPopover({ session, element });
  };

  const showAllSessions = useCallback((seriesKey: string) => {
    setInspector({ type: 'sessions', seriesKey });
    setPopover(null);
  }, []);
  const openGroups = useCallback((courseKey: string, setId: string | null) => {
    setPopover(null);
    setInspector({ type: 'groups', courseKey, setId });
  }, []);
  const closeInspector = useCallback(() => {
    setInspector(null);
    setPreviewGroupId(null);
  }, []);

  const status = data.isLoading ? 'loading' : data.error ? 'error' : data.courses.length === 0 ? 'emptyTerm' : null;
  const inspectorOpen = inspectorSeries.length > 0 || pickerCourse != null;

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
          plans={data.plans}
          showCancelled={prefs.calendarShowCancelled}
          onSelectDate={setAnchorKey}
          onShowCancelledChange={(value) => setPrefs({ calendarShowCancelled: value })}
          onToggleCourse={actions.setCourseVisible}
          onOpenGroups={openGroups}
          onDismissPrompt={(courseKey, setId) => actions.dismiss(courseKey, promptId(setId))}
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
                alternatives={weekAlternatives}
                preview={preview.sessions}
                previewClashIds={preview.clashIds}
                sessionsById={sessionsById}
                clashesBySession={data.clashesBySession}
                badges={badges}
                rooms={data.rooms}
                courseUnits={data.courseUnits}
                activeSessionId={popover?.session.id ?? null}
                locale={locale}
                onSelect={selectSession}
                onUserScroll={closePopover}
              />
            </div>
          )}
        </Panel>
        {inspectorSeries.length > 0 && (
          <SessionsInspector
            series={inspectorSeries}
            clashesBySession={data.clashesBySession}
            badges={badges}
            rooms={data.rooms}
            now={now}
            locale={locale}
            onClose={closeInspector}
          />
        )}
        {pickerCourse && inspector?.type === 'groups' && (
          <GroupPicker
            course={pickerCourse}
            focusSetId={inspector.setId}
            candidates={data.candidates}
            attended={data.attended}
            plan={data.plans[pickerCourse.realisationId]}
            rooms={data.rooms}
            isLoading={data.candidatesLoading}
            isFailed={data.candidatesFailed}
            locale={locale}
            actions={actions}
            onPreview={setPreviewGroupId}
            onClose={closeInspector}
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
