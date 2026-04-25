import React from 'react';
import { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';

const CircularProgress: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--color-container2)" strokeWidth="8" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-xl font-bold text-offwhite">{total > 0 ? `${Math.round(pct * 100)}%` : '—'}</span>
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: React.ReactNode; sub: string }> = ({ label, value, sub }) => (
  <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-container2 px-4 py-2">
    <span className="text-xs text-lightGrey">{label}</span>
    <span className="text-xl leading-none font-semibold text-offwhite tabular-nums">{value}</span>
    <span className="text-xs text-lightGrey">{sub}</span>
  </div>
);

const ModuleBar: React.FC<{ name: string; done: number; target: number; color: string }> = ({
  name,
  done,
  target,
  color,
}) => {
  const pct = target > 0 ? Math.min(done / target, 1) : 0;
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-xs text-lightGrey">{name}</span>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="shink-0 w-10 text-xs text-offwhite">
          {done}/{target}
        </span>
      </div>
    </div>
  );
};

interface Props {
  creditsDone: number;
  totalTarget: number;
  gradeAverage: number | null;
  gradedCount: number;
  studyRightEnd: { year: string; until: string } | null;
  modules: ModuleProgress[];
}

export const BAR_COLORS = ['#4A7EF0', '#10B981', '#F59E0B', '#A78BFA', '#EF4444', '#06B6D4'];

export const DegreeCompletionContent: React.FC<Props> = ({
  creditsDone,
  gradeAverage,
  gradedCount,
  studyRightEnd,
  totalTarget,
  modules,
}) => (
  <div className="flex h-full items-center gap-5 overflow-hidden">
    <div className="flex flex-col items-center gap-2">
      <CircularProgress done={creditsDone} total={totalTarget} />
      <p className="text-sm">Degree Completion</p>
    </div>
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex gap-3">
        <StatItem label="Credits done" value={creditsDone} sub={totalTarget > 0 ? `of ${totalTarget} cr` : '—'} />
        <StatItem
          label="Avg. grade"
          value={gradeAverage?.toFixed(1) ?? '—'}
          sub={gradedCount > 0 ? `${gradedCount} graded` : 'none yet'}
        />
        <StatItem label="Study right" value={studyRightEnd?.year ?? '—'} sub={studyRightEnd?.until ?? ''} />
      </div>
      {modules.length > 0 && (
        <div className="flex flex-col gap-1">
          {modules.map((mod, i) => (
            <ModuleBar
              key={mod.moduleId}
              name={mod.name}
              done={mod.done}
              target={mod.target}
              color={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
