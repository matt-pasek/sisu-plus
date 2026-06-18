import { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorByIndex, MODULE_COLOR_VALUES } from '@/app/theme/moduleColors';
import { CourseCard as StructureCourseCard } from '@/app/views/structure/components/CourseCard.comp';
import type { CourseEntry } from '@/app/views/structure/types';
import { TimelineCourseCard } from '@/app/views/timeline/components/TimelineCourseCard.comp';
import type React from 'react';
import { DegreeCompletionContent } from '@/app/views/dashboard/components/widget/contents/DegreeCompletionContent.comp';
import { Widget } from '@/app/views/dashboard/components/widget/Widget.comp';

const modules: ModuleProgress[] = [
  { moduleId: 'core', name: 'Core studies', done: 25, target: 31 },
  { moduleId: 'major', name: 'Major studies', done: 62, target: 103 },
  { moduleId: 'language', name: 'Language studies', done: 9, target: 10 },
  { moduleId: 'optional', name: 'Optional studies', done: 28, target: 36 },
];

const timelineCourses: TimelineCourse[] = [
  {
    courseUnitId: 'cs-a1110',
    courseUnitGroupId: null,
    courseCode: 'LANG-A1110',
    courseName: 'Finnish 101',
    credits: 5,
    moduleId: 'major',
    moduleName: 'Major studies',
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
    courseUnitId: 'math-c2100',
    courseUnitGroupId: null,
    courseCode: 'MATH-C2100',
    courseName: 'Math A',
    credits: 6,
    moduleId: 'core',
    moduleName: 'Core studies',
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

const structureCourse: CourseEntry = {
  courseUnitId: 'cs-c3130',
  code: 'CS-C3130',
  name: 'Data-Intensive Systems',
  credits: 5,
  completed: false,
  enrolled: false,
  grade: null,
  parentModuleId: 'major',
  completionMethodId: 'method-2',
  completionMethodIndex: 2,
};

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-[0.45rem] rounded-full bg-[rgba(13,13,17,0.64)] px-[0.72rem] py-[0.4rem] text-[0.72rem] font-bold whitespace-nowrap text-offwhite/76 shadow-[0_14px_48px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-[16px]">
      <span
        aria-hidden="true"
        className="size-[0.45rem] shrink-0 rounded-full bg-lighterGreen shadow-[0_0_16px_rgba(82,201,137,0.72)]"
      />
      {children}
    </span>
  );
}

const PANEL =
  'absolute min-w-0 rounded-3xl shadow-[0_42px_120px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.07)]';

export function HeroShowcase() {
  const { t } = useTranslationWithPrefix('landing.heroShowcase');

  return (
    <div aria-label={t('aria')} className="relative isolate min-h-[640px] overflow-visible max-lg:min-h-[720px]">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute [inset:5rem_-3rem_-2rem_1rem] -z-[1] rounded-[999px] bg-[radial-gradient(circle_at_50%_42%,rgba(82,201,137,0.16),transparent_32rem),radial-gradient(circle_at_70%_70%,rgba(91,141,246,0.1),transparent_22rem)] blur-[10px]"
      />

      {/* toolbar pills */}
      <div
        aria-hidden="true"
        className="absolute top-[0.7rem] right-[1.25rem] z-[5] flex max-w-[calc(100%-2rem)] gap-[0.55rem]"
      >
        <FeaturePill>{t('signals.users')}</FeaturePill>
        <FeaturePill>{t('signals.local')}</FeaturePill>
        <FeaturePill>{t('signals.sisu')}</FeaturePill>
      </div>

      {/* dashboard — keeps class for CSS animation selectors in animations.css */}
      <section
        className={`${PANEL} app-showcase-dashboard top-16 -left-6 z-[2] h-[350px] w-[min(720px,92%)] -rotate-[2.5deg] animate-[appPanelIn_720ms_120ms_cubic-bezier(0.2,0,0,1)_both] max-lg:top-[4.5rem] max-lg:left-6 max-lg:w-[72%] [&_.flex.h-full]:overflow-hidden [&>div]:overflow-hidden`}
      >
        <Widget title={t('structure.meta')}>
          <DegreeCompletionContent creditsDone={124} modules={modules} totalTarget={180} />
        </Widget>
      </section>

      {/* timeline */}
      <section
        className={`${PANEL} -right-12 bottom-6 z-[4] w-[min(500px,66%)] rotate-[2.5deg] animate-[appPanelIn_760ms_280ms_cubic-bezier(0.2,0,0,1)_both] p-4 [background:linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024)),#15151c] max-lg:right-6 max-lg:bottom-8 max-lg:w-[58%]`}
      >
        <div className="mb-[0.8rem] flex items-center justify-between gap-[0.85rem]">
          <span className="text-[0.72rem] font-extrabold tracking-[0.12em] text-lighterGreen uppercase">
            {t('panels.0.label')}
          </span>
          <strong className="font-mono text-[0.76rem] text-offwhite/82 tabular-nums">{t('panels.0.stat')}</strong>
        </div>
        <div className="grid grid-cols-2 gap-[0.75rem]">
          <div className="relative min-h-[250px] min-w-0 rounded-2xl bg-[rgba(13,13,17,0.5)] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
            <span className="mb-[0.55rem] block text-[0.72rem] font-bold text-offwhite/50">Period III</span>
            <TimelineCourseCard
              compact
              className="min-h-[90px]"
              color={MODULE_COLOR_VALUES[2]}
              course={timelineCourses[0]}
            />
            <div className="absolute top-[8.15rem] right-3 left-3 z-[3] animate-[appTimelineMove_1700ms_1000ms_cubic-bezier(0.2,0,0,1)_both]">
              <TimelineCourseCard
                compact
                className="min-h-[90px]"
                color={MODULE_COLOR_VALUES[0]}
                course={timelineCourses[1]}
                isDraft
              />
            </div>
          </div>
          <div className="relative min-h-[250px] min-w-0 rounded-2xl bg-[rgba(13,13,17,0.5)] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
            <span className="mb-[0.55rem] block text-[0.72rem] font-bold text-offwhite/50">Period IV</span>
            <div
              aria-hidden="true"
              className="mt-[0.55rem] min-h-[90px] animate-[appDropTargetPulse_1700ms_1000ms_cubic-bezier(0.2,0,0,1)_both] rounded-[10px] border border-dashed border-lighterGreen/24 [background:linear-gradient(135deg,rgba(82,201,137,0.045),transparent),rgba(13,13,17,0.24)]"
            />
          </div>
        </div>
      </section>

      {/* structure */}
      <section
        className={`${PANEL} top-48 -right-[1.2rem] z-[3] w-[min(390px,50%)] rotate-[1.75deg] animate-[appPanelIn_760ms_220ms_cubic-bezier(0.2,0,0,1)_both] p-4 [background:linear-gradient(145deg,rgba(240,168,77,0.105),rgba(255,255,255,0.026)),#15151c] max-lg:top-64 max-lg:right-6 max-lg:w-[38%]`}
      >
        <div className="mb-[0.8rem] flex items-center justify-between gap-[0.85rem]">
          <span className="text-[0.72rem] font-extrabold tracking-[0.12em] text-lighterGreen uppercase">
            {t('structure.label')}
          </span>
          <strong className="font-mono text-[0.76rem] text-offwhite/82 tabular-nums">{t('structure.credits')}</strong>
        </div>
        <StructureCourseCard color={getModuleColorByIndex(1)} course={structureCourse} />
      </section>

      {/* action */}
      <section
        className={`${PANEL} bottom-[3.3rem] -left-[0.4rem] z-[5] w-[min(340px,47%)] -rotate-[2.5deg] animate-[appPanelIn_760ms_360ms_cubic-bezier(0.2,0,0,1)_both] p-[1.05rem] [background:linear-gradient(145deg,rgba(82,201,137,0.145),rgba(255,255,255,0.035)),#171720] max-lg:bottom-[2.4rem] max-lg:left-6 max-lg:w-[36%]`}
      >
        <span className="text-[0.72rem] font-extrabold tracking-[0.12em] text-lighterGreen uppercase">
          {t('panels.1.label')}
        </span>
        <h3 className="mt-[0.55rem] mb-0 text-[1.32rem] leading-[1.06] font-bold text-balance text-offwhite">
          {t('panels.1.title')}
        </h3>
        <p className="mt-[0.7rem] text-[0.86rem] leading-[1.52] text-pretty text-offwhite/58">{t('panels.1.body')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <strong className="rounded-full bg-white/[0.075] px-[0.65rem] py-[0.4rem] font-mono text-[0.72rem] [font-weight:inherit] text-offwhite/84 tabular-nums">
            {t('panels.1.stat')}
          </strong>
        </div>
      </section>
    </div>
  );
}
