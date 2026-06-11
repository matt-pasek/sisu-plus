import { getMoodleDeadlines } from '@/app/api/dataPoints/getMoodleDeadlines';
import { getRegistrationCourses } from '@/app/api/dataPoints/getRegistrationCourses';
import { getDashboardStats } from '@/app/api/dataPoints/getDashboardStats';
import { getActiveCourses } from '@/app/api/dataPoints/getActiveCourses';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { getStudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { getModuleColor } from '@/app/theme/moduleColors';
import { useMemo } from 'react';
import { getCreditsByPeriod, getCreditsBySemester } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getGrade, isCourseUnitAttainment } from '@/app/views/dashboard/util';
import type { DashboardCompletedCourse } from '@/app/views/dashboard/types';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { t } from 'i18next';
import { daysUntil } from '@/app/helpers/daysUntilToday';

export const useDashboardData = () => {
  const { deadlines, deadlinesLoading, missingToken } = getMoodleDeadlines();
  const { courses: registrationCourses, isLoading: registrationCoursesLoading } = getRegistrationCourses();
  const { creditsDone, gradeAverage, gradedCount, studyRightEndDate, isLoading: statsLoading } = getDashboardStats();
  const { activeCourses, isLoading: coursesLoading } = getActiveCourses();
  const { modules, totalTarget, isLoading: modulesLoading } = getCreditsByModule();
  const { data: plansQuery } = useSisuQuery(['plans'], fetchPlans);
  const selectedPlanId = plansQuery?.find((plan) => plan.primary)?.id ?? plansQuery?.[0].id;
  const { timelineCourses, isLoading: timelineLoading } = getTimelineCourses(selectedPlanId);
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const { data: completedCourses, isLoading: completedCoursesLoading } = useSisuQuery(
    ['dashboard-completed-courses'],
    async () => {
      const attainments = (await fetchAttainments())
        .filter(isCourseUnitAttainment)
        .filter((attainment) => attainment.primary && attainment.state !== 'FAILED')
        .sort((a, b) => b.attainmentDate.localeCompare(a.attainmentDate));

      return Promise.all(
        attainments.map(async (attainment): Promise<DashboardCompletedCourse> => {
          const courseUnit = await resolveCourseUnit(attainment.courseUnitId);
          return {
            id: attainment.id ?? attainment.courseUnitId,
            courseUnitId: attainment.courseUnitId,
            name: courseUnit.name ?? courseUnit.code ?? t('courses.completedCourse'),
            code: courseUnit.code,
            credits: attainment.credits,
            grade: getGrade(attainment),
            registrationDate: attainment.registrationDate,
            attainmentDate: attainment.attainmentDate,
          };
        }),
      );
    },
  );

  const semesterCredits = activeCourses.reduce((s, c) => s + (c.credits ?? 0), 0);
  const moduleColorMap = new Map(modules.map((m) => [m.moduleId, getModuleColor(m.moduleId)]));
  const moduleNameMap = new Map(modules.map((m) => [m.moduleId, m.name]));
  const periodSummaries = useMemo(
    () => getCreditsByPeriod(timelineCourses, studyPeriodMap),
    [studyPeriodMap, timelineCourses],
  );
  const semesterSummaries = useMemo(() => getCreditsBySemester(periodSummaries), [periodSummaries]);
  const upcomingDeadlines = deadlines?.events
    ? Object.values(deadlines.events).filter((ev) => ev.end?.date && daysUntil(ev.end?.date) <= 5).length
    : 0;

  return {
    activeCourses,
    completedCourses,
    completedCoursesLoading,
    coursesLoading,
    creditsDone,
    deadlines,
    deadlinesLoading,
    gradeAverage,
    gradedCount,
    missingToken,
    moduleColorMap,
    moduleNameMap,
    modules,
    modulesLoading,
    periodsLoading,
    periodSummaries,
    registrationCourses,
    registrationCoursesLoading,
    selectedPlanId,
    semesterCredits,
    semesterSummaries,
    statsLoading,
    studyRightEndDate,
    timelineCourses,
    timelineLoading,
    totalTarget,
    upcomingDeadlines,
  };
};
