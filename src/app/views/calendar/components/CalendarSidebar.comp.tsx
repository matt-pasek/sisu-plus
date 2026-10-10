import React from 'react';
import type { CalendarCourse, CourseUnitInfo } from '@/app/api/dataPoints/calendar/types';
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
  showCancelled: boolean;
  onSelectDate: (dateKey: string) => void;
  onShowCancelledChange: (value: boolean) => void;
}

export const CalendarSidebar: React.FC<Props> = ({
  anchorKey,
  todayKey,
  busyDateKeys,
  locale,
  courses,
  courseUnits,
  showCancelled,
  onSelectDate,
  onShowCancelledChange,
}) => (
  <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto pb-1 lg:flex">
    <MiniMonth
      anchorKey={anchorKey}
      todayKey={todayKey}
      busyDateKeys={busyDateKeys}
      locale={locale}
      onSelect={onSelectDate}
    />
    <CourseList courses={courses} courseUnits={courseUnits} />
    <LayersPanel showCancelled={showCancelled} onShowCancelledChange={onShowCancelledChange} />
  </aside>
);
