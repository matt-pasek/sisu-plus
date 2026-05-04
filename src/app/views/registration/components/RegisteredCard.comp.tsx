import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import type { Enrolment } from '@/app/api/generated/IlmoApi';
import { Button } from '@/app/components/ui/Button.comp';
import {
  formatDateTime,
  formatImplementationDateRange,
  getStatusClass,
  getStatusLabel,
} from '../registrationFormatters';
import {
  canCancelImplementation,
  getEnrolmentForTab,
  getImplementationForEnrolment,
  getImplementationsForTab,
  getPreferredImplementation,
  getSelectableImplementation,
  isImplementationFinished,
  isImplementationSelectable,
} from '../registrationUtils';
import { updateEnrolmentsStudyRightId } from '../registrationActions';
import type { RegistrationTab } from '../registrationTypes';
import { CalendarIcon, CheckIcon, CloseIcon } from './RegistrationIcons';
import { CourseHeader } from './CourseHeader.comp';

interface Props {
  course: RegistrationCourse;
  enrolmentOverride?: Enrolment;
  isPending: boolean;
  onCancel: (enrolment: Enrolment, implementation: RegistrationImplementation | null) => void;
  onSelect: (course: RegistrationCourse, implementation: RegistrationImplementation) => void;
  tab: RegistrationTab;
  studyRight?: string;
}

export const RegisteredCard: React.FC<Props> = ({
  course,
  enrolmentOverride,
  isPending,
  onCancel,
  onSelect,
  tab,
  studyRight,
}) => {
  const enrolment = enrolmentOverride ?? getEnrolmentForTab(course, tab);
  const implementation = enrolment
    ? getImplementationForEnrolment(course, enrolment)
    : getPreferredImplementation(course, tab);
  const status = getRegistrationStatus(enrolment, implementation);
  const cancelAllowed = canCancelImplementation(implementation);
  const finished = isImplementationFinished(implementation);
  const selectableImplementation = getSelectableImplementation(course, tab);
  const retryImplementation =
    implementation && isImplementationSelectable(implementation) ? implementation : selectableImplementation;
  const selectableCount = getImplementationsForTab(course, tab).filter(isImplementationSelectable).length;
  const canChangeImplementation =
    status === 'rejected' && selectableImplementation != null && selectableImplementation.id !== implementation?.id;

  return (
    <article
      className={`overflow-hidden rounded-[10px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.055)] ${
        status === 'registered' ? 'shadow-[0_0_0_1px_rgba(82,201,137,0.24)]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <CourseHeader course={course} implementation={implementation} />
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 bg-container2/55 px-3.5 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium text-offwhite">
            <CalendarIcon className="size-3.5 text-darkishGrey" />
            {implementation?.name ?? implementation?.typeLabel ?? 'Selected implementation'}
          </p>
          <p className="mt-1 text-xs text-darkishGrey">{formatImplementationDateRange(implementation)}</p>
          {implementation?.cancellationEnd && (
            <p className="mt-2 text-xs text-darkishGrey">Cancel by {formatDateTime(implementation.cancellationEnd)}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              status === 'rejected' ? 'text-danger' : status === 'processing' ? 'text-warn' : 'text-lighterGreen'
            }`}
          >
            {status === 'registered' && <CheckIcon className="size-3.5" />}
            {status === 'rejected' && <CloseIcon className="size-3.5" />}
            {getStatusLabel(status)}
          </span>
          {status === 'rejected' ? (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canChangeImplementation && (
                <Button
                  className="min-h-9 min-w-20 rounded-md px-3 py-1.5 text-xs font-semibold"
                  onClick={() => onSelect(course, selectableImplementation)}
                >
                  Change
                </Button>
              )}
              <Button
                disabled={!retryImplementation || isPending}
                variant="accent"
                className="min-h-9 min-w-28 rounded-md px-3 py-1.5 text-xs font-semibold"
                onClick={() => {
                  if (retryImplementation) onSelect(course, retryImplementation);
                }}
              >
                {selectableCount > 0 ? 'Re-register' : 'No open option'}
              </Button>
              {!enrolment?.id && implementation && (
                <Button onClick={() => void updateEnrolmentsStudyRightId(course, implementation, studyRight)}>
                  Fix course rights
                </Button>
              )}
            </div>
          ) : finished ? (
            <span className="inline-flex min-h-9 min-w-20 items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold text-darkishGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              Finished
            </span>
          ) : (
            <Button
              disabled={!enrolment?.id || isPending}
              className={`min-h-9 min-w-20 rounded-md px-3 py-1.5 text-xs ${cancelAllowed ? 'border-danger/80 text-danger hover:bg-danger/10' : ''}`}
              onClick={() => {
                if (enrolment) onCancel(enrolment, implementation);
              }}
            >
              {isPending ? 'Cancelling' : 'Cancel'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
