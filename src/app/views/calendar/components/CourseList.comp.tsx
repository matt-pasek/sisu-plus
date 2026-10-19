import React from 'react';
import type { CalendarCourse, CourseUnitInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AttendancePlan } from '@/app/schedule';
import type { TimetableControls } from '../types';
import { CourseRow } from './CourseRow.comp';

const SKELETON_ROWS = 4;

interface Props {
  courses: CalendarCourse[];
  isLoading: boolean;
  courseUnits: Record<string, CourseUnitInfo>;
  plans: Record<string, AttendancePlan>;
  timetables: TimetableControls;
  onToggleCourse: (course: CalendarCourse, visible: boolean) => void;
  onOpenGroups: (courseKey: string, setId: string | null) => void;
  onDismissPrompt: (courseKey: string, setId: string) => void;
}

export const CourseList: React.FC<Props> = ({
  courses,
  isLoading,
  courseUnits,
  plans,
  timetables,
  onToggleCourse,
  onOpenGroups,
  onDismissPrompt,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (!isLoading && courses.length === 0) return null;
  return (
    <Panel
      className="shrink-0"
      header={
        <>
          <PanelEyebrow>{t('sidebar.courses')}</PanelEyebrow>
          {!isLoading && <PanelEyebrow>{courses.length}</PanelEyebrow>}
        </>
      }
    >
      <ul className="flex flex-col gap-0.5 p-2" aria-busy={isLoading}>
        {isLoading &&
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <li key={index} className="flex items-start gap-2.5 px-2 py-1.5" aria-hidden="true">
              <span className="mt-1 size-3.5 shrink-0 rounded-[4px] bg-offwhite/8" />
              <span className="flex-1">
                <span className="block h-3 w-4/5 rounded bg-offwhite/8 motion-safe:animate-pulse" />
                <span className="mt-1.5 block h-2.5 w-16 rounded bg-offwhite/5 motion-safe:animate-pulse" />
              </span>
            </li>
          ))}
        {!isLoading &&
          courses.map((course) => (
            <CourseRow
              key={course.realisationId}
              course={course}
              code={course.courseUnitId ? courseUnits[course.courseUnitId]?.code : undefined}
              plan={plans[course.realisationId]}
              timetables={timetables}
              onToggleCourse={onToggleCourse}
              onOpenGroups={onOpenGroups}
              onDismissPrompt={onDismissPrompt}
            />
          ))}
      </ul>
    </Panel>
  );
};
