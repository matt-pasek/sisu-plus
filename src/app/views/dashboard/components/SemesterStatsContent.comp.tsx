import React from 'react';

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
  <div className="flex h-full w-full flex-col gap-0.5 rounded-xl bg-container2 p-3">
    <span className="text-xs text-lightGrey">{label}</span>
    <span className={`text-2xl leading-none font-semibold ${color}`}>{value}</span>
    <span className="text-xs text-lightGrey/50">{sub}</span>
  </div>
);

export const SemesterStatsContent: React.FC<Props> = ({ activeCoursesCount, semesterCredits, upcomingDeadlines }) => (
  <div className="grid grid-cols-2 gap-3">
    <SemesterStat label="Enrolled" value={activeCoursesCount} sub="courses" color="text-blue-400" />
    <SemesterStat label="Credits" value={semesterCredits} sub="this semester" color="text-accent" />
    <SemesterStat label="Deadlines" value={upcomingDeadlines} sub="upcoming" color="text-warn/90" />
  </div>
);
