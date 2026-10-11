import React from 'react';
import type { CalendarCourse, CourseUnitInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { CourseRow } from './CourseRow.comp';

interface Props {
  courses: CalendarCourse[];
  courseUnits: Record<string, CourseUnitInfo>;
  onOpenGroups: (courseKey: string, setId: string | null) => void;
}

export const CourseList: React.FC<Props> = ({ courses, courseUnits, onOpenGroups }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <Panel
      className="shrink-0"
      header={
        <>
          <PanelEyebrow>{t('sidebar.courses')}</PanelEyebrow>
          <PanelEyebrow>{courses.length}</PanelEyebrow>
        </>
      }
    >
      <ul className="flex flex-col gap-0.5 p-2">
        {courses.map((course) => (
          <CourseRow
            key={course.realisationId}
            course={course}
            code={course.courseUnitId ? courseUnits[course.courseUnitId]?.code : undefined}
            onOpenGroups={onOpenGroups}
          />
        ))}
      </ul>
    </Panel>
  );
};
