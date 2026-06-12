import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  getRegistrationCourses,
  type RegistrationCourse,
  type RegistrationImplementation,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { notify } from '@/app/components/ui/notify';
import { RefreshIcon } from '@/app/views/registration/components/icons';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { fetchUserDetails } from '@/app/api/endpoints/userDetails';

import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import { AvailableCard } from './components/AvailableCard.comp';
import { EmptyState } from './components/EmptyState.comp';
import { ImplementationDialog } from './components/ImplementationDialog.comp';
import { RegisteredCard } from './components/RegisteredCard.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  courseMatchesPeriod,
  formatDateRange,
  getDefaultPeriodId,
  getDraftImplementation,
  getEnrolmentForImplementation,
  getEnrolmentForTab,
  getEnrolmentsForTab,
  getImplementationForEnrolment,
  getImplementationsForTab,
  getPeriodState,
  getSelectableImplementation,
  getStatusForTab,
  isImplementationRegisterable,
  isCourseRegisteredForTab,
  isCourseSelectionDraftForTab,
  sortAttemptsForTab,
  sortCoursesForTab,
} from '@/app/views/registration/util';
import { RegistrationAttempt, RegistrationTab } from '@/app/views/registration/types';
import { cancelRegistration, removeOldEnrolment, submitRegistration } from '@/app/views/registration/util/actions';
import { PageLoader } from '@/app/components/PageLoader.comp';

const REGISTRATION_EASE = [0.22, 1, 0.36, 1] as const;

const getRegistrationPanelMotion = (shouldReduceMotion: boolean) => ({
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(2px)' },
  initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(3px)' },
  transition: { duration: shouldReduceMotion ? 0.01 : 0.2, ease: REGISTRATION_EASE },
});

const getRegistrationListItemMotion = (index: number, shouldReduceMotion: boolean) => ({
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(1px)' },
  initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(2px)' },
  transition: {
    delay: shouldReduceMotion ? 0 : Math.min(index, 6) * 0.025,
    duration: shouldReduceMotion ? 0.01 : 0.18,
    ease: REGISTRATION_EASE,
  },
});

