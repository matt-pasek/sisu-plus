import { ActiveCourse } from '@/app/api/dataPoints/getActiveCourses';
import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { hexA } from '@/app/views/dashboard/util/hexA';

interface Props {
  activeCourses: ActiveCourse[];
  moduleColorMap: Map<string, string>;
  moduleNameMap: Map<string, string>;
}

export const ActiveCoursesContent: React.FC<Props> = ({ activeCourses, moduleColorMap, moduleNameMap }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');

  return (
    <div className="-m-4">
      {activeCourses.map((course) => {
        const color = course.moduleId ? (moduleColorMap.get(course.moduleId) ?? '#6B7280') : '#6B7280';
        const moduleName = course.moduleId ? moduleNameMap.get(course.moduleId) : null;
        return (
          <div
            key={course.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3.5 transition-[background-color] duration-150 last:border-0 hover:bg-offwhite/2.5"
          >
            <span className="h-9 w-0.75 shrink-0 self-stretch rounded-full" style={{ backgroundColor: color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-offwhite">{course.courseName}</p>
              <p className="mt-0.5 font-mono text-[11px] text-lightGrey">{course.courseCode}</p>
            </div>
            {moduleName && (
              <span
                className="shrink-0 rounded-full px-2.5 py-0.75 text-[10.5px] font-semibold"
                style={{ background: hexA(color, 0.12), color }}
              >
                {moduleName.split(' ').slice(0, 2).join(' ')}
              </span>
            )}
            {course.credits != null && (
              <span
                className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[11.5px] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                style={{
                  background: course.isPassed ? 'rgba(82,201,137,0.12)' : 'var(--color-container2)',
                  color: course.isPassed ? '#52c989' : 'var(--color-offwhite)',
                }}
              >
                {course.isPassed && course.grade != null ? `${course.grade} · ` : ''}
                <span className="tabular-nums">{course.credits}</span> {tUtil('credits.short')}
              </span>
            )}
          </div>
        );
      })}
      {activeCourses.length === 0 && (
        <div className="flex items-center justify-center py-10 text-sm text-lightGrey">
          {t('widgets.activeCourses.empty')}
        </div>
      )}
    </div>
  );
};
