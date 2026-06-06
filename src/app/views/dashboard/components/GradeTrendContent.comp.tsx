import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import type { DashboardCompletedCourse } from '../types/DashboardCompletedCourse.type';
import { formatCompactDate } from '../util/analyticsHelpers';

const getNumericGrade = (course: DashboardCompletedCourse): number | null =>
  typeof course.grade === 'number' ? course.grade : null;

const getTrendLine = (
  points: { x: number; y: number }[],
): { x1: number; y1: number; x2: number; y2: number } | null => {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { x1: 0, y1: intercept, x2: 1, y2: slope + intercept };
};

export const GradeTrendContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const graded = courses
    .filter((course) => getNumericGrade(course) != null && course.registrationDate)
    .sort((a, b) => a.registrationDate.localeCompare(b.registrationDate));
  const minDate = Math.min(...graded.map((course) => new Date(course.registrationDate).getTime()));
  const maxDate = Math.max(...graded.map((course) => new Date(course.registrationDate).getTime()));
  const range = Math.max(maxDate - minDate, 1);
  const points = graded.map((course) => ({
    course,
    x: (new Date(course.registrationDate).getTime() - minDate) / range,
    y: (getNumericGrade(course) ?? 1) / 5,
  }));
  const trend = getTrendLine(points.map((p) => ({ x: p.x, y: p.y })));
  const firstGrade = graded[0] ? getNumericGrade(graded[0]) : null;
  const lastGrade = graded[graded.length - 1] ? getNumericGrade(graded[graded.length - 1]) : null;
  const trendLabel = firstGrade != null && lastGrade != null ? lastGrade - firstGrade : null;

  if (graded.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">
        {t('widgets.analytics.moreGradesNeeded')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-lightGrey">{t('widgets.analytics.creditWeightedGrades')}</p>
          <p className="text-xl font-semibold text-offwhite tabular-nums">
            {trendLabel == null ? '-' : trendLabel >= 0 ? `+${trendLabel.toFixed(1)}` : trendLabel.toFixed(1)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            trendLabel != null && trendLabel >= 0 ? 'bg-lighterGreen/10 text-lighterGreen' : 'bg-danger/10 text-danger'
          }`}
        >
          {trendLabel != null && trendLabel >= 0 ? t('widgets.analytics.improving') : t('widgets.analytics.watchPace')}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <svg aria-label={t('widgets.analytics.chartAria')} className="h-full w-full" role="img" viewBox="0 0 320 170">
          {[1, 2, 3, 4, 5].map((grade) => (
            <g key={grade}>
              <line x1="28" x2="306" y1={158 - grade * 26} y2={158 - grade * 26} stroke="rgba(255,255,255,0.07)" />
              <text x="8" y={162 - grade * 26} fill="var(--color-lightGrey)" fontSize="10">
                {grade}
              </text>
            </g>
          ))}
          {trend && (
            <line
              x1={28 + trend.x1 * 278}
              x2={28 + trend.x2 * 278}
              y1={158 - trend.y1 * 130}
              y2={158 - trend.y2 * 130}
              stroke="var(--color-accent)"
              strokeLinecap="round"
              strokeWidth="2"
            />
          )}
          {points.map((point) => (
            <circle
              key={point.course.id}
              cx={28 + point.x * 278}
              cy={158 - point.y * 130}
              fill="var(--color-offwhite)"
              opacity="0.88"
              r={Math.min(8, 3.5 + point.course.credits / 3)}
            >
              <title>
                {t('widgets.analytics.gradeTooltip', {
                  name: point.course.name,
                  grade: point.course.grade,
                  credits: formatCredits(point.course.credits),
                })}
              </title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-x-5 bottom-2 flex justify-between text-[10px] text-lightGrey">
          <span>{formatCompactDate(graded[0].registrationDate)}</span>
          <span>{formatCompactDate(graded[graded.length - 1].registrationDate)}</span>
        </div>
      </div>
    </div>
  );
};
