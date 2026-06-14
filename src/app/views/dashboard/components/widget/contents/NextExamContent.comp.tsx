import React from 'react';
import type { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  formatWidgetDate,
  getCourseDisplayName,
  getUpcomingExamItems,
} from '@/app/views/dashboard/util/registrationWidgetData';

interface Props {
  courses: RegistrationCourse[];
}

export const NextExamContent: React.FC<Props> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const exams = getUpcomingExamItems(courses).slice(0, 3);
  const [nextExam, ...otherExams] = exams;

  if (!nextExam) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">
        {t('widgets.registration.noUpcomingExams')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <section className="sisu-widget-fade-lift rounded-xl bg-[#262438] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(155,124,255,0.34)]">
        <div className="flex items-end gap-3">
          <span className="font-mono text-[44px] leading-none font-bold text-offwhite tabular-nums">
            {nextExam.daysUntil}
          </span>
          <span className="pb-1 text-sm font-medium text-lightGrey">{t('widgets.registration.daysAway')}</span>
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-offwhite">{getCourseDisplayName(nextExam.course)}</p>
      </section>

      <div className="flex flex-col gap-2">
        {otherExams.map((exam) => (
          <div
            key={`${exam.course.courseUnitId}:${exam.implementation.id}`}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg bg-container2 px-3 py-2"
          >
            <span className="font-mono text-[12px] font-bold text-lightGrey tabular-nums">
              {t('widgets.registration.daysShort', { count: exam.daysUntil })}
            </span>
            <span className="truncate text-[12px] font-semibold text-offwhite">
              {getCourseDisplayName(exam.course)}
            </span>
            <span className="font-mono text-[11px] text-lightGrey">{formatWidgetDate(exam.startsAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
