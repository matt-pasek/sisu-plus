import React, { useId, useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';
import { getSmoothPath } from '@/app/views/dashboard/util/getSmoothPath';

interface Props {
  done: number;
  total: number;
  semesters?: SemesterCreditSummary[];
}

const W = 240;
const H = 110;
const padL = 4;
const padR = 4;
const padT = 10;
const padB = 22;
const chartW = W - padL - padR;
const chartH = H - padT - padB;

const clampProgress = (value: number): number => Math.min(Math.max(value, 0), 1);

export const CreditTrajectory: React.FC<Props> = ({ done, total, semesters }) => {
  const maskId = `ct-planned-mask-${useId().replaceAll(':', '')}`;
  const { t } = useTranslationWithPrefix('views.dashboard');

  const futureSemesters = useMemo(() => (semesters ?? []).filter((s) => s.plannedCredits > 0).slice(0, 5), [semesters]);

  const chartData = useMemo(() => {
    if (total <= 0) return null;

    const xCoord = (c: number) => padL + clampProgress(c / total) * chartW;
    const yCoord = (c: number) => padT + (1 - clampProgress(c / total)) * chartH;
    const current = { label: t('hero.trajectoryNow'), cumulative: done, x: xCoord(done), y: yCoord(done) };
    const start = { label: '0', cumulative: 0, x: xCoord(0), y: yCoord(0) };
    const mid = {
      label: '',
      cumulative: done * 0.45,
      x: xCoord(done * 0.45),
      y: yCoord(done * 0.38),
    };

    let cum = done;
    const plannedPts = [current];
    for (const sem of futureSemesters) {
      cum = Math.min(cum + sem.plannedCredits, total);
      plannedPts.push({ label: getSemesterTitle(sem), cumulative: cum, x: xCoord(cum), y: yCoord(cum) });
    }

    const solidPts = done > 0 ? [start, mid, current] : [start];
    const path = getSmoothPath(solidPts);
    const plannedPath = plannedPts.length > 1 ? getSmoothPath(plannedPts) : null;
    const areaPath = done > 0 ? `${path} L${current.x} ${H - padB} L${start.x} ${H - padB} Z` : null;
    const targetY = yCoord(total);

    const gradIdx = plannedPts.findIndex((p, i) => i > 0 && p.cumulative >= total);
    const lastPlannedPt = plannedPts[plannedPts.length - 1];
    const gradLabel = gradIdx > 0 ? plannedPts[gradIdx].label : plannedPts.length > 1 ? lastPlannedPt.label : null;
    const plannedAhead = futureSemesters.reduce((s, sem) => s + sem.plannedCredits, 0);
    const completionPct = Math.round((done / total) * 100);
    const projectionLabel = plannedPts.length > 1 ? lastPlannedPt : null;
    const currentLabel = {
      ...current,
      textX: current.x,
      textY: Math.min(H - padB - 2, current.y + 13),
    };
    const projectionLabelPlacement = projectionLabel
      ? {
          ...projectionLabel,
          textX: W - padR,
          textY: H - 4,
        }
      : null;

    return {
      current,
      currentLabel,
      plannedPts,
      path,
      plannedPath,
      areaPath,
      targetY,
      gradIdx,
      gradLabel,
      plannedAhead,
      completionPct,
      projectionLabel: projectionLabelPlacement,
    };
  }, [done, total, futureSemesters, t]);

  if (!chartData) {
    return (
      <div className="hidden min-w-64 flex-col gap-2 md:flex">
        <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
          {t('hero.panel.creditTrajectory')}
        </p>
        <p className="text-[11px] text-lightGrey/50">{t('widgets.analytics.noCompletedCourses')}</p>
      </div>
    );
  }

  const {
    current,
    currentLabel,
    plannedPts,
    path,
    plannedPath,
    areaPath,
    targetY,
    gradIdx,
    gradLabel,
    plannedAhead,
    completionPct,
    projectionLabel,
  } = chartData;

  return (
    <div className="hidden min-w-72 flex-col gap-2 md:flex" style={{ minHeight: 160 }}>
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
          {t('hero.panel.creditTrajectory')} → {total} CR
        </p>
        {completionPct > 0 && (
          <span className="text-[13px] font-bold text-lighterGreen tabular-nums">{completionPct}%</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full flex-1"
        preserveAspectRatio="none"
        style={{ minHeight: 90, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="ct-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52c989" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#52c989" stopOpacity="0" />
          </linearGradient>
          {plannedPath && (
            <mask id={maskId}>
              <path
                className="sisu-widget-line"
                d={plannedPath}
                fill="none"
                pathLength={1}
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
                style={{ animationDelay: '170ms' }}
              />
            </mask>
          )}
        </defs>

        <line
          x1={padL}
          y1={targetY}
          x2={W - padR}
          y2={targetY}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
          strokeDasharray="3.5 2.5"
        />
        <text x={W - padR - 2} y={targetY - 3.5} fill="rgba(255,255,255,0.35)" fontSize="6.5" textAnchor="end">
          {total} cr · degree
        </text>

        {areaPath && <path className="sisu-widget-fade-lift" d={areaPath} fill="url(#ct-area-grad)" />}

        {path && (
          <path
            className="sisu-widget-line"
            d={path}
            fill="none"
            stroke="#52c989"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
          />
        )}

        {plannedPath && (
          <path
            d={plannedPath}
            fill="none"
            mask={`url(#${maskId})`}
            stroke="rgba(82,201,137,0.46)"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
        )}

        <circle
          className="sisu-widget-fade-lift"
          cx={current.x}
          cy={current.y}
          fill="#52c989"
          r="3.5"
          stroke="rgba(13,13,17,0.9)"
          strokeWidth="1.2"
          style={{ animationDelay: '160ms' }}
        />
        {plannedPts.slice(1).map((pt, i) => {
          const isGrad = i + 1 === gradIdx;
          return (
            <circle
              className="sisu-widget-fade-lift"
              key={`${pt.label}-${i}`}
              cx={pt.x}
              cy={pt.y}
              fill={isGrad ? 'rgba(82,201,137,0.72)' : 'rgba(13,13,17,0.76)'}
              r={isGrad ? '3' : '2.3'}
              stroke="rgba(82,201,137,0.62)"
              strokeWidth="1.1"
              style={{ animationDelay: `${230 + i * 45}ms` }}
            />
          );
        })}

        <text
          className="sisu-widget-fade-lift"
          x={currentLabel.textX}
          y={currentLabel.textY}
          fill="rgba(221,221,240,0.74)"
          fontSize="7"
          fontWeight="600"
          stroke="rgba(13,13,17,0.78)"
          strokeLinejoin="round"
          strokeWidth="2.4"
          style={{ animationDelay: '190ms', paintOrder: 'stroke' }}
          textAnchor="middle"
        >
          {currentLabel.label}
        </text>
        {projectionLabel && (
          <text
            className="sisu-widget-fade-lift"
            x={projectionLabel.textX}
            y={projectionLabel.textY}
            fill="rgba(221,221,240,0.52)"
            fontSize="7"
            fontWeight="600"
            stroke="rgba(13,13,17,0.78)"
            strokeLinejoin="round"
            strokeWidth="2.4"
            style={{ animationDelay: '280ms', paintOrder: 'stroke' }}
            textAnchor="end"
          >
            {projectionLabel.label}
          </text>
        )}
      </svg>

      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] text-lightGrey/55">
          <span className="font-bold text-offwhite">{Math.round(done)}</span> {t('hero.trajectoryEarned')}
          {' · '}
          <span className="font-bold text-offwhite">{Math.round(plannedAhead)}</span> {t('hero.trajectoryPlanned')}
        </p>
        {gradLabel && (
          <p className="shrink-0 text-[11px] text-lightGrey/55">
            {t('hero.trajectoryGraduates')} <span className="font-bold text-offwhite">{gradLabel}</span>
          </p>
        )}
      </div>
    </div>
  );
};
