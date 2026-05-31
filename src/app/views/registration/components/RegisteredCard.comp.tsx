import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import type { Enrolment } from '@/app/api/generated/IlmoApi';
import { Button } from '@/app/components/ui/Button.comp';
import { CourseCard } from '@/app/components/ui/CourseCard.comp';
import {
  formatDateTime,
  formatImplementationDateRange,
  getCourseTone,
  getStatusClass,
  getStatusLabel,
} from '../registrationFormatters';
import {
  canCancelImplementation,
  canWithdrawImplementation,
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
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

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
  const { t } = useTranslationWithPrefix('views.registration');
  const enrolment = enrolmentOverride ?? getEnrolmentForTab(course, tab);
  const implementation = enrolment
    ? getImplementationForEnrolment(course, enrolment)
    : getPreferredImplementation(course, tab);
  const status = getRegistrationStatus(enrolment, implementation);
  const cancelAllowed = canCancelImplementation(implementation);
  const withdrawAllowed = canWithdrawImplementation(implementation);
  const finished = isImplementationFinished(implementation);
  const selectableImplementation = getSelectableImplementation(course, tab);
  const retryImplementation =
    implementation && isImplementationSelectable(implementation) ? implementation : selectableImplementation;
  const selectableCount = getImplementationsForTab(course, tab).filter(isImplementationSelectable).length;
  const canChangeImplementation =
    status === 'rejected' && selectableImplementation != null && selectableImplementation.id !== implementation?.id;

  return (
    <CourseCard
      selected={status === 'registered'}
      badge={
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      }
      code={<CourseHeader course={course} implementation={implementation} />}
      heading={course.courseName ?? course.courseCode}
      headerClassName="!min-h-0"
      stripeClassName={getCourseTone(course)}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-medium text-offwhite">
              <CalendarIcon className="size-3.5 text-darkishGrey" />
              {implementation?.name ?? implementation?.typeLabel ?? t('labels.selectedImplementation')}
            </p>
            <p className="mt-1 text-xs text-darkishGrey">{formatImplementationDateRange(implementation)}</p>
            {implementation?.cancellationEnd && (
              <p className="mt-2 text-xs text-darkishGrey">
                {t('labels.cancelBy', { date: formatDateTime(implementation.cancellationEnd) })}
              </p>
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
                    {t('actions.change')}
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
                  {selectableCount > 0 ? t('labels.reRegister') : t('labels.noOpenOption')}
                </Button>
                {!enrolment?.id && implementation && (
                  <Button onClick={() => void updateEnrolmentsStudyRightId(course, implementation, studyRight)}>
                    {t('actions.fixCourseRights')}
                  </Button>
                )}
              </div>
            ) : finished ? (
              <span className="inline-flex min-h-9 min-w-20 items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold text-darkishGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                {t('labels.finished')}
              </span>
            ) : (
              <Button
                disabled={!enrolment?.id || isPending || (!cancelAllowed && !withdrawAllowed)}
                className={`min-h-9 min-w-20 rounded-md px-3 py-1.5 text-xs ${
                  cancelAllowed || withdrawAllowed ? 'border-danger/80 text-danger hover:bg-danger/10' : ''
                }`}
                onClick={() => {
                  if (enrolment) onCancel(enrolment, implementation);
                }}
              >
                {isPending
                  ? withdrawAllowed
                    ? t('labels.withdrawing')
                    : t('labels.cancelling')
                  : withdrawAllowed
                    ? t('labels.withdraw')
                    : t('actions.cancel')}
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
};
