import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { formatCredits, isExamImplementation } from '../registrationFormatters';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  course: RegistrationCourse;
  implementation: RegistrationImplementation | null;
}

export const CourseHeader: React.FC<Props> = ({ course, implementation }) => {
  const { t } = useTranslationWithPrefix('views.registration');

  return (
    <>
      <span>{course.courseCode ?? course.courseUnitId}</span>
      <span aria-hidden="true">·</span>
      <span className="font-semibold text-[#7ea0ff]">{formatCredits(course.credits)}</span>
      {implementation && isExamImplementation(implementation) && (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#a98cff]">{t('labels.exam')}</span>
        </>
      )}
    </>
  );
};
