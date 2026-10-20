import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCalendarData } from '@/app/api/dataPoints/calendar/getCalendarData';
import type { NoteChange } from '@/app/api/dataPoints/calendar/types';
import { useCalendarDeadlines } from '@/app/api/dataPoints/calendar/useCalendarDeadlines';
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
} from '@/app/schedule';
import { CalendarBody } from './components/CalendarBody.comp';
import { CalendarHeaderActions } from './components/CalendarHeaderActions.comp';
import { CalendarInspector } from './components/CalendarInspector.comp';
import { CalendarOverlays } from './components/CalendarOverlays.comp';
import { CalendarSidebar } from './components/CalendarSidebar.comp';
import { CalendarState } from './components/CalendarState.comp';
import { CalendarToolbar } from './components/CalendarToolbar.comp';
import { EventPopover } from './components/EventPopover.comp';
import { InspectorSlot } from '@/app/components/ui/InspectorSlot.comp';
import { ProvenanceFooter } from './components/ProvenanceFooter.comp';
import { useCalendarActions } from './hooks/useCalendarActions';
import { useClassReminderSync } from './hooks/useClassReminderSync';
import { useCalendarKeyboard } from './hooks/useCalendarKeyboard';
import { useCalendarLayers } from './hooks/useCalendarLayers';
import { useCalendarSelection } from './hooks/useCalendarSelection';
import { useCalendarViewState } from './hooks/useCalendarViewState';
import { useNewNote } from './hooks/useNewNote';
import { useNoteController } from './hooks/useNoteController';
import { useNow } from './hooks/useNow';
import { useTimetableControls } from './hooks/useTimetableControls';
import { usePopoverModel } from './hooks/usePopoverModel';
import { useWeekModel } from './hooks/useWeekModel';
import type { InspectorState, PopoverTarget } from './types';
import {
  clashesInRange,
  findPeriodName,
  previewModel,
  promptId,
  seriesOf,
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
  const closeTransientRef = useRef<() => void>(closePopover);
  const onNavigate = useCallback(() => closeTransientRef.current(), []);
  const { view, anchorKey, setAnchorKey, goToPrevious, goToNext, goToToday, setView, openWeek, openDay } =
    useCalendarViewState(prefs, setPrefs, today, onNavigate);
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
  useClassReminderSync(data, now);
  const notesData = useCalendarNotes(data.range);
  const onNoteFailed = useCallback((change: NoteChange) => notify.error(t(`notes.failed.${change.type}`)), [t]);
  const onNoteCreated = useCallback(() => {
    if (!prefs.calendarShowNotes) setPrefs({ calendarShowNotes: true });
  }, [prefs.calendarShowNotes, setPrefs]);
  const notes = useNoteController(notesData.events, data.range, onNoteFailed, onNoteCreated);
  const deadlinesData = useCalendarDeadlines(data.courses, data.courseUnits, data.range);
  const { layers, shownNotes, shownDeadlines } = useCalendarLayers({
    prefs,
    setPrefs,
    notes: notesData,
    deadlines: deadlinesData,
  });
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
  const range = useMemo(() => visibleRange(view, anchorKey), [view, anchorKey]);
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

  const { selectSession, selectNote, selectDeadline, draftNote, closeTransient, deadline, closeDeadline } =
    useCalendarSelection({ notes, setPopover });
  useEffect(() => {
    closeTransientRef.current = closeTransient;
  }, [closeTransient]);
  const closeOverlays = useCallback(() => {
    if (deadline) closeDeadline();
    else if (popover) setPopover(null);
    else if (notes.popover) notes.closePopover();
    else if (notes.editor) notes.cancel();
    else setInspector(null);
  }, [deadline, closeDeadline, notes, popover]);

  const { addNoteRef, openNewNote, newNoteFromKeyboard } = useNewNote({
    attended: data.attended,
    notes: notesData.notes,
    openNew: notes.openNew,
    range,
    todayKey: today,
    now,
  });

  useCalendarKeyboard({
    editing: notes.editor != null,
    onPrevious: goToPrevious,
    onNext: goToNext,
    onToday: goToToday,
    onEscape: closeOverlays,
    onView: setView,
    onNewNote: newNoteFromKeyboard,
  });

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
  const openExport = useCallback(() => {
    setPopover(null);
    setInspector({ type: 'export' });
  }, []);
  const timetableCourse =
    inspector?.type === 'timetable'
      ? data.courses.find((course) => course.realisationId === inspector.courseKey)
      : undefined;
  const { linkedLabels, timetables } = useTimetableControls(data, openTimetable);
  const popoverView = useMemo(
    () => ({ showAllSessions, openGroups, close: closePopover }),
    [showAllSessions, openGroups, closePopover],
  );
  const popoverModel = usePopoverModel(popover?.session ?? null, data, badges, sessionsById, actions, popoverView);

  const status = data.isLoading ? 'loading' : data.error ? 'error' : data.courses.length === 0 ? 'emptyTerm' : null;
  const explicitInspector =
    inspectorSeries.length > 0 || pickerCourse != null || timetableCourse != null || inspector?.type === 'export';
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
        actions={
          <CalendarHeaderActions
            view={view}
            addNoteRef={addNoteRef}
            onViewChange={setView}
            onAddNote={openNewNote}
            onExport={openExport}
          />
        }
      />
      <div
        className="grid min-h-0 flex-1 gap-4 motion-reduce:transition-none lg:grid-cols-[280px_minmax(0,1fr)_var(--inspector-width)] lg:gap-x-0 lg:transition-[grid-template-columns] lg:duration-200 lg:ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ '--inspector-width': inspectorOpen ? '332px' : '0px' } as React.CSSProperties}
      >
        <CalendarSidebar
          anchorKey={anchorKey}
          todayKey={today}
          busyDateKeys={busyDateKeys}
          locale={locale}
          courses={data.courses}
          coursesLoading={data.isLoading}
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
            title={viewTitle(view, anchorKey, locale)}
            eyebrow={eyebrow}
            clashCount={rangeClashes.length}
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
                draft={notes.draftSlot}
                draftTitle={notes.editor?.draft.title.trim() || t('notes.newTitle')}
                onOpenDay={openDay}
                onOpenWeek={openWeek}
                onSelect={selectSession}
                onSelectNote={selectNote}
                onDraft={draftNote}
                deadlines={shownDeadlines}
                onSelectDeadline={selectDeadline}
                onUserScroll={closeTransient}
              />
            </div>
          )}
        </Panel>
        <InspectorSlot slotKey={inspectorOpen ? (explicitInspector ? (inspector?.type ?? null) : 'agenda') : null}>
          <CalendarInspector
            inspector={inspector}
            inspectorSeries={inspectorSeries}
            pickerCourse={pickerCourse}
            timetableCourse={timetableCourse}
            showAgenda={showAgenda}
            data={data}
            badges={badges}
            sessionsById={sessionsById}
            notes={shownNotes}
            deadlines={shownDeadlines}
            showCancelled={prefs.calendarShowCancelled}
            actions={actions}
            anchorKey={anchorKey}
            todayKey={today}
            now={now}
            locale={locale}
            moodleUrl={prefs.moodleToken}
            onConnectMoodle={layers.onConnectMoodle}
            onPreview={setPreviewGroupId}
            onClose={closeInspector}
          />
        </InspectorSlot>
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
      <CalendarOverlays
        notes={notes}
        deadline={deadline}
        fallbackFocus={addNoteRef}
        now={now}
        locale={locale}
        onCloseDeadline={closeDeadline}
      />
    </div>
  );
};

export default CalendarView;
