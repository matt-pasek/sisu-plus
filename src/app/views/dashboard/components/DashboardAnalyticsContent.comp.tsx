import React from 'react';
import { useNavigate } from 'react-router';
import type { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { formatCredits, getModuleColor, getSemesterTitle } from '@/app/views/timeline/components/timelineUtils';

export interface DashboardCompletedCourse {
  id: string;
  courseUnitId: string;
  name: string;
  code: string | null;
  credits: number;
  grade: number | string | null;
  registrationDate: string;
}

function formatCompactDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatDays(days: number | null): string {
  if (days == null) return '-';
  return new Intl.NumberFormat('en-US').format(Math.max(days, 0));
}

function getNumericGrade(course: DashboardCompletedCourse): number | null {
  return typeof course.grade === 'number' ? course.grade : null;
}

function getTrendLine(points: { x: number; y: number }[]): { x1: number; y1: number; x2: number; y2: number } | null {
  if (points.length < 2) return null;
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return {
    x1: 0,
    y1: intercept,
    x2: 1,
    y2: slope + intercept,
  };
}

export const GradeTrendContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => {
  const graded = courses
    .filter((course) => getNumericGrade(course) != null && course.registrationDate)
    .sort((a, b) => a.registrationDate.localeCompare(b.registrationDate));
  const minDate = Math.min(...graded.map((course) => new Date(course.registrationDate).getTime()));
  const maxDate = Math.max(...graded.map((course) => new Date(course.registrationDate).getTime()));
  const range = Math.max(maxDate - minDate, 1);
  const points = graded.map((course) => {
    const x = (new Date(course.registrationDate).getTime() - minDate) / range;
    const y = (getNumericGrade(course) ?? 1) / 5;
    return { course, x, y };
  });
  const trend = getTrendLine(points.map((point) => ({ x: point.x, y: point.y })));
  const firstGrade = graded[0] ? getNumericGrade(graded[0]) : null;
  const lastGrade = graded[graded.length - 1] ? getNumericGrade(graded[graded.length - 1]) : null;
  const trendLabel = firstGrade != null && lastGrade != null ? lastGrade - firstGrade : null;

  if (graded.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">More graded courses needed.</div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-lightGrey">Credit-weighted grades over time</p>
          <p className="text-xl font-semibold text-offwhite tabular-nums">
            {trendLabel == null ? '-' : trendLabel >= 0 ? `+${trendLabel.toFixed(1)}` : trendLabel.toFixed(1)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            trendLabel != null && trendLabel >= 0 ? 'bg-lighterGreen/10 text-lighterGreen' : 'bg-danger/10 text-danger'
          }`}
        >
          {trendLabel != null && trendLabel >= 0 ? 'Improving' : 'Watch pace'}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <svg aria-label="Grade trend chart" className="h-full w-full" role="img" viewBox="0 0 320 170">
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
              <title>{`${point.course.name} · grade ${point.course.grade} · ${formatCredits(point.course.credits)}`}</title>
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

export const CreditsVelocityContent: React.FC<{ semesters: SemesterCreditSummary[] }> = ({ semesters }) => {
  const visible = semesters
    .filter((semester) => semester.completedCredits > 0 || semester.plannedCredits > 0)
    .slice(-6);
  const maxCredits = Math.max(...visible.map((semester) => semester.completedCredits + semester.plannedCredits), 1);

  return (
    <div className="flex h-full flex-col gap-2">
      {visible.map((semester) => (
        <div
          key={`${semester.studyYear}:${semester.termName}`}
          className="grid grid-cols-[92px_1fr_56px] items-center gap-3"
        >
          <span className="truncate text-xs font-medium text-lightGrey">{getSemesterTitle(semester)}</span>
          <div className="flex h-6 overflow-hidden rounded-full bg-background/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div
              className="bg-lighterGreen transition-[width] duration-300"
              style={{ width: `${(semester.completedCredits / maxCredits) * 100}%` }}
            />
            <div
              className="bg-blue-400/35 transition-[width] duration-300"
              style={{ width: `${(semester.plannedCredits / maxCredits) * 100}%` }}
            />
          </div>
          <span className="text-right font-mono text-xs text-offwhite tabular-nums">
            {Math.round(semester.completedCredits + semester.plannedCredits)} cr
          </span>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-4 text-[11px] text-lightGrey">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-lighterGreen" /> completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-blue-400/45" /> planned
        </span>
      </div>
    </div>
  );
};

export const TimelinePeekContent: React.FC<{
  moduleIds: string[];
  periods: PeriodCreditSummary[];
}> = ({ moduleIds, periods }) => {
  const navigate = useNavigate();
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now && period.courses.some((course) => !course.isPassed))
    .slice(0, 3);

  return (
    <button
      className="-m-1 flex h-[calc(100%+8px)] w-full cursor-pointer flex-col gap-2 rounded-xl p-1 text-left transition-[background-color,transform] duration-200 active:scale-[0.96]"
      onClick={() => navigate('/student/plan')}
      type="button"
    >
      {upcoming.map((period) => (
        <div
          key={period.periodLocator}
          className="rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-offwhite">{period.period.name}</p>
            <span className="font-mono text-xs text-lightGrey">{formatCredits(period.plannedCredits)}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {period.courses
              .filter((course) => !course.isPassed)
              .slice(0, 3)
              .map((course) => {
                const color = getModuleColor(course.moduleId, moduleIds);
                return (
                  <div key={course.courseUnitId} className="min-w-0 rounded-lg bg-container2 px-2 py-1.5">
                    <p className="truncate text-xs font-semibold text-offwhite">{course.courseName ?? 'Course'}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px]" style={{ color }}>
                        {course.moduleName ?? 'No module'}
                      </span>
                      <span className="font-mono text-[10px] text-lightGrey">{formatCredits(course.credits)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
      {upcoming.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-lightGrey">
          No upcoming planned courses.
        </div>
      )}
    </button>
  );
};

export const RecentAchievementsContent: React.FC<{ courses: DashboardCompletedCourse[] }> = ({ courses }) => (
  <div className="-mx-4 -my-2">
    {courses.slice(0, 8).map((course) => (
      <div key={course.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-2.5 last:border-0">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
            typeof course.grade === 'number' && course.grade >= 4
              ? 'bg-lighterGreen/10 text-lighterGreen'
              : 'bg-blue-400/10 text-blue-300'
          }`}
        >
          {course.grade ?? '✓'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-offwhite">{course.name}</p>
          <p className="text-xs text-lightGrey">{formatCompactDate(course.registrationDate)}</p>
        </div>
        <span className="font-mono text-xs text-lightGrey">{formatCredits(course.credits)}</span>
      </div>
    ))}
    {courses.length === 0 && (
      <div className="flex items-center justify-center py-10 text-sm text-lightGrey">No completed courses yet.</div>
    )}
  </div>
);

