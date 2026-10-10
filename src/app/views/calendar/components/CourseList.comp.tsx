import React from 'react';
import type { CalendarCourse, CourseUnitInfo } from '@/app/api/dataPoints/calendar/types';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';

interface Props {
  courses: CalendarCourse[];
  courseUnits: Record<string, CourseUnitInfo>;
}

export const CourseList: React.FC<Props> = ({ courses, courseUnits }) => {
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
        {courses.map((course) => {
          const code = course.courseUnitId ? courseUnits[course.courseUnitId]?.code : undefined;
          return (
            <li
              key={course.realisationId}
              className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 ${course.isInCalendar ? '' : 'opacity-50'}`}
            >
              <span
                aria-hidden="true"
                className="mt-1 size-3.5 shrink-0 rounded-[4px]"
                style={{ backgroundColor: getModuleColorValueByIndex(course.colorIndex) }}
              />
              <span className="min-w-0">
                <span className="block text-[13px] leading-snug font-semibold text-offwhite">{course.name}</span>
                {(code || course.isExam) && (
                  <span className="mt-0.5 flex items-center gap-2">
                    {code && <span className="font-mono text-[11px] text-lightGrey">{code}</span>}
                    {course.isExam && <StatusChip tone="neutral">{t('sidebar.exam')}</StatusChip>}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};
