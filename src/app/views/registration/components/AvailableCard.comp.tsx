import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { CourseCard } from '@/app/components/ui/CourseCard.comp';
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

  return (
    <CourseCard
      badge={
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
          {selectedDraft
            ? startsLater
              ? t('labels.selectedUpcoming')
              : t('labels.selected')
            : registerable
              ? t('labels.open')
              : startsLater
                ? t('labels.upcoming')
                : t('labels.closed')}
        </span>
      }
      className={selectedDraft ? 'shadow-[0_0_0_1px_rgba(240,183,97,0.34)]' : ''}
      code={<CourseHeader course={course} implementation={selectedDraft ? implementation : null} />}
      heading={course.courseName ?? course.courseCode}
      headerClassName="!min-h-0"
      stripeClassName={getCourseTone(course)}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs text-lightGrey">
            <p className="flex items-center gap-2 font-medium text-offwhite">
              <CalendarIcon className="size-3.5 text-darkishGrey" />
              {selectedDraft
                ? (implementation?.name ?? implementation?.typeLabel ?? t('labels.selectedImplementation'))
                : implementation
                  ? t(selectableCount === 1 ? 'labels.implementationOption' : 'labels.implementationOptions', {
                      count: selectableCount,
                    })
                  : t('labels.noOpenRegistration')}
            </p>
            {selectedDraft && (
              <p className="mt-1 text-xs text-darkishGrey">
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

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canChangeImplementation && (
              <Button
                disabled={!implementation}
                className="min-h-9 min-w-20 rounded-md px-3 py-1.5 text-xs font-semibold"
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
              className="min-h-9 min-w-36 rounded-md px-3 py-1.5 text-xs font-semibold"
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
      }
    />
  );
};
