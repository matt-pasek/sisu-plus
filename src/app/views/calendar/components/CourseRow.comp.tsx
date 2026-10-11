import React from 'react';
import type { CalendarCourse } from '@/app/api/dataPoints/calendar/types';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';

interface Props {
  course: CalendarCourse;
  code: string | undefined;
  onOpenGroups: (courseKey: string, setId: string | null) => void;
}

const hasGroupChoice = (course: CalendarCourse): boolean =>
  course.groupSets.some(
    (set) => set.groups.filter((group) => !group.cancelled && group.eventIds.length > 0).length > 1,
  );

export const CourseRow: React.FC<Props> = ({ course, code, onOpenGroups }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <li className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 ${course.isInCalendar ? '' : 'opacity-50'}`}>
      <span
        aria-hidden="true"
        className="mt-1 size-3.5 shrink-0 rounded-[4px]"
        style={{ backgroundColor: getModuleColorValueByIndex(course.colorIndex) }}
      />
      <span className="min-w-0">
        {hasGroupChoice(course) ? (
          <button
            type="button"
            onClick={() => onOpenGroups(course.realisationId, null)}
            className="block cursor-pointer text-left text-[13px] leading-snug font-semibold text-offwhite decoration-lightGrey/60 underline-offset-2 hover:underline"
          >
            {course.name}
          </button>
        ) : (
          <span className="block text-[13px] leading-snug font-semibold text-offwhite">{course.name}</span>
        )}
        {(code || course.isExam) && (
          <span className="mt-0.5 flex items-center gap-2">
            {code && <span className="font-mono text-[11px] text-lightGrey">{code}</span>}
            {course.isExam && <StatusChip tone="neutral">{t('sidebar.exam')}</StatusChip>}
          </span>
        )}
      </span>
    </li>
  );
};
