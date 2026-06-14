import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { CourseHeader } from './CourseHeader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  formatImplementationDateRange,
  formatDateTime,
  getCourseTone,
  getImplementationsForTab,
  getStatusClass,
  getStatusForTab,
  isCourseSelectionDraftForTab,
  isImplementationRegisterable,
  isImplementationSelectable,
} from '@/app/views/registration/util';
import { RegistrationTab } from '@/app/views/registration/types';
import { CalendarIcon } from '@/app/views/registration/components/icons';

interface Props {
  course: RegistrationCourse;
  implementation: RegistrationImplementation | null;
  tab: RegistrationTab;
  onSelect: (course: RegistrationCourse, implementation: RegistrationImplementation) => void;
}

export const AvailableCard: React.FC<Props> = ({ course, implementation, onSelect, tab }) => {
  const { t } = useTranslationWithPrefix('views.registration');
  const implementations = getImplementationsForTab(course, tab);
  const selectableCount = implementations.filter(isImplementationSelectable).length;
  const status = getStatusForTab(course, tab);
  const selectedDraft = isCourseSelectionDraftForTab(course, tab);
  const registerable = isImplementationRegisterable(implementation);
  const disabled =
    (selectedDraft ? !registerable : !isImplementationSelectable(implementation)) ||
    status === 'processing' ||
    status === 'registered';
  const canChangeImplementation = selectedDraft && selectableCount > 1;
  const startsLater = implementation?.isUpcoming === true && implementation.enrolmentStart != null;
  const badgeClass =
    selectedDraft && startsLater
      ? 'bg-warn/15 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.18)]'
      : getStatusClass(implementation ? 'not-enrolled' : 'not-selected');

  const badgeLabel = selectedDraft
    ? startsLater
      ? t('labels.selectedUpcoming')
      : t('labels.selected')
    : registerable
      ? t('labels.open')
      : startsLater
        ? t('labels.upcoming')
        : t('labels.closed');
  const implementationLabel = selectedDraft
    ? (implementation?.name ?? implementation?.typeLabel ?? t('labels.selectedImplementation'))
    : implementation
      ? t(selectableCount === 1 ? 'labels.implementationOption' : 'labels.implementationOptions', {
          count: selectableCount,
        })
      : t('labels.noOpenRegistration');

  return (
    <article
      className={`relative overflow-hidden rounded-[14px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_14px_34px_-28px_rgba(0,0,0,0.8)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_38px_-28px_rgba(0,0,0,0.85)] ${
        selectedDraft ? 'shadow-[0_0_0_1px_rgba(240,183,97,0.34),0_14px_34px_-28px_rgba(0,0,0,0.8)]' : ''
      }`}
    >
      <div className="flex items-start gap-3.5 px-[18px] pt-4 pb-3.5">
        <span className={`w-1 shrink-0 self-stretch rounded-full ${getCourseTone(course)}`} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15.5px] leading-[1.3] font-semibold text-balance text-offwhite">
            {course.courseName ?? course.courseCode}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-lightGrey">
            <CourseHeader course={course} implementation={selectedDraft ? implementation : null} />
          </p>
        </div>
        <span className={`shrink-0 rounded-[7px] px-[11px] py-1 text-[11px] font-bold ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-[18px] py-[13px] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[12.5px] font-medium text-offwhite">
            <CalendarIcon className="size-3.5 shrink-0 text-darkishGrey" />
            <span className="min-w-0 truncate">{implementationLabel}</span>
          </p>
          {selectedDraft && (
            <p className="mt-1 font-mono text-xs text-darkishGrey">
              {formatImplementationDateRange(implementation)}
              {selectableCount > 1 && ` · ${t('labels.implementationOptions', { count: selectableCount })}`}
            </p>
          )}
          {!implementation && <p className="mt-1 text-xs text-darkishGrey">{t('labels.registrationClosed')}</p>}
          {startsLater && (
            <p className="mt-1 text-xs text-warn/90">
              {t('labels.registrationStarts', { date: formatDateTime(implementation.enrolmentStart) })}
            </p>
          )}
          {implementation && !selectedDraft && !startsLater && (
            <p className="mt-1 text-xs text-darkishGrey">{t('labels.selectBeforeRegistering')}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {canChangeImplementation && (
            <Button
              disabled={!implementation}
              className="min-h-9 min-w-20 rounded-[9px] px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                if (implementation) onSelect(course, implementation);
              }}
            >
              {t('actions.change')}
            </Button>
          )}
          <Button
            disabled={disabled}
            variant={implementation?.usesExternalEnrolment ? 'primary' : 'accent'}
            className="min-h-9 min-w-36 rounded-[9px] px-3 py-1.5 text-xs font-semibold"
            onClick={() => {
              if (!implementation) return;
              if (implementation.usesExternalEnrolment && implementation.externalEnrolmentUrl) {
                window.open(implementation.externalEnrolmentUrl, '_blank', 'noopener,noreferrer');
                return;
              }
              onSelect(course, implementation);
            }}
          >
            {selectedDraft
              ? startsLater
                ? t('labels.registrationNotOpen')
                : t('actions.register')
              : tab === 'exam'
                ? t('labels.selectSitting')
                : t('labels.selectImplementation')}
          </Button>
        </div>
      </div>
    </article>
  );
};
