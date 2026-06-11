import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRegistrationCourses,
  type RegistrationCourse,
  type RegistrationImplementation,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { notify } from '@/app/components/ui/notify';
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

const RegistrationView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.registration');
  const queryClient = useQueryClient();
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
    <section className="mx-auto max-w-275 pb-10">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl leading-tight font-semibold text-balance text-offwhite">{t('title')}</h1>
          <p className="mt-1 text-sm text-pretty text-lightGrey">{t('subtitle')}</p>
        </div>
        <Button
          className="min-h-10 min-w-32 rounded-lg px-3 py-2 text-xs font-semibold"
          onClick={() => {
            void refreshRegistration().then(() => notify.success(t('messages.refreshed')));
          }}
        >
          {t('actions.updateView')}
        </Button>
      </header>

      <div ref={periodScrollerRef} className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
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
              className={`min-h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,opacity,transform] duration-150 active:scale-[0.96] ${
                selected
                  ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.7)]'
                  : 'bg-container text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] hover:text-offwhite'
              } ${state === 'past' ? 'opacity-45 hover:opacity-75' : ''}`}
            >
              {state === 'current' && <span className="mr-2 text-accent">•</span>}
              {period.label}
            </button>
          );
        })}
      </div>

      <div className="mb-5 inline-flex rounded-[9px] bg-container2 p-0.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
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
            className={`min-h-9 cursor-pointer rounded-md px-4 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
              selectedTab === value
                ? 'bg-container text-offwhite shadow-[0_1px_4px_rgba(0,0,0,0.3)]'
                : 'text-lightGrey hover:text-offwhite'
            }`}
          >
            {label}
            <span className="ml-2 rounded bg-[#3a355f] px-2 py-0.5 text-xs text-[#b8a6ff] tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      {selectedPeriod ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <section className="min-w-0">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.07em] text-darkishGrey uppercase">
                {selectedTab === 'exam' ? t('labels.availableExams') : t('actions.register')}
                <span className="ml-2 rounded bg-container2 px-2 py-0.5 tracking-normal text-lightGrey tabular-nums">
                  {availableCourses.length}
                </span>
              </h2>
            </div>

            <div className="space-y-1.5">
              {availableCourses.length > 0 ? (
                availableCourses.map((course) => {
                  const implementation = isCourseSelectionDraftForTab(course, selectedTab)
                    ? getDraftImplementation(course, selectedTab)
                    : getSelectableImplementation(course, selectedTab);
                  return (
                    <AvailableCard
                      key={course.courseUnitId}
                      course={course}
                      implementation={implementation}
                      tab={selectedTab}
                      onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                    />
                  );
                })
              ) : (
                <EmptyState
                  title={selectedTab === 'exam' ? t('empty.noAvailableExams') : t('empty.noAvailableCourses')}
                  body={t('empty.noAvailableBody')}
                />
              )}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.07em] text-darkishGrey uppercase">
                {selectedTab === 'exam' ? t('labels.examRegistrationsConfirmed') : t('labels.registrationProcessed')}
                <span className="ml-2 rounded bg-accent/20 px-2 py-0.5 tracking-normal text-lighterGreen tabular-nums">
                  {displayedRegistrationCount}
                </span>
              </h2>
              <div className="flex items-center gap-3">
                {selectedTab === 'course' && (
                  <span className="text-xs font-semibold text-lightGrey tabular-nums">
                    {confirmedCredits} {t('labels.totalCredits')}
                  </span>
                )}
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-lightGrey transition-colors hover:text-offwhite">
                  <input
                    type="checkbox"
                    checked={showAllAttempts}
                    onChange={(event) => setShowAllAttempts(event.target.checked)}
                    className="size-3.5 accent-accent"
                  />
                  {t('labels.showAttempts')}
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              {showAllAttempts && confirmedAttempts.length > 0 ? (
                confirmedAttempts.map(({ course, enrolment }) => (
                  <RegisteredCard
                    key={enrolment.id ?? `${course.courseUnitId}-${enrolment.courseUnitRealisationId}`}
                    course={course}
                    enrolmentOverride={enrolment}
                    isPending={cancelMutation.isPending}
                    onCancel={(e, impl) => cancelMutation.mutate({ enrolment: e, implementation: impl })}
                    onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                    tab={selectedTab}
                    studyRight={studyRight?.[0].id}
                  />
                ))
              ) : !showAllAttempts && confirmedCourses.length > 0 ? (
                confirmedCourses.map((course) => (
                  <RegisteredCard
                    key={getEnrolmentForTab(course, selectedTab)?.id ?? `${course.courseUnitId}-${selectedTab}`}
                    course={course}
                    isPending={cancelMutation.isPending}
                    onCancel={(e, impl) => cancelMutation.mutate({ enrolment: e, implementation: impl })}
                    onSelect={(c, impl) => setDialogState({ course: c, implementation: impl })}
                    tab={selectedTab}
                    studyRight={studyRight?.[0].id}
                  />
                ))
              ) : (
                <EmptyState title={t('empty.noConfirmed')} body={t('empty.noConfirmedBody')} />
              )}
            </div>
          </section>
        </div>
      ) : (
        <EmptyState title={t('empty.noPlanned')} body={t('empty.noPlannedBody')} />
      )}

      {dialogState && !isStudyRightLoading && !isUserDetailsLoading && (
        <ImplementationDialog
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
    </section>
  );
};

export default RegistrationView;
