import React from 'react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { ModulesPanel } from '@/app/views/timeline/components/sidebar/ModulesPanel.comp';
import { SchedulingIssuesPanel } from '@/app/views/timeline/components/sidebar/SchedulingIssuesPanel.comp';
import { TimelineCoursePool } from '@/app/views/timeline/components/TimelineCoursePool.comp';
import { listIssues, listModules } from '@/app/views/timeline/util/sidebarLists';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';

type PoolProps = React.ComponentProps<typeof TimelineCoursePool>;

interface Props extends Omit<PoolProps, 'validationWarnings'> {
  courses: TimelineCourse[];
  onSelectIssue: (courseUnitId: string) => void;
  validationWarnings: Map<string, TimelineValidationWarning[]>;
}

export const TimelineSidebar: React.FC<Props> = ({ courses, onSelectIssue, validationWarnings, ...poolProps }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const modules = listModules(courses, t('validation.unknownModule'));
  const issues = listIssues(validationWarnings, courses);

  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto max-lg:max-h-[33dvh] max-lg:flex-row max-lg:overflow-x-auto max-lg:overflow-y-hidden">
      <TimelineCoursePool {...poolProps} validationWarnings={validationWarnings} />
      {modules.length > 0 && <ModulesPanel modules={modules} />}
      <SchedulingIssuesPanel issues={issues} onSelect={onSelectIssue} />
    </div>
  );
};
