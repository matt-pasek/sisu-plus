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

export const renderWidgetContent = (id: DashboardWidgetId, ctx: WidgetContentContext): React.ReactNode => {
  const {
    activeCourses,
    completedCourses = [],
    completedCoursesLoading,
    coursesLoading,
    creditsDone,
    deadlines,
    deadlinesLoading,
    missingToken,
    moduleColorMap,
    moduleNameMap,
    modules,
    modulesLoading,
    periodsLoading,
    periodSummaries,
    registrationCourses,
    registrationCoursesLoading,
    semesterCredits,
    semesterSummaries,
    statsLoading,
    studyRightEndDate,
    timelineCourses,
    timelineLoading,
    totalTarget,
    upcomingDeadlines,
  } = ctx;

  switch (id) {
    case 'degree-completion':
      return statsLoading || modulesLoading ? (
        <InlineLoader />
      ) : (
        <DegreeCompletionContent creditsDone={creditsDone} modules={modules} totalTarget={totalTarget} />
      );
    case 'moodle-deadlines':
      if (deadlinesLoading) return <InlineLoader />;
      if (missingToken) return <MoodleMissingToken />;
      return <MoodleDeadlinesContent deadlines={deadlines} />;
    case 'active-courses':
      return coursesLoading ? (
        <InlineLoader />
      ) : (
        <ActiveCoursesContent
          activeCourses={activeCourses}
          moduleColorMap={moduleColorMap}
          moduleNameMap={moduleNameMap}
        />
      );
    case 'semester-stats':
      return statsLoading || coursesLoading ? (
        <InlineLoader />
      ) : (
        <SemesterStatsContent
          activeCoursesCount={activeCourses.length}
          semesterCredits={semesterCredits}
          upcomingDeadlines={upcomingDeadlines}
        />
      );
    case 'grade-trend':
      return completedCoursesLoading ? <InlineLoader /> : <GradeTrendContent courses={completedCourses} />;
    case 'credits-velocity':
      return timelineLoading || periodsLoading ? (
        <InlineLoader />
      ) : (
        <CreditsVelocityContent semesters={semesterSummaries} />
      );
    case 'timeline-peek':
      return timelineLoading || periodsLoading ? <InlineLoader /> : <TimelinePeekContent periods={periodSummaries} />;
    case 'recent-achievements':
      return completedCoursesLoading ? <InlineLoader /> : <RecentAchievementsContent courses={completedCourses} />;
    case 'workload-forecast':
      return timelineLoading || periodsLoading ? (
        <InlineLoader />
      ) : (
        <WorkloadForecastContent periods={periodSummaries} />
      );
    case 'grade-donut':
      return completedCoursesLoading ? <InlineLoader /> : <GradeDonutContent courses={completedCourses} />;
    case 'credit-pace':
      return statsLoading ? (
        <InlineLoader />
      ) : (
        <CreditPaceContent creditsDone={creditsDone} totalTarget={totalTarget} studyRightEndDate={studyRightEndDate} />
      );
    case 'next-exam':
      return registrationCoursesLoading ? <InlineLoader /> : <NextExamContent courses={registrationCourses} />;
    case 'upcoming-registrations':
      return registrationCoursesLoading ? (
        <InlineLoader />
      ) : (
        <UpcomingRegistrationsContent courses={registrationCourses} />
      );
    case 'course-map':
      return timelineLoading || modulesLoading ? (
        <InlineLoader />
      ) : (
        <CourseMapContent timelineCourses={timelineCourses} modules={modules} />
      );
  }
};
