import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { DashboardCompletedCourse } from '@/app/views/dashboard/types/DashboardCompletedCourse.type';
import { formatCompactDate } from '@/app/views/dashboard/util';
import { getSmoothPath } from '@/app/views/dashboard/util/getSmoothPath';

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
  // Regression slope in grade units: slope * 5 converts from normalized y to 1-5 scale
  const slopeDelta = trend ? (trend.y2 - trend.y1) * 5 : null;
  const improving = slopeDelta != null && slopeDelta >= 0;

  const W = 520,
    H = 170,
    padL = 26,
    padR = 10,
    padT = 12,
    padB = 20;
  const xCoord = (t: number) => padL + t * (W - padL - padR);
  const yCoord = (g: number) => padT + (1 - (g - 1) / 4) * (H - padT - padB);

  if (graded.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">
        {t('widgets.analytics.moreGradesNeeded')}
      </div>
    );
  }

  const chartPoints = points.map((point) => ({
    x: xCoord(point.x),
    y: yCoord(point.y * 5),
  }));
  const curvePath = getSmoothPath(chartPoints);
  const areaPath = `${curvePath} L${chartPoints[chartPoints.length - 1].x} ${H - padB} L${chartPoints[0].x} ${H - padB} Z`;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-end gap-3">
        <div>
          <p className="text-[11px] text-lightGrey">{t('widgets.analytics.creditWeightedGrades')}</p>
          <p className="mt-0.5 text-[24px] leading-none font-bold text-offwhite tabular-nums">
            {slopeDelta == null ? '-' : slopeDelta >= 0 ? `+${slopeDelta.toFixed(1)}` : slopeDelta.toFixed(1)}
            <span className="ml-1.5 text-[13px] font-medium text-lightGrey">over {graded.length} courses</span>
          </p>
        </div>
        <span
          className="mb-0.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: improving ? 'rgba(82,201,137,0.12)' : 'rgba(240,107,107,0.12)',
            color: improving ? '#52c989' : '#f06b6b',
          }}
        >
          {improving ? t('widgets.analytics.improving') : t('widgets.analytics.watchPace')}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 rounded-xl bg-background/45 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="pointer-events-none absolute inset-2 rounded-lg bg-[radial-gradient(circle_at_50%_10%,rgba(82,201,137,0.08),transparent_48%)]" />
        <svg
          aria-label={t('widgets.analytics.chartAria')}
          className="relative h-full w-full"
          role="img"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gt-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52c989" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#52c989" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[1, 2, 3, 4, 5].map((grade) => (
            <g key={grade}>
              <line
                x1={padL}
                x2={W - padR}
                y1={yCoord(grade)}
                y2={yCoord(grade)}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={yCoord(grade) + 3.5}
                fill="var(--color-lightGrey)"
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {grade}
              </text>
            </g>
          ))}
          <path d={areaPath} fill="url(#gt-area-grad)" />
          <path
            d={curvePath}
            fill="none"
            className="sisu-widget-line"
            stroke="rgba(221,221,240,0.24)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
          />
          {trend && (
            <line
              className="sisu-widget-line"
              x1={xCoord(trend.x1)}
              x2={xCoord(trend.x2)}
              y1={yCoord(trend.y1 * 5)}
              y2={yCoord(trend.y2 * 5)}
              stroke="var(--color-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.9"
              pathLength={1}
              style={{ animationDelay: '120ms' }}
            />
          )}
          {points.map((point) => (
            <g key={point.course.id}>
              <circle
                cx={xCoord(point.x)}
                cy={yCoord(point.y * 5)}
                fill="rgba(221,221,240,0.12)"
                r={Math.min(10, 5 + point.course.credits / 4)}
              />
              <circle
                cx={xCoord(point.x)}
                cy={yCoord(point.y * 5)}
                fill="var(--color-offwhite)"
                opacity="0.94"
                r={Math.min(6.5, 3 + point.course.credits / 5)}
              >
                <title>
                  {t('widgets.analytics.gradeTooltip', {
                    name: point.course.name,
                    grade: point.course.grade,
                    credits: formatCredits(point.course.credits),
                  })}
                </title>
              </circle>
            </g>
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
