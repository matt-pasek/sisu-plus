import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { DashboardCompletedCourse } from '@/app/views/dashboard/types/DashboardCompletedCourse.type';

const GRADE_PALETTE: Record<string, string> = {
  '5': '#52c989',
  '4': '#7ea0ff',
  '3': '#f0a84d',
  '2': '#f06b6b',
  '1': '#454565',
};

interface GradeSegment {
  grade: string;
  count: number;
  color: string;
}

export const GradeDonutContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  const gradeCounts = courses.reduce<Record<string, number>>((acc, course) => {
    const key = typeof course.grade === 'number' ? String(course.grade) : null;
    if (key == null) return acc;
    return { ...acc, [key]: (acc[key] ?? 0) + 1 };
  }, {});

  const segments: GradeSegment[] = ['5', '4', '3', '2', '1']
    .map((g) => ({ grade: g, count: gradeCounts[g] ?? 0, color: GRADE_PALETTE[g] }))
    .filter((s) => s.count > 0);

  const total = segments.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">
        {t('widgets.analytics.noCompletedCourses')}
      </div>
    );
  }

  const numericGrades = courses
    .map((c) => (typeof c.grade === 'number' ? c.grade : null))
    .filter((g): g is number => g != null);
  const gradeAvg =
    numericGrades.length > 0 ? (numericGrades.reduce((s, g) => s + g, 0) / numericGrades.length).toFixed(2) : null;

  const R = 52,
    sw = 16;
  const C = 2 * Math.PI * R;
  const segmentsWithOffset = segments.reduce<Array<GradeSegment & { offset: number; fraction: number }>>(
    (items, segment) => {
      const previous = items.reduce((sum, item) => sum + item.fraction, 0);
      return [...items, { ...segment, offset: previous, fraction: segment.count / total }];
    },
    [],
  );

  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          {segmentsWithOffset.map((seg, index) => {
            const dashLen = C * seg.fraction - 2;
            const offset = -seg.offset * C;
            return (
              <circle
                key={seg.grade}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={sw}
                strokeDasharray={`${Math.max(dashLen, 0)} ${C - Math.max(dashLen, 0)}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="sisu-widget-ring"
                style={
                  {
                    '--sisu-ring-from': `${offset + C}`,
                    '--sisu-ring-to': `${offset}`,
                    animationDelay: `${index * 55}ms`,
                    transition: 'stroke-dasharray 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                  } as React.CSSProperties
                }
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-[26px] leading-none font-bold text-offwhite tabular-nums">{gradeAvg ?? '-'}</p>
          <p className="mt-1 text-[9.5px] font-semibold tracking-widest text-lightGrey uppercase">avg</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.grade} className="flex items-center gap-2.5">
            <span
              className="size-2.25 shrink-0 rounded-[3px]"
              style={{ background: seg.color, opacity: seg.count ? 1 : 0.3 }}
            />
            <span className="w-3.5 font-mono text-[11.5px] text-offwhite">{seg.grade}</span>
            <div className="h-1.25 flex-1 overflow-hidden rounded-full bg-border2">
              <div
                className="sisu-widget-bar-x h-full rounded-full"
                style={{ width: `${(seg.count / total) * 100}%`, background: seg.color }}
              />
            </div>
            <span className="w-4 text-right font-mono text-[11px] text-lightGrey">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
