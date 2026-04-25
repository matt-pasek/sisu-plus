import React from 'react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { formatCredits, getStatusClass, getStatusLabel } from '@/app/views/timeline/components/timelineUtils';

interface Props {
  course: TimelineCourse;
  color: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TimelineCourseCard: React.FC<Props> = ({ course, color, compact = false, className = '', style }) => (
  <div
    title={`${course.courseName ?? 'Unnamed course'} · ${formatCredits(course.credits)} · ${getStatusLabel(course)}`}
    className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-container2 px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-colors duration-150 hover:border-border2 ${className}`}
    style={style}
  >
    <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate font-mono text-[10px] font-medium text-lightGrey">{course.courseCode ?? 'Course'}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[13px] leading-snug font-semibold text-offwhite">
          {course.courseName ?? 'Unnamed course'}
        </h3>
      </div>
      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getStatusClass(course)}`}>
        {getStatusLabel(course)}
      </span>
    </div>

    {!compact && (
      <div className="mt-auto flex items-end justify-between gap-2 pt-2 text-xs text-lightGrey">
        <span className="truncate">{course.moduleName ?? 'No module'}</span>
        <span className="shrink-0 font-mono text-offwhite">{formatCredits(course.credits)}</span>
      </div>
    )}
  </div>
);
