import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { formatCredits, getCourseTone, isExamImplementation } from '../registrationFormatters';

interface Props {
  course: RegistrationCourse;
  implementation: RegistrationImplementation | null;
}

export const CourseHeader: React.FC<Props> = ({ course, implementation }) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <span className={`mt-0.5 w-1 shrink-0 self-stretch rounded-full ${getCourseTone(course)}`} />
    <div className="min-w-0">
      <h3 className="text-sm leading-snug font-semibold text-balance text-offwhite">
        {course.courseName ?? course.courseCode}
      </h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-darkishGrey">
        <span>{course.courseCode ?? course.courseUnitId}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold text-[#7ea0ff]">{formatCredits(course.credits)}</span>
        {implementation && isExamImplementation(implementation) && (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#a98cff]">Exam</span>
          </>
        )}
      </p>
    </div>
  </div>
);
