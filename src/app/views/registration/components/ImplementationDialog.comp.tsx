import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type {
  RegistrationCourse,
  RegistrationImplementation,
  RegistrationStudyGroupSet,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  formatDateTime,
  formatImplementationDateRange,
  getDefaultSelections,
  getImplementationsForTab,
  isExamImplementation,
  isImplementationRegisterable,
  isImplementationSelectable,
  isSelectionValid,
} from '@/app/views/registration/util';
import { SelectionState } from '@/app/views/registration/types';
import { formatCredits } from '@/app/helpers/formatCredits';
import { CheckIcon, CloseIcon } from '@/app/views/registration/components/icons';

interface Props {
  course: RegistrationCourse;
  initialImplementation: RegistrationImplementation;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (implementation: RegistrationImplementation, selections: SelectionState) => void;
}

const DIALOG_EASE = [0.22, 1, 0.36, 1] as const;

export const ImplementationDialog: React.FC<Props> = ({
  course,
  initialImplementation,
  isPending,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslationWithPrefix('views.registration');
  const shouldReduceMotion = useReducedMotion() === true;
  const implementationOptions = getImplementationsForTab(
    course,
    isExamImplementation(initialImplementation) ? 'exam' : 'course',
  );
  const [selectedImplementationId, setSelectedImplementationId] = useState(initialImplementation.id);
  const implementation =
    implementationOptions.find((candidate) => candidate.id === selectedImplementationId) ?? initialImplementation;
  const [selections, setSelections] = useState<SelectionState>(() => getDefaultSelections(implementation));
  const isValid = isSelectionValid(implementation, selections);
  const registerable = isImplementationRegisterable(implementation);

  useEffect(() => {
    setSelections(getDefaultSelections(implementation));
  }, [implementation]);

  const visibleStudyGroupSets = implementation.studyGroupSets.filter((set) => set.min > 0 && set.subGroups.length > 0);

  const toggleSubGroup = (set: RegistrationStudyGroupSet, subGroupId: string) => {
    setSelections((current) => {
      const currentSet = current[set.id] ?? [];
      if (currentSet.includes(subGroupId)) {
        return { ...current, [set.id]: currentSet.filter((id) => id !== subGroupId) };
      }
      if (set.max === 1) return { ...current, [set.id]: [subGroupId] };
      if (set.max != null && currentSet.length >= set.max) return current;
      return { ...current, [set.id]: [...currentSet, subGroupId] };
    });
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-dialog-title"
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: DIALOG_EASE }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-[min(44rem,calc(100dvh-3rem))] w-full max-w-3xl flex-col overflow-hidden rounded-[14px] bg-container shadow-[0_28px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.10)]"
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 6 }}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 8 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: DIALOG_EASE }}
      >
        <header className="flex items-start justify-between gap-5 border-b border-border px-5 py-5">
          <div>
            <h2 id="registration-dialog-title" className="text-lg font-semibold text-balance text-offwhite">
              {isExamImplementation(implementation) ? t('dialog.examTitle') : t('dialog.courseTitle')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-pretty text-lightGrey">{t('dialog.explanation')}</p>
          </div>
          <button
            type="button"
            aria-label={t('dialog.close')}
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto">
          <section className="grid gap-x-7 gap-y-1.5 border-b border-border bg-container2/70 px-5 py-4 text-xs sm:grid-cols-[6rem_minmax(0,1fr)]">
            <p className="font-semibold tracking-wide text-lightGrey uppercase">{t('dialog.course')}</p>
            <p className="font-semibold text-[#7ea0ff]">
              {course.courseCode} · {course.courseName}
            </p>
            <p className="font-semibold tracking-wide text-lightGrey uppercase">{t('dialog.version')}</p>
            <p className="text-lightGrey">{implementation.typeLabel}</p>
            <p className="font-semibold tracking-wide text-lightGrey uppercase">{t('dialog.completion')}</p>
            <p className="text-lightGrey">{formatCredits(course.credits)}</p>
          </section>

          <section className="space-y-3 px-5 py-5">
            <div className="space-y-1.5">
              {implementationOptions.map((candidate) => {
                const selected = candidate.id === implementation.id;
                const disabled = !isImplementationSelectable(candidate);

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedImplementationId(candidate.id)}
                    className={`flex w-full cursor-pointer gap-3 rounded-[9px] p-3 text-left transition-[background-color,box-shadow,opacity,transform] duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? 'bg-accent/15 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.55)]'
                        : 'bg-container2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-offwhite/5'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded ${
                        selected ? 'bg-accent text-background' : 'shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12)]'
                      }`}
                    >
                      {selected && <CheckIcon className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug font-semibold text-offwhite">
                        {candidate.name ?? candidate.typeLabel}
                      </span>
                      <span className="mt-1 block text-xs text-lightGrey">
                        {formatImplementationDateRange(candidate)}
                      </span>
                      {candidate.isUpcoming && candidate.enrolmentStart ? (
                        <span className="mt-2 inline-flex rounded bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                          {t('dialog.registrationStarts', { date: formatDateTime(candidate.enrolmentStart) })}
                        </span>
                      ) : candidate.enrolmentEnd ? (
                        <span className="mt-2 inline-flex rounded bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                          {t('dialog.registrationCloses', { date: formatDateTime(candidate.enrolmentEnd) })}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {visibleStudyGroupSets.map((set) => {
              const selected = selections[set.id] ?? [];
              const invalid = selected.length < set.min || (set.max != null && selected.length > set.max);

              return (
                <fieldset
                  key={set.id}
                  className={`rounded-[10px] bg-container2 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] ${
                    invalid ? 'shadow-[inset_0_0_0_1px_rgba(240,168,77,0.32)]' : ''
                  }`}
                >
                  <legend className="px-1 text-xs font-semibold text-offwhite">
                    {set.name ?? t('dialog.studyGroup')}{' '}
                    <span className="font-normal text-lightGrey">
                      {t('dialog.selectRange', {
                        range: set.max === set.min ? set.min : `${set.min}-${set.max ?? t('dialog.selectAny')}`,
                      })}
                    </span>
                  </legend>
                  <div className="mt-3 grid gap-2">
                    {set.subGroups.map((subGroup) => {
                      const checked = selected.includes(subGroup.id);
                      return (
                        <label
                          key={subGroup.id}
                          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99] ${
                            checked
                              ? 'bg-accent/15 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.28)]'
                              : 'bg-background/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:bg-offwhite/5'
                          }`}
                        >
                          <input
                            type={set.max === 1 ? 'radio' : 'checkbox'}
                            name={set.id}
                            checked={checked}
                            onChange={() => toggleSubGroup(set, subGroup.id)}
                            className="size-5 accent-accent"
                          />
                          <span className="text-xs font-semibold text-offwhite">{subGroup.name ?? subGroup.id}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

            <div className="rounded-[10px] bg-container2 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <p className="text-xs font-semibold text-offwhite">{t('dialog.whatHappensTitle')}</p>
              <p className="mt-2 text-xs leading-relaxed text-pretty text-lightGrey">{t('dialog.whatHappensBody')}</p>
            </div>
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button className="min-h-10 min-w-28 text-sm font-semibold tracking-wide uppercase" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            disabled={!isValid || isPending}
            variant="accent"
            className="min-h-10 min-w-32 text-sm font-semibold tracking-wide uppercase"
            onClick={() => onConfirm(implementation, selections)}
          >
            {isPending
              ? registerable
                ? t('actions.confirming')
                : t('actions.savingSelection')
              : registerable
                ? t('actions.confirm')
                : t('actions.saveSelection')}
          </Button>
        </footer>
      </motion.div>
    </motion.div>
  );
};
