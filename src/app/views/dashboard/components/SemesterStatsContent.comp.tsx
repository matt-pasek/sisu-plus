import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  activeCoursesCount: number;
  semesterCredits: number;
  upcomingDeadlines: number;
}

const SemesterStat: React.FC<{ label: string; value: React.ReactNode; sub: string; color?: string }> = ({
  label,
  value,
  sub,
  color = 'text-offwhite',
}) => (
  <div className="flex h-full w-full flex-col gap-1 rounded-xl bg-container2 p-3">
    <span className="text-xs text-lightGrey">{label}</span>
    <span className={`text-2xl leading-none font-semibold tabular-nums ${color}`}>{value}</span>
    <span className="text-xs text-lightGrey/50">{sub}</span>
  </div>
);

export const SemesterStatsContent: React.FC<Props> = ({ activeCoursesCount, semesterCredits, upcomingDeadlines }) => (
  <SemesterStatsInner
    activeCoursesCount={activeCoursesCount}
    semesterCredits={semesterCredits}
    upcomingDeadlines={upcomingDeadlines}
  />
);

const SemesterStatsInner: React.FC<Props> = ({ activeCoursesCount, semesterCredits, upcomingDeadlines }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  return (
    <div className="grid grid-cols-3 gap-3">
      <SemesterStat
        label={t('widgets.semesterStats.enrolled')}
        value={activeCoursesCount}
        sub={t('widgets.semesterStats.courses')}
        color="text-blue-400"
      />
      <SemesterStat
        label={t('widgets.semesterStats.credits')}
        value={semesterCredits}
        sub={t('widgets.semesterStats.thisSemester')}
        color="text-accent"
      />
      <SemesterStat
        label={t('widgets.semesterStats.deadlines')}
        value={upcomingDeadlines}
        sub={t('widgets.semesterStats.upcoming')}
        color="text-warn/90"
      />
    </div>
  );
};
