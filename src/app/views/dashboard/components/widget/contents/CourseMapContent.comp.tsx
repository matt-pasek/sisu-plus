import React from 'react';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  timelineCourses: TimelineCourse[];
  modules: ModuleProgress[];
}

const MAX_VISIBLE = 5;

type CourseStatus = 'done' | 'active' | 'planned';

function getStatus(course: TimelineCourse): CourseStatus {
  if (course.isPassed) return 'done';
  if (course.isEnrolled) return 'active';
  return 'planned';
}

const STATUS_STYLES: Record<CourseStatus, string> = {
  done: 'border border-[#52c989]/55 bg-[#52c989]/10 text-[#52c989]',
  active: 'border border-blue-400/55 bg-blue-400/10 text-blue-300',
  planned: 'border border-offwhite/15 text-offwhite/40',
};

const CourseBadge: React.FC<{ code: string | null; status: CourseStatus }> = ({ code, status }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 font-mono text-[10.5px] font-semibold ${STATUS_STYLES[status]}`}
  >
    {code ?? '—'}
  </span>
);

export const CourseMapContent: React.FC<Props> = ({ timelineCourses, modules }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');

  if (timelineCourses.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-lightGrey">
        {t('widgets.courseMap.noCourses')}
      </div>
    );
  }

  const moduleCreditsMap = new Map(modules.map((m) => [m.moduleId, m]));

  const grouped = new Map<string, { name: string; courses: TimelineCourse[] }>();
  for (const course of timelineCourses) {
    const key = course.moduleId ?? '__unassigned__';
    if (!grouped.has(key)) {
      grouped.set(key, { name: course.moduleName ?? t('widgets.courseMap.noCourses'), courses: [] });
    }
    grouped.get(key)!.courses.push(course);
  }

  const orderedModuleIds = [
    ...modules.map((m) => m.moduleId).filter((id) => grouped.has(id)),
    ...[...grouped.keys()].filter((id) => !modules.some((m) => m.moduleId === id)),
  ];

  return (
    <div className="flex flex-col gap-3.5 px-1 py-0.5">
      {orderedModuleIds.map((moduleId) => {
        const group = grouped.get(moduleId)!;
        const progress = moduleCreditsMap.get(moduleId);

        const sorted = [...group.courses].sort((a, b) => {
          const order: Record<CourseStatus, number> = { done: 0, active: 1, planned: 2 };
          return order[getStatus(a)] - order[getStatus(b)];
        });

        const visible = sorted.slice(0, MAX_VISIBLE);
        const overflow = sorted.length - MAX_VISIBLE;

        return (
          <div key={moduleId}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10.5px] font-semibold tracking-wide text-offwhite/60">{group.name}</span>
              {progress && (
                <span className="shrink-0 font-mono text-[10.5px] text-offwhite/40 tabular-nums">
                  {progress.done}/{progress.target} cr
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((course) => (
                <CourseBadge key={course.courseUnitId} code={course.courseCode} status={getStatus(course)} />
              ))}
              {overflow > 0 && (
                <span className="inline-flex shrink-0 items-center rounded border border-offwhite/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-offwhite/30">
                  +{overflow} more
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
