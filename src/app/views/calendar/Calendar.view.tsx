import React, { useCallback, useMemo, useRef, useState } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import type { NoteChange } from '@/app/api/dataPoints/calendar/types';
import { useCalendarNotes } from '@/app/api/dataPoints/calendar/useCalendarNotes';
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
  helsinkiDateKey,
  isoWeekNumber,
  seriesKeyOf,
  summarizeSeriesClashes,
  todayKey,
  type NoteOccurrence,
  type Session,
} from '@/app/schedule';
import { CalendarBody } from './components/CalendarBody.comp';
import { CalendarInspector } from './components/CalendarInspector.comp';
import { CalendarOverlays } from './components/CalendarOverlays.comp';
import { CalendarSidebar } from './components/CalendarSidebar.comp';
import { CalendarState } from './components/CalendarState.comp';
import { CalendarToolbar } from './components/CalendarToolbar.comp';
import { EventPopover } from './components/EventPopover.comp';
import { ProvenanceFooter } from './components/ProvenanceFooter.comp';
import { useCalendarActions } from './hooks/useCalendarActions';
import { useCalendarKeyboard } from './hooks/useCalendarKeyboard';
import { useCalendarLayers } from './hooks/useCalendarLayers';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { useNoteController } from './hooks/useNoteController';
import { useNow } from './hooks/useNow';
import { usePopoverModel } from './hooks/usePopoverModel';
import { useWeekModel } from './hooks/useWeekModel';
import type { CalendarView as CalendarViewMode, InspectorState, PopoverTarget, TimetableControls } from './types';
import {
  CALENDAR_VIEWS,
  clashesInRange,
  findPeriodName,
  parseCalendarView,
  previewModel,
  promptId,
  seriesOf,
  viewChange,
  viewTitle,
  visibleRange,
  weekDateKeys,
} from './util';

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const NO_COURSE_KEYS: string[] = [];