export const WorkloadForecastContent: React.FC<{ periods: PeriodCreditSummary[] }> = ({ periods }) => {
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now)
    .filter((period) => period.plannedCredits > 0 || period.period.visibleByDefault)
    .slice(0, 6);
  const maxCredits = Math.max(...upcoming.map((period) => period.plannedCredits), 1);

  return (
    <div className="flex h-full items-end gap-2">
      {upcoming.map((period) => (
        <div key={period.periodLocator} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
          <div className="flex min-h-0 flex-1 items-end rounded-lg bg-background/45 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div
              className={`w-full rounded-md transition-[height] duration-300 ${
                period.plannedCredits >= 15 ? 'bg-danger' : period.plannedCredits >= 10 ? 'bg-warn' : 'bg-blue-400'
              }`}
              style={{ height: `${Math.max((period.plannedCredits / maxCredits) * 100, 8)}%` }}
              title={`${period.period.name}: ${formatCredits(period.plannedCredits)}`}
            />
          </div>
          <div>
            <p className="truncate text-center text-[10px] font-medium text-lightGrey">{period.period.name}</p>
            <p className="text-center font-mono text-[10px] text-offwhite tabular-nums">
              {formatCredits(period.plannedCredits)}
            </p>
          </div>
        </div>
      ))}
      {upcoming.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-lightGrey">Nothing planned ahead.</div>
      )}
    </div>
  );
};

export const GraduationCountdownContent: React.FC<{
  creditsDone: number;
  semesters: SemesterCreditSummary[];
  totalTarget: number;
}> = ({ creditsDone, semesters, totalTarget }) => {
  const creditsRemaining = Math.max(totalTarget - creditsDone, 0);
  const plannedGraduationDate =
    semesters
      .filter((semester) => semester.plannedCredits > 0)
      .flatMap((semester) => semester.periods)
      .reduce<string | null>((latestDate, period) => {
        if (latestDate == null) return period.period.endDate;
        return period.period.endDate > latestDate ? period.period.endDate : latestDate;
      }, null) ?? null;
  const daysRemaining = plannedGraduationDate
    ? Math.ceil((new Date(plannedGraduationDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const creditsPerDay = daysRemaining && daysRemaining > 0 ? creditsRemaining / daysRemaining : null;
  const intense = creditsPerDay != null && creditsPerDay > 0.08;

  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <div className="rounded-xl bg-container2 p-3">
        <p className="text-xs text-lightGrey">Credits left</p>
        <p className="mt-1 text-2xl font-semibold text-offwhite tabular-nums">{creditsRemaining}</p>
      </div>
      <div className="rounded-xl bg-container2 p-3">
        <p className="text-xs text-lightGrey">Days left</p>
        <p className="mt-1 text-2xl font-semibold text-offwhite tabular-nums">{formatDays(daysRemaining)}</p>
      </div>
      <div className="col-span-2 rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-lightGrey">Credits/day needed</span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${intense ? 'text-danger' : 'text-lighterGreen'}`}
          >
            {creditsPerDay == null ? '-' : creditsPerDay.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
