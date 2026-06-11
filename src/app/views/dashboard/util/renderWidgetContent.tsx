import React from 'react';
import { type DashboardCompletedCourse, DashboardWidgetId } from '@/app/views/dashboard/types';
import { MoodleMissingToken } from '@/app/views/dashboard/components/MoodleMissingToken.comp';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { MoodleDeadlinesContent } from '@/app/views/dashboard/components/widget/contents/MoodleDeadlinesContent.comp';
import { DegreeCompletionContent } from '@/app/views/dashboard/components/widget/contents/DegreeCompletionContent.comp';
import { ActiveCoursesContent } from '@/app/views/dashboard/components/widget/contents/ActiveCoursesContent.comp';
import { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { SemesterStatsContent } from '@/app/views/dashboard/components/widget/contents/SemesterStatsContent.comp';
import { GradeTrendContent } from '@/app/views/dashboard/components/widget/contents/GradeTrendContent.comp';
import { CreditsVelocityContent } from '@/app/views/dashboard/components/widget/contents/CreditsVelocityContent.comp';
import { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import { IcsCalendar } from 'ts-ics';
import { ActiveCourse } from '@/app/api/dataPoints/getActiveCourses';
import { TimelinePeekContent } from '@/app/views/dashboard/components/widget/contents/TimelinePeekContent.comp';
import { RecentAchievementsContent } from '@/app/views/dashboard/components/widget/contents/RecentAchievementsContent.comp';
import { WorkloadForecastContent } from '@/app/views/dashboard/components/widget/contents/WorkloadForecastContent.comp';
import { GradeDonutContent } from '@/app/views/dashboard/components/widget/contents/GradeDonutContent.comp';
import { CreditPaceContent } from '@/app/views/dashboard/components/widget/contents/CreditPaceContent.comp';
import { NextExamContent } from '@/app/views/dashboard/components/widget/contents/NextExamContent.comp';
import { UpcomingRegistrationsContent } from '@/app/views/dashboard/components/widget/contents/UpcomingRegistrationsContent.comp';
import { CourseMapContent } from '@/app/views/dashboard/components/widget/contents/CourseMapContent.comp';
import { PeriodCreditSummary, SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';

export interface WidgetContentContext {
  activeCourses: ActiveCourse[];
  completedCourses: DashboardCompletedCourse[] | undefined;
  completedCoursesLoading: boolean;
  coursesLoading: boolean;
  creditsDone: number;
  deadlines: IcsCalendar | undefined;
  deadlinesLoading: boolean;
  missingToken: boolean | undefined;
  moduleColorMap: Map<string, string>;
  moduleNameMap: Map<string, string>;
  modules: ModuleProgress[];
  modulesLoading: boolean;
  periodsLoading: boolean;
  periodSummaries: PeriodCreditSummary[];
  registrationCourses: RegistrationCourse[];
  registrationCoursesLoading: boolean;
  semesterCredits: number;
  semesterSummaries: SemesterCreditSummary[];
  statsLoading: boolean;
  studyRightEndDate: string | null;
  totalTarget: number;
  timelineCourses: TimelineCourse[];
  timelineLoading: boolean;
  upcomingDeadlines: number;
}

const WIDGETS: Record<
  DashboardWidgetId,
  {
    loading: (ctx: WidgetContentContext) => boolean;
    render: (ctx: WidgetContentContext) => React.ReactNode;
  }
> = {
  'degree-completion': {
    loading: (ctx) => ctx.statsLoading || ctx.modulesLoading,
    render: (ctx) => (
      <DegreeCompletionContent creditsDone={ctx.creditsDone} modules={ctx.modules} totalTarget={ctx.totalTarget} />
    ),
  },
  'moodle-deadlines': {
    loading: (ctx) => ctx.deadlinesLoading,
    render: (ctx) => (ctx.missingToken ? <MoodleMissingToken /> : <MoodleDeadlinesContent deadlines={ctx.deadlines} />),
  },
  'active-courses': {
    loading: (ctx) => ctx.coursesLoading,
    render: (ctx) => (
      <ActiveCoursesContent
        activeCourses={ctx.activeCourses}
        moduleColorMap={ctx.moduleColorMap}
        moduleNameMap={ctx.moduleNameMap}
      />
    ),
  },
  'semester-stats': {
    loading: (ctx) => ctx.statsLoading || ctx.coursesLoading,
    render: (ctx) => (
      <SemesterStatsContent
        activeCoursesCount={ctx.activeCourses.length}
        semesterCredits={ctx.semesterCredits}
        upcomingDeadlines={ctx.upcomingDeadlines}
      />
    ),
  },
  'grade-trend': {
    loading: (ctx) => ctx.completedCoursesLoading,
    render: (ctx) => <GradeTrendContent courses={ctx.completedCourses ?? []} />,
  },
  'credits-velocity': {
    loading: (ctx) => ctx.timelineLoading || ctx.periodsLoading,
    render: (ctx) => <CreditsVelocityContent semesters={ctx.semesterSummaries} />,
  },
  'timeline-peek': {
    loading: (ctx) => ctx.timelineLoading || ctx.periodsLoading,
    render: (ctx) => <TimelinePeekContent periods={ctx.periodSummaries} />,
  },
  'recent-achievements': {
    loading: (ctx) => ctx.completedCoursesLoading,
    render: (ctx) => <RecentAchievementsContent courses={ctx.completedCourses ?? []} />,
  },
  'workload-forecast': {
    loading: (ctx) => ctx.timelineLoading || ctx.periodsLoading,
    render: (ctx) => <WorkloadForecastContent periods={ctx.periodSummaries} />,
  },
  'grade-donut': {
    loading: (ctx) => ctx.completedCoursesLoading,
    render: (ctx) => <GradeDonutContent courses={ctx.completedCourses ?? []} />,
  },
  'credit-pace': {
    loading: (ctx) => ctx.statsLoading,
    render: (ctx) => (
      <CreditPaceContent
        creditsDone={ctx.creditsDone}
        totalTarget={ctx.totalTarget}
        studyRightEndDate={ctx.studyRightEndDate}
      />
    ),
  },
  'next-exam': {
    loading: (ctx) => ctx.registrationCoursesLoading,
    render: (ctx) => <NextExamContent courses={ctx.registrationCourses} />,
  },
  'upcoming-registrations': {
    loading: (ctx) => ctx.registrationCoursesLoading,
    render: (ctx) => <UpcomingRegistrationsContent courses={ctx.registrationCourses} />,
  },
  'course-map': {
    loading: (ctx) => ctx.timelineLoading || ctx.modulesLoading,
    render: (ctx) => <CourseMapContent timelineCourses={ctx.timelineCourses} modules={ctx.modules} />,
  },
};

export const renderWidgetContent = (id: DashboardWidgetId, ctx: WidgetContentContext): React.ReactNode => {
  const { loading, render } = WIDGETS[id];
  return loading(ctx) ? <InlineLoader /> : render(ctx);
};
