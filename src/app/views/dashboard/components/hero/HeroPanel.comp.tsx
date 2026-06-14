import React from 'react';
import { type IcsCalendar } from 'ts-ics';
import type { DashboardCompletedCourse, HeroPanelId } from '@/app/views/dashboard/types';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { Upcoming } from '@/app/views/dashboard/components/hero/panels/Upcoming.comp';
import { GradeTrend } from '@/app/views/dashboard/components/hero/panels/GradeTrend.comp';
import { CreditVelocity } from '@/app/views/dashboard/components/hero/panels/CreditVelocity.comp';
import { CreditTrajectory } from '@/app/views/dashboard/components/hero/panels/CreditTrajectory.comp';
import { Ring } from '@/app/views/dashboard/components/hero/panels/Ring.comp';

interface Props {
  mode: HeroPanelId;
  done: number;
  total: number;
  deadlines?: IcsCalendar;
  completedCourses?: DashboardCompletedCourse[];
  semesters?: SemesterCreditSummary[];
  gradeAverage: number | null;
}

export const HeroPanel: React.FC<Props> = ({
  mode,
  done,
  total,
  deadlines,
  completedCourses,
  semesters,
  gradeAverage,
}) => {
  switch (mode) {
    case 'upcoming':
      return <Upcoming deadlines={deadlines} />;
    case 'grade-trend':
      return <GradeTrend courses={completedCourses} gradeAverage={gradeAverage} />;
    case 'credit-velocity':
      return <CreditVelocity semesters={semesters} done={done} />;
    case 'credit-trajectory':
      return <CreditTrajectory done={done} total={total} semesters={semesters} />;
    case 'ring':
    default:
      return <Ring done={done} total={total} />;
  }
};
