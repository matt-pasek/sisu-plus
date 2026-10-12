import React from 'react';
import type { CalendarCourse, CourseUnitInfo } from '@/app/api/dataPoints/calendar/types';
import type { AttendancePlan } from '@/app/schedule';
import type { LayerControls, TimetableControls } from '../types';
import { CourseList } from './CourseList.comp';
import { LayersPanel } from './LayersPanel.comp';
import { MiniMonth } from './MiniMonth.comp';

interface Props {
  anchorKey: string;
  todayKey: string;
  busyDateKeys: Set<string>;
  locale: string;
  courses: CalendarCourse[];
  courseUnits: Record<string, CourseUnitInfo>;
  plans: Record<string, AttendancePlan>;
  timetables: TimetableControls;
  layers: LayerControls;
  onSelectDate: (dateKey: string) => void;
  onToggleCourse: (course: CalendarCourse, visible: boolean) => void;
  onOpenGroups: (courseKey: string, setId: string | null) => void;
  onDismissPrompt: (courseKey: string, setId: string) => void;
}

export const CalendarSidebar: React.FC<Props> = ({
  anchorKey,
  todayKey,
  busyDateKeys,
  locale,
  courses,
  courseUnits,
  plans,
  timetables,
  layers,
  onSelectDate,
  onToggleCourse,
  onOpenGroups,
  onDismissPrompt,
}) => (
  <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto pb-1 lg:flex">
    <MiniMonth
      anchorKey={anchorKey}
      todayKey={todayKey}
      busyDateKeys={busyDateKeys}
      locale={locale}
      onSelect={onSelectDate}
    />
    <CourseList
      courses={courses}
      courseUnits={courseUnits}
      plans={plans}
      timetables={timetables}
      onToggleCourse={onToggleCourse}
      onOpenGroups={onOpenGroups}
      onDismissPrompt={onDismissPrompt}
    />
    <LayersPanel layers={layers} />
  </aside>
);
