import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import type { Enrolment } from '@/app/api/generated/IlmoApi';
import { Button } from '@/app/components/ui/Button.comp';

import { CourseHeader } from './CourseHeader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { RegistrationTab } from '@/app/views/registration/types';
import {
  canCancelImplementation,
  canWithdrawImplementation,
  formatDateTime,
  formatImplementationDateRange,
  getCourseTone,
  getEnrolmentForTab,
  getImplementationForEnrolment,
  getImplementationsForTab,
  getPreferredImplementation,
  getSelectableImplementation,
  getStatusClass,
  getStatusLabel,
  isImplementationFinished,
  isImplementationSelectable,
} from '@/app/views/registration/util';
import { CalendarIcon, CheckIcon, CloseIcon } from '@/app/views/registration/components/icons';
import { updateEnrolmentsStudyRightId } from '@/app/views/registration/util/actions';

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

  const statusTone =
    status === 'rejected' ? 'text-danger' : status === 'processing' ? 'text-warn' : 'text-lighterGreen';
  const cardTone =
    status === 'registered'
      ? 'shadow-[0_0_0_1px_rgba(82,201,137,0.28),0_14px_34px_-28px_rgba(0,0,0,0.8)]'
      : status === 'rejected'
        ? 'shadow-[0_0_0_1px_rgba(240,107,107,0.28),0_14px_34px_-28px_rgba(0,0,0,0.8)]'
        : 'shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_14px_34px_-28px_rgba(0,0,0,0.8)]';

  return (
    <article
      className={`relative overflow-hidden rounded-[14px] bg-container ${cardTone} transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.11),0_18px_38px_-28px_rgba(0,0,0,0.85)]`}
    >
      <div className="flex items-start gap-3.5 px-[18px] pt-4 pb-3.5">
        <span className={`w-1 shrink-0 self-stretch rounded-full ${getCourseTone(course)}`} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15.5px] leading-[1.3] font-semibold text-balance text-offwhite">
            {course.courseName ?? course.courseCode}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-lightGrey">
            <CourseHeader course={course} implementation={implementation} />
          </p>
        </div>
        <span className={`shrink-0 rounded-[7px] px-[11px] py-1 text-[11px] font-bold ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-[18px] py-[13px] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[12.5px] font-medium text-offwhite">
            <CalendarIcon className="size-3.5 shrink-0 text-darkishGrey" />
            <span className="min-w-0 truncate">
              {implementation?.name ?? implementation?.typeLabel ?? t('labels.selectedImplementation')}
            </span>
          </p>
          <p className="mt-1 font-mono text-xs text-darkishGrey">{formatImplementationDateRange(implementation)}</p>
          {implementation?.cancellationEnd && (
            <p className="mt-2 text-xs text-darkishGrey">
              {t('labels.cancelBy', { date: formatDateTime(implementation.cancellationEnd) })}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold ${statusTone}`}>
            {status === 'registered' && <CheckIcon className="size-3.5" />}
            {status === 'rejected' && <CloseIcon className="size-3.5" />}
            {getStatusLabel(status)}
          </span>
          {status === 'rejected' ? (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {canChangeImplementation && (
                <Button
                  className="min-h-9 min-w-20 rounded-[9px] px-3 py-1.5 text-xs font-semibold"
                  onClick={() => onSelect(course, selectableImplementation)}
                >
                  {t('actions.change')}
                </Button>
              )}
              <Button
                disabled={!retryImplementation || isPending}
                variant="accent"
                className="min-h-9 min-w-28 rounded-[9px] px-3 py-1.5 text-xs font-semibold"
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
            <span className="inline-flex min-h-9 min-w-20 items-center justify-center rounded-[9px] px-3 py-1.5 text-xs font-semibold text-darkishGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {t('labels.finished')}
            </span>
          ) : (
            <Button
              disabled={!enrolment?.id || isPending || (!cancelAllowed && !withdrawAllowed)}
              className={`min-h-9 min-w-20 rounded-[9px] px-3 py-1.5 text-xs ${
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
    </article>
  );
};
