import React from 'react';
import { Widget } from '@/app/views/dashboard/components/Widget.comp';
import { getDashboardStats } from '@/app/api/dataPoints/getDashboardStats';
import { getActiveCourses } from '@/app/api/dataPoints/getActiveCourses';
import { getCreditsByModule } from '@/app/api/dataPoints/getCreditsByModule';
import { Button } from '@/app/components/ui/Button.comp';
import { getMoodleDeadlines } from '@/app/api/dataPoints/getMoodleDeadlines';
import { MoodleDeadlinesContent } from '@/app/views/dashboard/components/MoodleDeadlinesContent.comp';
import { daysUntil } from '@/app/helpers/daysUntilToday';
import { SemesterStatsContent } from '@/app/views/dashboard/components/SemesterStatsContent.comp';
import { BAR_COLORS, DegreeCompletionContent } from '@/app/views/dashboard/components/DegreeCompletionContent.comp';
import { ActiveCoursesContent } from '@/app/views/dashboard/components/ActiveCoursesContent.comp';

function getCurrentPeriodLabel(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `Autumn ${y} · ${m >= 11 ? '2nd' : '1st'} Period ongoing`;
  if (m >= 6) return `Summer ${y}`;
  if (m >= 3) return `Spring ${y} · 4th Period ongoing`;
  return `Spring ${y} · 3rd Period ongoing`;
}

function getCurrentSemester(): string {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `Autumn ${y}`;
  if (m >= 6) return `Summer ${y}`;
  return `Spring ${y}`;
}

function formatStudyRightEnd(endDate: string | null): { year: string; until: string } | null {
  if (!endDate) return null;
  const d = new Date(endDate);
  d.setDate(d.getDate() - 1);
  return {
    year: d.getFullYear().toString(),
    until: `until ${d.toLocaleString('en-US', { month: 'long' })}`,
  };
}

const DashboardView: React.FC = () => {
  const { deadlines, deadlinesLoading } = getMoodleDeadlines();
  const { creditsDone, gradeAverage, gradedCount, studyRightEndDate, isLoading: statsLoading } = getDashboardStats();
  const { activeCourses, isLoading: coursesLoading } = getActiveCourses();
  const { modules, totalTarget, isLoading: modulesLoading } = getCreditsByModule();
  const studyRightEnd = formatStudyRightEnd(studyRightEndDate);
  const semesterCredits = activeCourses.reduce((s, c) => s + (c.credits ?? 0), 0);

  const moduleColorMap = new Map(modules.map((m, i) => [m.moduleId, BAR_COLORS[i % BAR_COLORS.length]]));
  const moduleNameMap = new Map(modules.map((m) => [m.moduleId, m.name]));
  const upcomingDeadlines = deadlines?.events
    ? Object.values(deadlines.events).filter((ev) => ev.end?.date && daysUntil(ev.end?.date) <= 5).length
    : 0;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-offwhite">Dashboard</h1>
          <p className="mt-0.5 text-sm text-lightGrey">{getCurrentPeriodLabel()}</p>
        </div>

        <Button
          disabled
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          }
        >
          Customize Dashboard
        </Button>
      </div>

      <div className="grid h-[800px] w-full grid-cols-10 grid-rows-10 gap-4">
        <div className="col-span-7 row-span-4 flex flex-col gap-3">
          <Widget loading={statsLoading || modulesLoading}>
            <DegreeCompletionContent
              totalTarget={totalTarget}
              studyRightEnd={studyRightEnd}
              gradedCount={gradedCount}
              gradeAverage={gradeAverage}
              creditsDone={creditsDone}
              modules={modules}
            />
          </Widget>
        </div>

        <div className="col-span-3 row-span-5 flex flex-col gap-3">
          <Widget
            header={
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-offwhite">Moodle Deadlines</span>
                <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-red-400">
                  LIVE
                </span>
              </div>
            }
            loading={deadlinesLoading}
          >
            <MoodleDeadlinesContent deadlines={deadlines} />
          </Widget>
        </div>

        <div className="col-span-7 row-span-4 flex flex-col gap-3">
          <Widget
            header={
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-offwhite">Active Courses</span>
                <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {getCurrentSemester()}
                </span>
              </div>
            }
            loading={coursesLoading}
          >
            <ActiveCoursesContent
              activeCourses={activeCourses}
              moduleColorMap={moduleColorMap}
              moduleNameMap={moduleNameMap}
            />
          </Widget>
        </div>

        <div className="col-span-3 row-span-4 flex flex-col gap-3">
          <Widget
            header={<span className="text-sm font-medium text-offwhite">This Semester</span>}
            loading={statsLoading || coursesLoading}
          >
            <SemesterStatsContent
              semesterCredits={semesterCredits}
              activeCoursesCount={activeCourses.length}
              upcomingDeadlines={upcomingDeadlines}
            />
          </Widget>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
