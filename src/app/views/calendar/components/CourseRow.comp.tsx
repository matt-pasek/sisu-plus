import React from 'react';
import type { CalendarCourse } from '@/app/api/dataPoints/calendar/types';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AttendancePlan } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import type { TimetableControls } from '../types';
import { alternativeGroups, groupKind, hasGroupChoice, promptSets, requiredSetWithoutGroup } from '../util';
import { AlternativesPrompt } from './AlternativesPrompt.comp';
import { LinkedCourseStatus } from './LinkedCourseStatus.comp';

interface Props {
  course: CalendarCourse;
  code: string | undefined;
  plan: AttendancePlan | undefined;
  timetables: TimetableControls;
  onToggleCourse: (course: CalendarCourse, visible: boolean) => void;
  onOpenGroups: (courseKey: string, setId: string | null) => void;
  onDismissPrompt: (courseKey: string, setId: string) => void;
}

export const CourseRow: React.FC<Props> = ({
  course,
  code,
  plan,
  timetables,
  onToggleCourse,
  onOpenGroups,
  onDismissPrompt,
}) => {
  const key = course.realisationId;
  const linked = timetables.linked[key];
  const { t } = useTranslationWithPrefix('views.calendar');
  const color = getModuleColorValueByIndex(course.colorIndex);
  const requiredSet = requiredSetWithoutGroup(course);
  return (
    <li className="rounded-lg px-2 py-1.5">
      <div className={`flex items-start gap-2.5 ${course.isInCalendar ? '' : 'opacity-50'}`}>
        <button
          type="button"
          role="checkbox"
          aria-checked={course.isInCalendar}
          aria-label={t('sidebar.showCourse', { course: course.name })}
          disabled={!course.enrolmentId}
          onClick={() => onToggleCourse(course, !course.isInCalendar)}
          className="relative mt-1 size-3.5 shrink-0 cursor-pointer rounded-[4px] transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] disabled:cursor-default"
          style={{
            backgroundColor: course.isInCalendar ? color : 'transparent',
            boxShadow: `inset 0 0 0 1.5px ${color}`,
          }}
        />
        <span className="min-w-0 flex-1">
          {hasGroupChoice(course) ? (
            <button
              type="button"
              onClick={() => onOpenGroups(key, null)}
              className="block cursor-pointer text-left text-[13px] leading-snug font-semibold text-offwhite decoration-lightGrey/60 underline-offset-2 hover:underline"
            >
              {course.name}
            </button>
          ) : (
            <span className="block text-[13px] leading-snug font-semibold text-offwhite">{course.name}</span>
          )}
          {(code || course.isExam || requiredSet) && (
            <span className="mt-0.5 flex flex-wrap items-center gap-2">
              {code && <span className="font-mono text-[11px] text-lightGrey">{code}</span>}
              {course.isExam && <StatusChip tone="neutral">{t('sidebar.exam')}</StatusChip>}
              {requiredSet && (
                <button type="button" className="cursor-pointer" onClick={() => onOpenGroups(key, requiredSet)}>
                  <StatusChip tone="warn">{t('sidebar.chooseGroup')}</StatusChip>
                </button>
              )}
            </span>
          )}
        </span>
      </div>
      <LinkedCourseStatus
        noTimes={timetables.noTimesCourseKeys.has(key)}
        hasSisuTimes={linked != null && timetables.sisuCourseKeys.has(key)}
        state={linked}
        onAdd={() => timetables.onAdd(key)}
        onRefresh={() => timetables.onRefresh(key)}
        onRemove={() => timetables.onRemove(key)}
      />
      {promptSets(course, plan).map((set) => (
        <AlternativesPrompt
          key={set.id}
          question={t(`groups.question.${groupKind(alternativeGroups(set)[0])}`)}
          onPick={() => onOpenGroups(key, set.id)}
          onDismiss={() => onDismissPrompt(key, set.id)}
        />
      ))}
    </li>
  );
};
