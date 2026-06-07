import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { hexA } from '@/app/views/dashboard/util/hexA';

interface Props {
  activeCoursesCount: number;
  semesterCredits: number;
  upcomingDeadlines: number;
}

interface SparkProps {
  values: number[];
  color: string;
}

const Spark: React.FC<SparkProps> = ({ values, color }) => {
  const w = 56,
    h = 20;
  const max = Math.max(...values),
    min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as [number, number];
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      <path
        d={d}
        fill="none"
        className="sisu-widget-line"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
      <circle className="sisu-widget-fade-lift" cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
};

interface StatStripProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  color: string;
  spark: number[];
}

const StatStrip: React.FC<StatStripProps> = ({ icon, label, value, sub, color, spark }) => (
  <div className="flex items-center gap-3 rounded-[14px] bg-container2 px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-[background-color] duration-200 hover:bg-offwhite/2.5">
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-[11px]"
      style={{ background: hexA(color, 0.13), color }}
    >
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-lightGrey">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-mono text-[22px] leading-none font-bold tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="text-[11px] text-lightGrey/80">{sub}</span>
      </p>
    </div>
    <Spark values={spark} color={color} />
  </div>
);

const CoursesIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M4.5 6.75h15M4.5 12h15M4.5 17.25h10" />
  </svg>
);

const CreditsIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M12 3.5 3.5 12 12 20.5 20.5 12 12 3.5Zm0 3.6 4.9 4.9L12 16.9 7.1 12 12 7.1Z" />
  </svg>
);

const DeadlineIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M6.75 3.75h10.5v16.5H6.75V3.75Zm2.4 4.5h5.7M9.15 12h5.7M9.15 15.6h3" />
  </svg>
);

export const SemesterStatsContent: React.FC<Props> = ({ activeCoursesCount, semesterCredits, upcomingDeadlines }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  return (
    <div className="flex flex-col justify-center gap-2.5">
      <StatStrip
        icon={<CoursesIcon />}
        label={t('widgets.semesterStats.enrolled')}
        value={activeCoursesCount}
        sub={t('widgets.semesterStats.courses')}
        color="#5b8df6"
        spark={[2, 3, 3, 4, 5, 5]}
      />
      <StatStrip
        icon={<CreditsIcon />}
        label={t('widgets.semesterStats.credits')}
        value={semesterCredits}
        sub={t('widgets.semesterStats.thisSemester')}
        color="#52c989"
        spark={[12, 15, 18, 20, 22, 23]}
      />
      <StatStrip
        icon={<DeadlineIcon />}
        label={t('widgets.semesterStats.deadlines')}
        value={upcomingDeadlines}
        sub={t('widgets.semesterStats.upcoming')}
        color="#f0a84d"
        spark={[1, 2, 1, 3, 2, 3]}
      />
    </div>
  );
};