const RegistrationView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.registration');
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion() === true;
  const { data: studyRight, isLoading: isStudyRightLoading } = useSisuQuery(['study-rights'], fetchStudyRights);
  const { data: userDetails, isLoading: isUserDetailsLoading } = useSisuQuery(['user-details'], fetchUserDetails);
  const { courses, isLoading, periods, statusCourses } = getRegistrationCourses();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<RegistrationTab>('course');
  const [dialogState, setDialogState] = useState<{
    course: RegistrationCourse;
    implementation: RegistrationImplementation;
  } | null>(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const periodScrollerRef = useRef<HTMLDivElement | null>(null);
  const periodButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const didScrollToInitialPeriod = useRef(false);

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.id === selectedPeriodId) ?? periods[0] ?? null,
    [selectedPeriodId, periods],
  );
  const selectedCourses = courses.filter((course) => courseMatchesPeriod(course, selectedPeriod));
  const tabCourses = selectedCourses.filter((course) => getImplementationsForTab(course, selectedTab).length > 0);
  const availableCourses = sortCoursesForTab(
    tabCourses.filter(
      (course) =>
        !isCourseRegisteredForTab(course, selectedTab) && getStatusForTab(course, selectedTab) !== 'processing',
    ),
    selectedTab,
  );
  const confirmedCourses = sortCoursesForTab(
    statusCourses.filter(
      (course) => courseMatchesPeriod(course, selectedPeriod) && isCourseRegisteredForTab(course, selectedTab),
    ),
    selectedTab,
  );
  const confirmedAttempts = sortAttemptsForTab(
    statusCourses.flatMap((course): RegistrationAttempt[] => {
      if (!courseMatchesPeriod(course, selectedPeriod)) return [];
      return getEnrolmentsForTab(course, selectedTab)
        .filter((enrolment) => {
          const status = getRegistrationStatus(enrolment, getImplementationForEnrolment(course, enrolment));
          return status === 'registered' || status === 'processing' || status === 'rejected';
        })
        .map((enrolment) => ({ course, enrolment }));
    }),
    selectedTab,
  );
  const displayedRegistrationCount = showAllAttempts ? confirmedAttempts.length : confirmedCourses.length;
  const courseCount = selectedCourses.filter((course) => getImplementationsForTab(course, 'course').length > 0).length;
  const examCount = selectedCourses.filter((course) => getImplementationsForTab(course, 'exam').length > 0).length;
  const confirmedCredits = confirmedCourses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
  const periodState = selectedPeriod ? getPeriodState(selectedPeriod) : null;
  const selectedPeriodRange = selectedPeriod ? formatDateRange(selectedPeriod.startDate, selectedPeriod.endDate) : null;

  const refreshRegistration = async ({ settleDelayMs = 0 }: { settleDelayMs?: number } = {}) => {
    if (settleDelayMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, settleDelayMs));
    }
    await queryClient.invalidateQueries({ queryKey: ['enrolments'] });
    await queryClient.refetchQueries({ queryKey: ['enrolments'], type: 'active' });
    await queryClient.invalidateQueries({ queryKey: ['registration-courses'] });
    await queryClient.refetchQueries({ queryKey: ['registration-courses'], type: 'active' });
  };

  const registerMutation = useMutation({
    mutationFn: async ({
      course,
      implementation,
      previousImplementation,
      selections,
      studyRightId,
      personId,
    }: {
      course: RegistrationCourse;
      implementation: RegistrationImplementation;
      previousImplementation?: RegistrationImplementation;
      selections: Record<string, string[]>;
      studyRightId?: string;
      personId?: string;
    }) => {
      if (previousImplementation) {
        const oldEnrolment = getEnrolmentForImplementation(course, previousImplementation);
        if (oldEnrolment) {
          await removeOldEnrolment(oldEnrolment, previousImplementation);
        }
      }
      return submitRegistration(course, implementation, selections, studyRightId, personId);
    },
    onError: (error) => {
      notify.error(error instanceof Error ? error.message : t('messages.registrationFailed'));
    },
    onSuccess: async (_enrolment, variables) => {
      setDialogState(null);
      notify.success(
        isImplementationRegisterable(variables.implementation)
          ? t('messages.registrationSent')
          : t('messages.selectionSaved'),
      );
      await refreshRegistration({ settleDelayMs: 700 });
      notify.success(t('messages.viewUpdated'));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRegistration,
    onError: (error) => {
      notify.error(error instanceof Error ? error.message : t('messages.cancellationFailed'));
    },
    onSuccess: async () => {
      notify.success(t('messages.refreshSent'));
      await refreshRegistration({ settleDelayMs: 700 });
      notify.success(t('messages.viewUpdated'));
    },
  });

  useEffect(() => {
    if (selectedPeriodId == null || !periods.some((period) => period.id === selectedPeriodId)) {
      setSelectedPeriodId(getDefaultPeriodId(periods));
    }
  }, [selectedPeriodId, periods]);

  useEffect(() => {
    if (didScrollToInitialPeriod.current || !selectedPeriod?.id) return;
    const scroller = periodScrollerRef.current;
    const button = periodButtonRefs.current[selectedPeriod.id];
    if (!scroller || !button) return;
    window.requestAnimationFrame(() => {
      const targetScrollLeft = button.offsetLeft - (scroller.clientWidth - button.offsetWidth) / 2;
      scroller.scrollLeft = Math.max(0, targetScrollLeft);
      didScrollToInitialPeriod.current = true;
    });
  }, [selectedPeriod?.id]);

  if (isLoading) return <PageLoader />;

  return (
    <section className="mx-auto flex flex-col gap-5 pb-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex min-w-0 items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
          <span className="size-1.5 shrink-0 rounded-full bg-lighterGreen shadow-[0_0_10px_rgba(82,201,137,0.7)]" />
          <span className="truncate">{t('title')}</span>
          <span aria-hidden="true">&middot;</span>
          <b className="truncate font-bold text-offwhite">{t('labels.courseExamRegistration')}</b>
        </span>
        <div className="flex shrink-0 gap-2 sm:justify-end">
          <Button
            className="min-h-10 gap-2 px-4 text-sm font-semibold"
            onClick={() => {
              void refreshRegistration().then(() => notify.success(t('messages.refreshed')));
            }}
          >
            <RefreshIcon className="size-4" />
            <span>{t('actions.updateView')}</span>
          </Button>
        </div>
      </header>

      <div
        ref={periodScrollerRef}
        className="-mx-0.5 flex gap-2.5 overflow-x-auto scroll-smooth px-0.5 pt-0.5 pb-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border2"
      >
        {periods.map((period) => {
          const state = getPeriodState(period);
          const selected = period.id === selectedPeriod?.id;
          return (
            <button
              key={period.id}
              ref={(element) => {
                periodButtonRefs.current[period.id] = element;
              }}
              type="button"
              onClick={() => setSelectedPeriodId(period.id)}
              className={`relative inline-flex min-h-[42px] shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-[11px] px-[18px] text-sm font-semibold whitespace-nowrap transition-[background-color,color,opacity,transform] duration-150 active:scale-[0.97] ${
                selected ? 'text-lighterGreen' : 'hover:bg-container3 bg-container2 text-lightGrey hover:text-offwhite'
              } ${state === 'past' ? 'opacity-50 hover:opacity-80' : ''}`}
            >
              {selected && (
                <motion.span
                  layoutId="registration-period-active"
                  className="absolute inset-0 bg-accent/15 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.7)]"
                  transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: REGISTRATION_EASE }}
                />
              )}
              {state === 'current' && (
                <span className="relative size-1.75 rounded-full bg-lighterGreen shadow-[0_0_9px_rgba(82,201,137,0.9)]" />
              )}
              <span className="relative">{period.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {selectedPeriod && (
          <motion.div
            key={selectedPeriod.id}
            className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(130%_170%_at_0%_0%,rgba(82,201,137,0.18),transparent_52%),linear-gradient(135deg,rgba(25,25,36,0.98),rgba(17,17,24,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_32px_64px_-44px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
            {...getRegistrationPanelMotion(shouldReduceMotion)}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-lighterGreen to-accent" />
            <div className="absolute -top-24 right-8 size-56 rounded-full bg-lighterGreen/10 blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-7 px-7 py-6">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="font-mono text-[11px] font-semibold text-offwhite/55 uppercase">
                  {periodState === 'current'
                    ? t('labels.open')
                    : periodState === 'past'
                      ? t('labels.finished')
                      : t('labels.upcoming')}
                </span>
                <h2 className="text-[1.8rem] leading-[1.08] font-bold text-balance text-offwhite">
                  {selectedPeriod.label}
                </h2>
                <p className="inline-flex flex-wrap items-center gap-2 text-[13.5px] text-offwhite/60">
                  {periodState === 'current' && (
                    <span className="inline-flex items-center gap-[7px] font-semibold text-lighterGreen">
                      <span className="size-1.5 animate-pulse rounded-full bg-lighterGreen" />
                      {t('labels.open')}
                    </span>
                  )}
                  {selectedPeriodRange}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <motion.div
                  layout
                  className="min-w-[116px] rounded-[14px] bg-[#12121a]/50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-md"
                >
                  <p className="text-[11px] font-medium text-offwhite/60">{t('labels.courseRegistration')}</p>
                  <p className="mt-2 font-mono text-2xl leading-none font-bold text-offwhite tabular-nums">
                    {courseCount}
                  </p>
                </motion.div>
                <motion.div
                  layout
                  className="min-w-[116px] rounded-[14px] bg-[#12121a]/50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-md"
                >
                  <p className="text-[11px] font-medium text-offwhite/60">{t('labels.examRegistration')}</p>
                  <p className="mt-2 font-mono text-2xl leading-none font-bold text-offwhite tabular-nums">
                    {examCount}
                  </p>
                </motion.div>
                <motion.div
                  layout
                  className="min-w-[116px] rounded-[14px] bg-[#12121a]/50 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-md"
                >
                  <p className="text-[11px] font-medium text-offwhite/60">{t('labels.registrationProcessed')}</p>
                  <p className="mt-2 font-mono text-2xl leading-none font-bold text-lighterGreen tabular-nums">
                    {displayedRegistrationCount}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="inline-flex w-fit rounded-xl bg-container2 p-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
        {(
          [
            ['course', t('labels.courseRegistration'), courseCount],
            ['exam', t('labels.examRegistration'), examCount],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedTab(value)}
            className={`relative inline-flex min-h-10 cursor-pointer items-center gap-2.5 overflow-hidden rounded-[9px] px-[18px] text-sm font-semibold transition-[color,transform] duration-150 active:scale-[0.97] ${
              selectedTab === value ? 'text-offwhite' : 'text-lightGrey hover:text-offwhite'
            }`}
          >
            {selectedTab === value && (
              <motion.span
                layoutId="registration-tab-active"
                className="absolute inset-0 bg-container shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
                transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: REGISTRATION_EASE }}
              />
            )}
            <span className="relative">{label}</span>
            <span className="relative rounded-md bg-[#3a355f] px-2 py-0.5 font-mono text-xs text-[#b8a6ff] tabular-nums">
              {count}
            </span>
          </button>
        ))}
      </div>

      {selectedPeriod ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="min-w-0">
            <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2.5 font-mono text-[11px] font-bold text-darkishGrey uppercase">
                {selectedTab === 'exam' ? t('labels.availableExams') : t('actions.register')}
                <span className="rounded-md bg-container2 px-2 py-0.5 text-lightGrey tabular-nums">
                  {availableCourses.length}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {availableCourses.length > 0 ? (
                  availableCourses.map((course, index) => {
                    const implementation = isCourseSelectionDraftForTab(course, selectedTab)
                      ? getDraftImplementation(course, selectedTab)
                      : getSelectableImplementation(course, selectedTab);
                    return (
                      <motion.div
                        key={course.courseUnitId}
                        layout
                        {...getRegistrationListItemMotion(index, shouldReduceMotion)}
                      >
                        <AvailableCard
                          course={course}
                          implementation={implementation}
                          tab={selectedTab}
                          onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                        />
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    key={`available-empty-${selectedTab}`}
                    {...getRegistrationListItemMotion(0, shouldReduceMotion)}
                  >
                    <EmptyState
                      title={selectedTab === 'exam' ? t('empty.noAvailableExams') : t('empty.noAvailableCourses')}
                      body={t('empty.noAvailableBody')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-3 flex min-h-6 flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2.5 font-mono text-[11px] font-bold text-darkishGrey uppercase">
                {selectedTab === 'exam' ? t('labels.examRegistrationsConfirmed') : t('labels.registrationProcessed')}
                <span className="rounded-md bg-accent/20 px-2 py-0.5 text-lighterGreen tabular-nums">
                  {displayedRegistrationCount}
                </span>
              </h2>
              <div className="inline-flex items-center gap-4 text-xs text-lightGrey">
                {selectedTab === 'course' && (
                  <span className="font-semibold tabular-nums">
                    {confirmedCredits} {t('labels.totalCredits')}
                  </span>
                )}
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 font-semibold transition-colors hover:text-offwhite ${
                    showAllAttempts ? 'text-offwhite' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={showAllAttempts}
                    onChange={(event) => setShowAllAttempts(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="grid size-[15px] place-items-center rounded bg-transparent shadow-[inset_0_0_0_1.5px_rgba(120,120,160,0.6)] transition-[background-color,box-shadow] peer-checked:bg-accent peer-checked:shadow-[inset_0_0_0_1.5px_rgba(65,150,72,1)] after:size-1.5 after:scale-50 after:rounded-full after:bg-offwhite after:opacity-0 after:transition-[opacity,transform] after:duration-150 peer-checked:after:scale-100 peer-checked:after:opacity-100" />
                  {t('labels.showAttempts')}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {showAllAttempts && confirmedAttempts.length > 0 ? (
                  confirmedAttempts.map(({ course, enrolment }, index) => (
                    <motion.div
                      key={enrolment.id ?? `${course.courseUnitId}-${enrolment.courseUnitRealisationId}`}
                      layout
                      {...getRegistrationListItemMotion(index, shouldReduceMotion)}
                    >
                      <RegisteredCard
                        course={course}
                        enrolmentOverride={enrolment}
                        isPending={cancelMutation.isPending}
                        onCancel={(e, impl) => cancelMutation.mutate({ enrolment: e, implementation: impl })}
                        onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                        tab={selectedTab}
                        studyRight={studyRight?.[0].id}
                      />
                    </motion.div>
                  ))
                ) : !showAllAttempts && confirmedCourses.length > 0 ? (
                  confirmedCourses.map((course, index) => (
                    <motion.div
                      key={getEnrolmentForTab(course, selectedTab)?.id ?? `${course.courseUnitId}-${selectedTab}`}
                      layout
                      {...getRegistrationListItemMotion(index, shouldReduceMotion)}
                    >
                      <RegisteredCard
                        course={course}
                        isPending={cancelMutation.isPending}
                        onCancel={(e, impl) => cancelMutation.mutate({ enrolment: e, implementation: impl })}
                        onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                        tab={selectedTab}
                        studyRight={studyRight?.[0].id}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key={`confirmed-empty-${selectedTab}`}
                    {...getRegistrationListItemMotion(0, shouldReduceMotion)}
                  >
                    <EmptyState title={t('empty.noConfirmed')} body={t('empty.noConfirmedBody')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      ) : (
        <EmptyState title={t('empty.noPlanned')} body={t('empty.noPlannedBody')} />
      )}

      <AnimatePresence initial={false}>
        {dialogState && !isStudyRightLoading && !isUserDetailsLoading && (
          <ImplementationDialog
            key={dialogState.implementation.id}
            course={dialogState.course}
            initialImplementation={dialogState.implementation}
            isPending={registerMutation.isPending}
            onClose={() => setDialogState(null)}
            onConfirm={(implementation, selections) =>
              registerMutation.mutate({
                course: dialogState.course,
                implementation,
                previousImplementation:
                  implementation.id !== dialogState.implementation.id ? dialogState.implementation : undefined,
                selections,
                personId: userDetails?.id,
                studyRightId: studyRight?.[0].id,
              })
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default RegistrationView;
