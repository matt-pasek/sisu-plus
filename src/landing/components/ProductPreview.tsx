import { Widget } from '@/app/views/dashboard/components/Widget.comp';
import { BAR_COLORS, DegreeCompletionContent } from '@/app/views/dashboard/components/DegreeCompletionContent.comp';
import { ActiveCoursesContent } from '@/app/views/dashboard/components/ActiveCoursesContent.comp';
import { SemesterStatsContent } from '@/app/views/dashboard/components/SemesterStatsContent.comp';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import type { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import type { ActiveCourse } from '@/app/api/dataPoints/getActiveCourses';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useState } from 'react';

const modules: ModuleProgress[] = [
  { moduleId: 'core', name: 'Core Studies', done: 25, target: 31 },
  { moduleId: 'skills', name: 'Skill Studies', done: 6, target: 19 },
  { moduleId: 'major', name: 'Major Studies', done: 9, target: 103 },
  { moduleId: 'minor', name: 'Minor Studies', done: 6, target: 31 },
  { moduleId: 'optional', name: 'Optional Studies', done: 6, target: 9 },
];

const activeCourses: ActiveCourse[] = [
  {
    id: 'course-101',
    courseUnitId: 'course-101',
    courseCode: 'COURSE101',
    courseName: 'Core Course A',
    name: 'Core Course A',
    credits: 3,
    grade: null,
    isPassed: false,
    moduleId: 'major',
  },
  {
    id: 'course-202',
    courseUnitId: 'course-202',
    courseCode: 'COURSE202',
    courseName: 'Project Course B',
    name: 'Project Course B',
    credits: 6,
    grade: null,
    isPassed: false,
    moduleId: 'major',
  },
  {
    id: 'course-303',
    courseUnitId: 'course-303',
    courseCode: 'COURSE303',
    courseName: 'Methods Course C',
    name: 'Methods Course C',
    credits: 3,
    grade: null,
    isPassed: false,
    moduleId: 'core',
  },
  {
    id: 'course-404',
    courseUnitId: 'course-404',
    courseCode: 'COURSE404',
    courseName: 'Orientation Course D',
    name: 'Orientation Course D',
    credits: 1,
    grade: 5,
    isPassed: true,
    moduleId: 'core',
  },
];

const timelineCourses: TimelineCourse[] = [
  {
    courseUnitId: 'course-101',
    courseUnitGroupId: null,
    courseCode: 'COURSE101',
    courseName: 'Core Course A',
    credits: 3,
    moduleId: 'major',
    moduleName: 'Major Studies',
    plannedPeriods: [],
    completionPeriod: null,
    attainmentDate: null,
    isPassed: false,
    grade: null,
    isEnrolled: true,
    parentModuleId: null,
    teachingPeriodLocators: [],
  },
  {
    courseUnitId: 'course-202',
    courseUnitGroupId: null,
    courseCode: 'COURSE202',
    courseName: 'Project Course B',
    credits: 6,
    moduleId: 'major',
    moduleName: 'Major Studies',
    plannedPeriods: [],
    completionPeriod: null,
    attainmentDate: null,
    isPassed: false,
    grade: null,
    isEnrolled: false,
    parentModuleId: null,
    teachingPeriodLocators: [],
  },
  {
    courseUnitId: 'course-303',
    courseUnitGroupId: null,
    courseCode: 'COURSE303',
    courseName: 'Methods Course C',
    credits: 3,
    moduleId: 'core',
    moduleName: 'Core Studies',
    plannedPeriods: [],
    completionPeriod: null,
    attainmentDate: null,
    isPassed: true,
    grade: 5,
    isEnrolled: false,
    parentModuleId: null,
    teachingPeriodLocators: [],
  },
  {
    courseUnitId: 'course-404',
    courseUnitGroupId: null,
    courseCode: 'COURSE404',
    courseName: 'Planning Course D',
    credits: 6,
    moduleId: 'major',
    moduleName: 'Major Studies',
    plannedPeriods: [],
    completionPeriod: null,
    attainmentDate: null,
    isPassed: false,
    grade: null,
    isEnrolled: false,
    parentModuleId: null,
    teachingPeriodLocators: [],
  },
];

const deadlines = [
  { course: 'Core Course A', title: 'Weekly task', due: 'Apr 28', urgency: 'soon' },
  { course: 'Methods Course C', title: 'Exercise set', due: 'May 3', urgency: 'normal' },
  { course: 'Project Course B', title: 'Project checkpoint', due: 'May 10', urgency: 'normal' },
];

const moduleColorMap = new Map(
  modules.map((module, index) => [module.moduleId, BAR_COLORS[index % BAR_COLORS.length]]),
);
const moduleNameMap = new Map(modules.map((module) => [module.moduleId, module.name]));