const CalendarView: React.FC = () => {
  const { t, i18n } = useTranslationWithPrefix('views.calendar');
  const locale = i18n.language;
  const [prefs, setPrefs] = useChromeStorage();
  const now = useNow();
  const today = todayKey(now);
  const [popover, setPopover] = useState<PopoverTarget | null>(null);
  const closePopover = useCallback(() => setPopover(null), []);
  const view = parseCalendarView(prefs.calendarView);
  const { anchorKey, setAnchorKey, goToPrevious, goToNext, goToToday } = useCalendarNavigation(
    view,
    today,
    closePopover,
  );
  const setView = useCallback(
    (next: CalendarViewMode) => {
      const change = viewChange(view, next);
      if (!change) return;
      setPopover(null);
      setPrefs({ calendarView: change });
    },
    [view, setPrefs],
  );
  const openWeek = useCallback(
    (dateKey: string) => {
      setAnchorKey(dateKey);
      setView('week');
    },
    [setAnchorKey, setView],
  );
  const openDay = useCallback(
    (dateKey: string) => {
      setAnchorKey(dateKey);
      setView('day');
    },
    [setAnchorKey, setView],
  );
  const [inspector, setInspector] = useState<InspectorState | null>(null);
  const [previewGroupId, setPreviewGroupId] = useState<string | null>(null);
  const inspectorSeriesKey = inspector?.type === 'sessions' ? inspector.seriesKey : null;
  const pickerCourseKey = inspector?.type === 'groups' ? inspector.courseKey : null;
  const candidateCourseKeys = useMemo(() => (pickerCourseKey ? [pickerCourseKey] : NO_COURSE_KEYS), [pickerCourseKey]);
  const gridRef = useRef<HTMLDivElement>(null);
  const onPlanWriteError = useCallback(() => notify.error(t('plan.saveFailed')), [t]);
  const data = getCalendarData(anchorKey, {
    candidateCourseKeys,
    onPlanWriteError,
    span: view === 'year' ? 'academicYear' : 'term',
  });
  const notesData = useCalendarNotes(data.range);
  const onNoteFailed = useCallback((change: NoteChange) => notify.error(t(`notes.failed.${change.type}`)), [t]);
  const notes = useNoteController(notesData.events, data.range, onNoteFailed);
  const { layers, shownNotes } = useCalendarLayers({ prefs, setPrefs, notes: notesData });
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
  const weekModel = useWeekModel(data, weekKeys, prefs.calendarShowCancelled);
  const { weekClashes, weekSessionIds, badges, knownSessions, sessionsById } = weekModel;
  const range = visibleRange(view, anchorKey);
  const rangeClashes = view === 'week' ? weekClashes : clashesInRange(data.clashes, sessionsById, range);
  const eyebrow =
    view === 'month' ? null : view === 'year' ? t('toolbar.academicYear') : t('weekShort', { week: weekNumber });
  const busyDateKeys = useMemo(() => new Set(data.attended.map((session) => session.dateKey)), [data.attended]);
  const periods = useMemo(() => [...studyPeriodMap.values()], [studyPeriodMap]);
  const periodName = useMemo(() => findPeriodName(anchorKey, periods), [anchorKey, periods]);
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

  const closeOverlays = useCallback(() => {
    if (notes.hasOverlay) notes.closeOverlay();
    else if (popover) setPopover(null);
    else setInspector(null);
  }, [notes, popover]);

  useCalendarKeyboard({
    onPrevious: goToPrevious,
    onNext: goToNext,
    onToday: goToToday,
    onEscape: closeOverlays,
    onView: setView,
  });

  const { closePopover: closeNotePopover, openNote } = notes;
  const selectSession = useCallback(
    (session: Session, element: HTMLElement) => {
      closeNotePopover();
      setPopover({ session, element });
    },
    [closeNotePopover],
  );
  const selectNote = useCallback(
    (note: NoteOccurrence, element: HTMLElement) => {
      setPopover(null);
      openNote(note, element);
    },
    [openNote],
  );
  const closeTransient = useCallback(() => {
    setPopover(null);
    closeNotePopover();
  }, [closeNotePopover]);

  // The app renders inside a shadow root, so document.querySelector cannot reach session blocks.
  const showFirstClash = () => {
    const first = rangeClashes[0];
    if (!first) return;
    if (view === 'month' || view === 'year') {
      openWeek(helsinkiDateKey(first.start));
      return;
    }
    const sessionId = first.sessionIds.find((id) => weekSessionIds.has(id));
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
  const openTimetable = useCallback((courseKey: string) => {
    setPopover(null);
    setInspector({ type: 'timetable', courseKey });
  }, []);
  const timetableCourse =
    inspector?.type === 'timetable'
      ? data.courses.find((course) => course.realisationId === inspector.courseKey)
      : undefined;
  const linkedLabels = useMemo(
    () => Object.fromEntries(Object.entries(data.linked).map(([courseKey, state]) => [courseKey, state.label])),
    [data.linked],
  );
  const sisuCourseKeys = useMemo(
    () => new Set(data.sessions.filter((session) => session.source === 'sisu').map((session) => session.courseKey)),
    [data.sessions],
  );
  const timetables = useMemo<TimetableControls>(
    () => ({
      noTimesCourseKeys: data.noTimesCourseKeys,
      sisuCourseKeys,
      linked: data.linked,
      onAdd: openTimetable,
      onRefresh: data.refreshTimetable,
      onRemove: data.removeTimetable,
    }),
    [data.noTimesCourseKeys, sisuCourseKeys, data.linked, openTimetable, data.refreshTimetable, data.removeTimetable],
  );
  const popoverView = useMemo(
    () => ({ showAllSessions, openGroups, close: closePopover }),
    [showAllSessions, openGroups, closePopover],
  );
  const popoverModel = usePopoverModel(popover?.session ?? null, data, badges, sessionsById, actions, popoverView);

  const status = data.isLoading ? 'loading' : data.error ? 'error' : data.courses.length === 0 ? 'emptyTerm' : null;
  const explicitInspector = inspectorSeries.length > 0 || pickerCourse != null || timetableCourse != null;
  const showAgenda = view === 'day' && !explicitInspector;
  const inspectorOpen = explicitInspector || showAgenda;

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
          timetables={timetables}
          layers={layers}
          onSelectDate={setAnchorKey}
          onToggleCourse={actions.setCourseVisible}
          onOpenGroups={openGroups}
          onDismissPrompt={(courseKey, setId) => actions.dismiss(courseKey, promptId(setId))}
        />
        <Panel
          footer={
            <ProvenanceFooter
              updatedAt={data.updatedAt}
              isFetching={data.isFetching}
              linkedCount={Object.keys(data.linked).length}
              onRefresh={data.refetch}
            />
          }
        >
          <CalendarToolbar
            view={view}
            enabledViews={CALENDAR_VIEWS}
            title={viewTitle(view, anchorKey, locale)}
            eyebrow={eyebrow}
            clashCount={rangeClashes.length}
            onViewChange={setView}
            onToday={goToToday}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onShowClash={showFirstClash}
          />
          {status ? (
            <CalendarState status={status} onRetry={data.refetch} />
          ) : (
            <div ref={gridRef} className="flex min-h-0 flex-1 flex-col">
              <CalendarBody
                view={view}
                anchorKey={anchorKey}
                weekKeys={weekKeys}
                todayKey={today}
                now={now}
                locale={locale}
                data={data}
                week={weekModel}
                preview={preview}
                linkedLabels={linkedLabels}
                activeSessionId={popover?.session.id ?? null}
                periods={periods}
                showCancelled={prefs.calendarShowCancelled}
                notes={shownNotes}
                onOpenDay={openDay}
                onOpenWeek={openWeek}
                onSelect={selectSession}
                onSelectNote={selectNote}
                onUserScroll={closeTransient}
              />
            </div>
          )}
        </Panel>
        <CalendarInspector
          inspector={inspector}
          inspectorSeries={inspectorSeries}
          pickerCourse={pickerCourse}
          timetableCourse={timetableCourse}
          showAgenda={showAgenda}
          data={data}
          badges={badges}
          sessionsById={sessionsById}
          actions={actions}
          anchorKey={anchorKey}
          todayKey={today}
          now={now}
          locale={locale}
          onPreview={setPreviewGroupId}
          onClose={closeInspector}
        />
      </div>
      {popover && popoverSeriesKey && popoverSummary && popoverModel && (
        <EventPopover
          target={popover}
          series={popoverSeries}
          summary={popoverSummary}
          rooms={data.rooms}
          course={coursesByKey.get(popover.session.courseKey)}
          courseUnit={popover.session.courseUnitId ? data.courseUnits[popover.session.courseUnitId] : undefined}
          locale={locale}
          model={popoverModel}
          linkedState={popover.session.source === 'linked' ? data.linked[popover.session.courseKey] : undefined}
          onClose={closePopover}
        />
      )}
      <CalendarOverlays notes={notes} locale={locale} />
    </div>
  );
};

export default CalendarView;
