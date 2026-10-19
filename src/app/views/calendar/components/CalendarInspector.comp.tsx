import React from 'react';
import type { CalendarCourse, CalendarData, CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { NoteOccurrence, Session } from '@/app/schedule';
import type { CalendarActions, InspectorState, SessionBadge } from '../types';
import { DayAgenda } from './DayAgenda.comp';
import { ExportInspector } from './ExportInspector.comp';
import { GroupPicker } from './GroupPicker.comp';
import { SessionsInspector } from './SessionsInspector.comp';
import { TimetableInspector } from './TimetableInspector.comp';

interface Props {
  inspector: InspectorState | null;
  inspectorSeries: Session[];
  pickerCourse: CalendarCourse | undefined;
  timetableCourse: CalendarCourse | undefined;
  showAgenda: boolean;
  data: CalendarData;
  badges: Map<string, SessionBadge>;
  sessionsById: Map<string, Session>;
  notes: NoteOccurrence[];
  deadlines: CalendarDeadline[];
  showCancelled: boolean;
  actions: CalendarActions;
  anchorKey: string;
  todayKey: string;
  now: Date;
  locale: string;
  moodleUrl: string | null;
  onConnectMoodle: () => void;
  onPreview: (groupId: string | null) => void;
  onClose: () => void;
}

export const CalendarInspector: React.FC<Props> = ({
  inspector,
  inspectorSeries,
  pickerCourse,
  timetableCourse,
  showAgenda,
  data,
  badges,
  sessionsById,
  notes,
  deadlines,
  showCancelled,
  actions,
  anchorKey,
  todayKey,
  now,
  locale,
  moodleUrl,
  onConnectMoodle,
  onPreview,
  onClose,
}) => (
  <>
    {inspectorSeries.length > 0 && (
      <SessionsInspector
        series={inspectorSeries}
        clashesBySession={data.clashesBySession}
        badges={badges}
        rooms={data.rooms}
        now={now}
        locale={locale}
        onClose={onClose}
      />
    )}
    {pickerCourse && inspector?.type === 'groups' && (
      <GroupPicker
        course={pickerCourse}
        courseCode={pickerCourse.courseUnitId ? (data.courseUnits[pickerCourse.courseUnitId]?.code ?? null) : null}
        focusSetId={inspector.setId}
        candidates={data.candidates}
        attended={data.attended}
        plan={data.plans[pickerCourse.realisationId]}
        rooms={data.rooms}
        isLoading={data.candidatesLoading}
        isFailed={data.candidatesFailed}
        locale={locale}
        actions={actions}
        onPreview={onPreview}
        onRetry={data.retryCandidates}
        onClose={onClose}
      />
    )}
    {timetableCourse && (
      <TimetableInspector
        key={timetableCourse.realisationId}
        course={timetableCourse}
        code={timetableCourse.courseUnitId ? (data.courseUnits[timetableCourse.courseUnitId]?.code ?? null) : null}
        range={data.range}
        existingUrl={data.linked[timetableCourse.realisationId]?.url ?? null}
        locale={locale}
        onSave={(link) => {
          data.saveTimetable(timetableCourse.realisationId, link);
          onClose();
        }}
        onClose={onClose}
      />
    )}
    {inspector?.type === 'export' && (
      <ExportInspector moodleUrl={moodleUrl} locale={locale} onConnectMoodle={onConnectMoodle} onClose={onClose} />
    )}
    {showAgenda && (
      <DayAgenda
        dateKey={anchorKey}
        todayKey={todayKey}
        now={now}
        attended={data.attended}
        skipped={data.skipped}
        sessionsById={sessionsById}
        clashesBySession={data.clashesBySession}
        rooms={data.rooms}
        range={data.range}
        notes={notes}
        deadlines={deadlines}
        showCancelled={showCancelled}
        locale={locale}
      />
    )}
  </>
);
