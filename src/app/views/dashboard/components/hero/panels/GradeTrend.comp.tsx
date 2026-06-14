import React, { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { DashboardCompletedCourse } from '@/app/views/dashboard/types';
import { getSmoothPath } from '@/app/views/dashboard/util/getSmoothPath';

interface Props {
  courses?: DashboardCompletedCourse[];
  gradeAverage: number | null;
}

export const GradeTrend: React.FC<Props> = ({ courses, gradeAverage }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const W = 160,
    H = 52,
    padL = 2,
    padR = 2,
    padT = 4,
    padB = 4;

  const chartData = useMemo(() => {
    if (!courses?.length) return null;
    const graded = courses
      .filter((c) => typeof c.grade === 'number' && c.registrationDate)
      .sort((a, b) => a.registrationDate.localeCompare(b.registrationDate));
    if (graded.length < 2) return null;
    const minDate = Math.min(...graded.map((c) => new Date(c.registrationDate).getTime()));
    const maxDate = Math.max(...graded.map((c) => new Date(c.registrationDate).getTime()));
    const range = Math.max(maxDate - minDate, 1);
    const xCoord = (t: number) => padL + t * (W - padL - padR);
    const yCoord = (g: number) => padT + (1 - (g - 1) / 4) * (H - padT - padB);
    const points = graded.map((c) => ({
      x: xCoord((new Date(c.registrationDate).getTime() - minDate) / range),
      y: yCoord(c.grade as number),
    }));
    const path = getSmoothPath(points);
    const area = `${path} L${points[points.length - 1].x} ${H - padB} L${points[0].x} ${H - padB} Z`;
    const first = graded[0].grade as number;
    const last = graded[graded.length - 1].grade as number;
    return { path, area, improving: last >= first };
  }, [courses]);

  return (
    <div className="hidden min-w-56 flex-col gap-3 md:flex" style={{ minHeight: 160 }}>
      <div className="flex items-baseline gap-2">
        <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-offwhite/55 uppercase">
          {t('hero.panel.gradeTrend')}
        </p>
        {chartData && (
          <span className="text-[10px] font-semibold" style={{ color: chartData.improving ? '#52c989' : '#f06b6b' }}>
            {chartData.improving ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-[38px] leading-none font-bold text-offwhite tabular-nums">{gradeAverage?.toFixed(1) ?? '-'}</p>
      {chartData ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" preserveAspectRatio="none" style={{ minHeight: 80 }}>
          <defs>
            <linearGradient id="hp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52c989" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#52c989" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chartData.area} fill="url(#hp-grad)" />
          <path
            d={chartData.path}
            fill="none"
            stroke="#52c989"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sisu-widget-line"
            pathLength={1}
          />
        </svg>
      ) : (
        <p className="text-[11px] text-offwhite/40">{t('widgets.analytics.moreGradesNeeded')}</p>
      )}
    </div>
  );
};
