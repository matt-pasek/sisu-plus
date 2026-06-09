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
    courseCode: 'CS-A1110',
    courseName: 'Programming Studio',
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
  return <span className="app-showcase-pill">{children}</span>;
}

export function HeroShowcase() {
  const { t } = useTranslationWithPrefix('landing.heroShowcase');

  return (
    <div className="app-showcase" aria-label={t('aria')}>
      <div className="app-showcase-toolbar" aria-hidden="true">
        <FeaturePill>{t('signals.users')}</FeaturePill>
        <FeaturePill>{t('signals.local')}</FeaturePill>
        <FeaturePill>{t('signals.sisu')}</FeaturePill>
      </div>

      <section className="app-showcase-panel app-showcase-dashboard">
        <Widget title={t('structure.meta')}>
          <DegreeCompletionContent creditsDone={124} modules={modules} totalTarget={180} />
        </Widget>
      </section>

      <section className="app-showcase-panel app-showcase-timeline">
        <div className="app-showcase-panel-head">
          <span>{t('panels.0.label')}</span>
          <strong>{t('panels.0.stat')}</strong>
        </div>
        <div className="app-showcase-periods">
          <div>
            <span>Period III</span>
            <TimelineCourseCard
              compact
              className="min-h-[90px]"
              color={MODULE_COLOR_VALUES[2]}
              course={timelineCourses[0]}
            />
            <div className="app-showcase-moving-course">
              <TimelineCourseCard
                compact
                className="min-h-[90px]"
                color={MODULE_COLOR_VALUES[0]}
                course={timelineCourses[1]}
                isDraft
              />
            </div>
          </div>
          <div>
            <span>Period IV</span>
            <div className="app-showcase-drop-target" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="app-showcase-panel app-showcase-structure">
        <div className="app-showcase-panel-head">
          <span>{t('structure.label')}</span>
          <strong>{t('structure.credits')}</strong>
        </div>
        <StructureCourseCard color={getModuleColorByIndex(1)} course={structureCourse} />
      </section>

      <section className="app-showcase-panel app-showcase-action">
        <span>{t('panels.1.label')}</span>
        <h3>{t('panels.1.title')}</h3>
        <p>{t('panels.1.body')}</p>
        <div>
          <strong>{t('panels.1.stat')}</strong>
        </div>
      </section>
    </div>
  );
}
