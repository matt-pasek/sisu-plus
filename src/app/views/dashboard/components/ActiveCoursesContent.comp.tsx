import { ActiveCourse } from '@/app/api/dataPoints/getActiveCourses';
import React from 'react';

interface Props {
  activeCourses: ActiveCourse[];
  moduleColorMap: Map<string, string>;
  moduleNameMap: Map<string, string>;
}

export const ActiveCoursesContent: React.FC<Props> = ({ activeCourses, moduleColorMap, moduleNameMap }) => (
  <div className="-mx-4 -mb-4">
    {activeCourses.map((course) => {
      const dotColor = course.moduleId ? (moduleColorMap.get(course.moduleId) ?? '#6B7280') : '#6B7280';
      const moduleName = course.moduleId ? moduleNameMap.get(course.moduleId) : null;
      return (
        <div key={course.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0">
          <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-offwhite">{course.courseName}</p>
            <p className="text-xs text-lightGrey">{course.courseCode}</p>
          </div>
          {moduleName && (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${dotColor}22`, color: dotColor }}
            >
              {moduleName.split(' ').slice(0, 2).join(' ')}
            </span>
          )}
          {course.credits != null && (
            <span
              className={`shrink-0 rounded-md border px-1.5 py-0.5 text-xs ${
                course.isPassed
                  ? 'border-accent/30 bg-accent/10 font-semibold text-accent'
                  : 'border-border2 text-lightGrey'
              }`}
            >
              {course.isPassed && course.grade != null ? `${course.grade} · ` : ''}
              <span className="tabular-nums">{course.credits}</span> cr
            </span>
          )}
        </div>
      );
    })}
    {activeCourses.length === 0 && (
      <div className="flex items-center justify-center py-10 text-sm text-lightGrey">No active courses</div>
    )}
  </div>
);