function DeadlinesPreview() {
  return (
    <div className="flex h-full flex-col gap-2">
      {deadlines.map((deadline) => (
        <div
          key={`${deadline.course}:${deadline.title}`}
          className={`rounded-lg border px-2.5 py-2 ${
            deadline.urgency === 'soon' ? 'border-warn/20 bg-warn/15' : 'border-border2 bg-container2'
          }`}
        >
          <p className="line-clamp-1 text-xs font-medium text-offwhite">
            {deadline.course} - {deadline.title}
          </p>
          <p className={`mt-1 text-xs ${deadline.urgency === 'soon' ? 'text-warn' : 'text-lightGrey'}`}>
            Due {deadline.due}
          </p>
        </div>
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="grid h-full min-h-[520px] grid-cols-10 grid-rows-10 gap-3">
      <div className="col-span-7 row-span-4 flex min-w-0">
        <Widget>
          <DegreeCompletionContent
            creditsDone={52}
            gradeAverage={4.1}
            gradedCount={13}
            modules={modules}
            studyRightEnd={{ year: '2032', until: 'until July' }}
            totalTarget={180}
          />
        </Widget>
      </div>

      <div className="col-span-3 row-span-5 flex min-w-0">
        <Widget
          header={
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-offwhite">Moodle Deadlines</span>
              <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-danger">
                LIVE
              </span>
            </div>
          }
        >
          <DeadlinesPreview />
        </Widget>
      </div>

      <div className="col-span-7 row-span-4 flex min-w-0">
        <Widget
          header={
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-offwhite">Active Courses</span>
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                Spring 2026
              </span>
            </div>
          }
        >
          <ActiveCoursesContent
            activeCourses={activeCourses}
            moduleColorMap={moduleColorMap}
            moduleNameMap={moduleNameMap}
          />
        </Widget>
      </div>

      <div className="col-span-3 row-span-4 flex min-w-0">
        <Widget header={<span className="text-sm font-medium text-offwhite">This Semester</span>}>
          <SemesterStatsContent activeCoursesCount={13} semesterCredits={49} upcomingDeadlines={3} />
        </Widget>
      </div>
    </div>
  );
}

function TimelinePreview() {
  const periods = ['Period 3', 'Period 4', 'Summer', 'Period 1'];

  return (
    <div className="h-full min-h-[520px] rounded-2xl border border-border bg-background/80 p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-offwhite">Timeline</h3>
          <p className="text-sm text-lightGrey">Drag courses, check credits, then confirm back to Sisu.</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-lg border border-border bg-container px-3 py-2 text-xs text-lightGrey">Reset</span>
          <span className="rounded-lg border border-accent bg-accent/20 px-3 py-2 text-xs font-medium text-accent">
            Confirm
          </span>
        </div>
      </div>

      <div className="grid h-[430px] grid-cols-4 gap-3">
        {periods.map((period, periodIndex) => (
          <div key={period} className="flex min-w-0 flex-col rounded-xl border border-border bg-container p-3">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-offwhite">{period}</p>
                <p className="text-xs text-lightGrey">{periodIndex === 2 ? 'Jun - Aug' : 'Mar - May'}</p>
              </div>
              <span className="font-mono text-xs text-lightGrey">{periodIndex === 1 ? '12 cr' : '9 cr'}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-lg border border-dashed border-border bg-background/45 p-2">
              {timelineCourses
                .filter((_, courseIndex) => courseIndex % periods.length === periodIndex)
                .map((course) => (
                  <TimelineCourseCard
                    key={course.courseUnitId}
                    compact
                    course={course}
                    color={moduleColorMap.get(course.moduleId ?? '') ?? '#7878a0'}
                    className="min-h-[92px]"
                  />
                ))}
              {periodIndex === 1 && (
                <TimelineCourseCard
                  compact
                  course={timelineCourses[3]}
                  color={moduleColorMap.get('major') ?? '#7878a0'}
                  className="min-h-[92px]"
                  isDraft
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline'>('dashboard');
  const previewUrl =
    activeTab === 'dashboard' ? 'sisu.university.fi/student/frontpage' : 'sisu.university.fi/student/plan/timing';

  return (
    <div className="landing-browser">
      <div className="landing-browser-bar">
        <span className="landing-window-dot bg-danger" />
        <span className="landing-window-dot bg-warn" />
        <span className="landing-window-dot bg-lighterGreen" />
        <span className="landing-browser-url">{previewUrl}</span>
      </div>
      <div className="landing-preview-stage">
        <div className="landing-preview-scale">
          <div className="landing-product-shell">
            <div className="landing-product-nav">
              <div className="flex items-center gap-2 font-semibold text-offwhite">
                <span className="h-2 w-2 rounded-full bg-lighterGreen" />
                SISU<span className="text-lighterGreen">+</span>
              </div>
              <div className="landing-product-tabs">
                <button
                  aria-pressed={activeTab === 'dashboard'}
                  className="landing-product-tab"
                  onClick={() => setActiveTab('dashboard')}
                  type="button"
                >
                  Dashboard
                </button>
                <button
                  aria-pressed={activeTab === 'timeline'}
                  className="landing-product-tab"
                  onClick={() => setActiveTab('timeline')}
                  type="button"
                >
                  Timeline
                </button>
              </div>
              <span className="ml-auto font-mono text-xs text-lightGrey">12 / 100 cr</span>
            </div>
            <div className="landing-preview-grid">
              <div className="landing-preview-pane" key={activeTab}>
                {activeTab === 'dashboard' ? <DashboardPreview /> : <TimelinePreview />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
