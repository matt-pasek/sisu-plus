import React, { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermShortTitle, getTermTitle } from '@/app/helpers/getSemesterTitle';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { TrajectoryPoint } from '@/app/views/timeline/util/heroStats';
import { getChartDomain, getGraduationX, getTermPoints } from '@/app/views/timeline/util/trajectoryTerms';

interface Props {
  points: TrajectoryPoint[];
  target: number | null;
  periodsByLocator: Map<string, StudyPeriodInfo>;
}

const WIDTH = 460;
const HEIGHT = 150;
const PAD = { left: 8, right: 14, top: 18, bottom: 26 };
const GREEN = '#52c989';
const PANEL = '#15151c';
const DRAW_SECONDS = 1.2;
const DRAW_EASE = [0.4, 0.8, 0.3, 1] as const;
const MAX_UNTHINNED_LABELS = 7;

const toPath = (coordinates: { x: number; y: number }[]) =>
  coordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

export const TrajectoryChart: React.FC<Props> = ({ points, target, periodsByLocator }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const gradientId = `trajectory-fill-${uid}`;
  const clipId = `trajectory-clip-${uid}`;

  const terms = getTermPoints(points, periodsByLocator);
  if (terms.length === 0) return null;

  const nowIndex = terms.reduce((last, term, index) => (term.hasStarted ? index : last), -1);
  const { min, max } = getChartDomain(
    terms.map((term) => term.total),
    target,
  );
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const baseline = HEIGHT - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (terms.length === 1 ? plotWidth / 2 : (index / (terms.length - 1)) * plotWidth);
  const y = (value: number) => PAD.top + (1 - (value - min) / (max - min)) * (baseline - PAD.top);

  const coordinates = terms.map((term, index) => ({ x: x(index), y: y(term.total) }));
  const solidCoordinates = coordinates.slice(0, nowIndex + 1);
  const dashedCoordinates = coordinates.slice(Math.max(nowIndex, 0));
  const areaPath = `${toPath(coordinates)} L${coordinates[coordinates.length - 1].x.toFixed(1)} ${baseline} L${coordinates[0].x.toFixed(1)} ${baseline} Z`;

  const targetY = target === null ? null : y(target);
  const graduationX =
    target === null
      ? null
      : getGraduationX(
          terms.map((term, index) => ({ x: x(index), total: term.total })),
          target,
        );
  const earned = points.reduce((last, point) => (point.hasStarted ? point.completed : last), 0);
  const percent = target ? Math.round((earned / target) * 100) : null;
  const targetLabelOnLeft = graduationX !== null && graduationX > WIDTH - PAD.right - 120;
  const degreeAnchor =
    graduationX === null ? 'middle' : graduationX > WIDTH - 36 ? 'end' : graduationX < 36 ? 'start' : 'middle';

  const showLabel = (index: number) =>
    terms.length <= MAX_UNTHINNED_LABELS || index % 2 === 0 || index === nowIndex || index === terms.length - 1;
  const anchorFor = (index: number) =>
    index === 0 ? 'start' : index === terms.length - 1 && terms.length > 1 ? 'end' : 'middle';

  const fadeIn = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.4, delay: DRAW_SECONDS * 0.8 },
      };

  return (
    <div className="w-[460px] shrink-0">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
          {target === null
            ? t('hero.trajectoryLabelNoTarget')
            : t('hero.trajectoryLabel', { target: formatCredits(target) })}
        </span>
        {percent !== null && (
          <span className="font-mono text-xs font-semibold text-lighterGreen">
            {t('hero.ofDegree', { pct: percent })}
          </span>
        )}
      </div>
      <svg
        role="img"
        aria-label={t('hero.chartLabel')}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width={WIDTH}
        height={HEIGHT}
        className="block"
        overflow="visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.34} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
          {!shouldReduceMotion && (
            <clipPath id={clipId}>
              <motion.rect
                x={0}
                y={-PAD.top}
                height={HEIGHT + PAD.top * 2}
                initial={{ width: 0 }}
                animate={{ width: WIDTH }}
                transition={{ duration: DRAW_SECONDS, ease: DRAW_EASE }}
              />
            </clipPath>
          )}
        </defs>

        {targetY !== null && (
          <g>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={targetY}
              y2={targetY}
              stroke="rgba(243,243,255,0.32)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={targetLabelOnLeft ? PAD.left : WIDTH - PAD.right}
              y={targetY - 7}
              textAnchor={targetLabelOnLeft ? 'start' : 'end'}
              fontSize={10}
              fill="rgba(243,243,255,0.6)"
              className="font-mono"
            >
              {t('hero.targetLine', { target: formatCredits(target) })}
            </text>
          </g>
        )}

        <g clipPath={shouldReduceMotion ? undefined : `url(#${clipId})`}>
          {terms.length > 1 && <path d={areaPath} fill={`url(#${gradientId})`} />}
          {solidCoordinates.length > 1 && (
            <path
              d={toPath(solidCoordinates)}
              fill="none"
              stroke={GREEN}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {dashedCoordinates.length > 1 && (
            <path
              d={toPath(dashedCoordinates)}
              fill="none"
              stroke={GREEN}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 5"
            />
          )}
        </g>

        {target !== null && targetY !== null && graduationX !== null && (
          <motion.g {...fadeIn}>
            <line
              x1={graduationX}
              x2={graduationX}
              y1={targetY}
              y2={PAD.top}
              stroke="rgba(82,201,137,0.5)"
              strokeWidth={1}
            />
            <circle cx={graduationX} cy={targetY} r={3.5} fill={GREEN} />
            <text
              x={graduationX}
              y={PAD.top - 5}
              textAnchor={degreeAnchor}
              fontSize={9.5}
              fontWeight={700}
              fill={GREEN}
              className="font-mono"
            >
              {t('hero.degreeMarker')}
            </text>
          </motion.g>
        )}

        <motion.g {...fadeIn}>
          {terms.map((term, index) => {
            const isNow = index === nowIndex;
            const isFuture = index > nowIndex;
            const title = `${getTermTitle(term.period)}: ${formatCredits(term.total)}${isFuture ? `, ${t('hero.pointPlanned')}` : ''}`;
            return (
              <g key={term.key} className="group">
                <circle
                  cx={coordinates[index].x}
                  cy={coordinates[index].y}
                  r={isNow ? 5 : 3.2}
                  fill={isFuture ? PANEL : GREEN}
                  stroke={GREEN}
                  strokeWidth={isFuture ? 1.6 : 0}
                  className="transition-[r] duration-150 group-hover:[r:5px]"
                />
                <circle cx={coordinates[index].x} cy={coordinates[index].y} r={10} fill="transparent">
                  <title>{title}</title>
                </circle>
              </g>
            );
          })}
        </motion.g>

        {terms.map(
          (term, index) =>
            showLabel(index) && (
              <text
                key={term.key}
                x={coordinates[index].x}
                y={HEIGHT - 6}
                textAnchor={anchorFor(index)}
                fontSize={9.5}
                fill="rgba(243,243,255,0.5)"
                className="font-mono"
              >
                {getTermShortTitle(term.period)}
              </text>
            ),
        )}
      </svg>
    </div>
  );
};
