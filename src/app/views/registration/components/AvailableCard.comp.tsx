import React from 'react';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { formatImplementationDateRange, getStatusClass } from '../registrationFormatters';
import {
  getImplementationsForTab,
  getStatusForTab,
  isCourseSelectionDraftForTab,
  isImplementationSelectable,
} from '../registrationUtils';
import type { RegistrationTab } from '../registrationTypes';
import { CalendarIcon } from './RegistrationIcons';
import { CourseHeader } from './CourseHeader.comp';

interface Props {
  course: RegistrationCourse;
  implementation: RegistrationImplementation | null;
  tab: RegistrationTab;
  onSelect: (course: RegistrationCourse, implementation: RegistrationImplementation) => void;
}

export const AvailableCard: React.FC<Props> = ({ course, implementation, onSelect, tab }) => {
  const implementations = getImplementationsForTab(course, tab);
  const selectableCount = implementations.filter(isImplementationSelectable).length;
  const status = getStatusForTab(course, tab);
  const selectedDraft = isCourseSelectionDraftForTab(course, tab);
  const disabled = !isImplementationSelectable(implementation) || status === 'processing' || status === 'registered';
  const canChangeImplementation = selectedDraft && selectableCount > 1;

  return (
    <article
      className={`overflow-hidden rounded-[10px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.055)] transition-[box-shadow,background-color] duration-150 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10)] ${
        selectedDraft ? 'shadow-[0_0_0_1px_rgba(240,183,97,0.34)]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <CourseHeader course={course} implementation={selectedDraft ? implementation : null} />
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${getStatusClass(implementation ? 'not-enrolled' : 'not-selected')}`}
        >
          {selectedDraft ? 'Selected' : implementation ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 bg-container2/55 px-3.5 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-xs text-lightGrey">
          <p className="flex items-center gap-2 font-medium text-offwhite">
            <CalendarIcon className="size-3.5 text-darkishGrey" />
            {selectedDraft
              ? (implementation?.name ?? implementation?.typeLabel ?? 'Selected implementation')
              : implementation
                ? `${selectableCount} open ${selectableCount === 1 ? 'option' : 'options'}`
                : 'No open registration'}
          </p>
          {selectedDraft && (
            <p className="mt-1 text-xs text-darkishGrey">
              {formatImplementationDateRange(implementation)}
              {selectableCount > 1 && ` · ${selectableCount} open options`}
            </p>
          )}
          {!implementation && (
            <p className="mt-1 text-xs text-darkishGrey">Registration is closed or no published implementations.</p>
          )}
          {implementation && !selectedDraft && (
            <p className="mt-1 text-xs text-darkishGrey">Select an implementation before registering.</p>
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
              Change
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
            {selectedDraft ? 'Register' : tab === 'exam' ? 'Select sitting' : 'Select implementation'}
          </Button>
        </div>
      </div>
    </article>
  );
};
