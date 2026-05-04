import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRegistrationCourses,
  type RegistrationCourse,
  type RegistrationImplementation,
} from '@/app/api/dataPoints/getRegistrationCourses';
import { Button } from '@/app/components/ui/Button.comp';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { cancelRegistration, submitRegistration } from './registrationActions';
import {
  getImplementationsForTab,
  isCourseRegisteredForTab,
  isCourseSelectionDraftForTab,
  courseMatchesPeriod,
  getDraftImplementation,
  getDefaultPeriodId,
  getEnrolmentForTab,
  getEnrolmentsForTab,
  getImplementationForEnrolment,
  getPeriodState,
  getSelectableImplementation,
  getStatusForTab,
  sortAttemptsForTab,
  sortCoursesForTab,
} from './registrationUtils';
import { getRegistrationStatus } from '@/app/api/dataPoints/getRegistrationCourses';
import type { RegistrationAttempt, RegistrationTab } from './registrationTypes';
import { AvailableCard } from './components/AvailableCard.comp';
import { EmptyState } from './components/EmptyState.comp';
import { ImplementationDialog } from './components/ImplementationDialog.comp';
import { RegisteredCard } from './components/RegisteredCard.comp';

const RegistrationView: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: studyRight, isLoading: isStudyRightLoading } = useSisuQuery(['study-rights'], fetchStudyRights);
  const { courses, isLoading, periods, statusCourses } = getRegistrationCourses();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<RegistrationTab>('course');
  const [dialogState, setDialogState] = useState<{
    course: RegistrationCourse;
    implementation: RegistrationImplementation;
  } | null>(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
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
    mutationFn: ({
      course,
      implementation,
      selections,
      studyRightId,
    }: {
      course: RegistrationCourse;
      implementation: RegistrationImplementation;
      selections: Record<string, string[]>;
      studyRightId?: string;
    }) => submitRegistration(course, implementation, selections, studyRightId),
    onError: (error) => {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Registration failed.' });
    },
    onSuccess: async () => {
      setDialogState(null);
      setMessage({ tone: 'success', text: 'Registration sent to Sisu. Refreshing view...' });
      await refreshRegistration({ settleDelayMs: 700 });
      setMessage({ tone: 'success', text: 'Registration view updated.' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRegistration,
    onError: (error) => {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Cancellation failed.' });
    },
    onSuccess: async () => {
      setMessage({ tone: 'success', text: 'Registration cancellation sent to Sisu. Refreshing view...' });
      await refreshRegistration({ settleDelayMs: 700 });
      setMessage({ tone: 'success', text: 'Registration view updated.' });
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

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <InlineLoader />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1100px] pb-10">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl leading-tight font-semibold text-balance text-offwhite">Registration</h1>
          <p className="mt-1 text-sm text-pretty text-lightGrey">
            Select implementations, register for courses and exams.
          </p>
        </div>
        <Button
          className="min-h-10 min-w-32 rounded-lg px-3 py-2 text-xs font-semibold"
          onClick={() => {
            void refreshRegistration();
            setMessage({ tone: 'success', text: 'Registration view refreshed.' });
          }}
        >
          Update view
        </Button>
      </header>

      {message && (
        <div
          className={`mb-4 rounded-[10px] px-3 py-2 text-xs font-semibold ${
            message.tone === 'success'
              ? 'bg-accent/15 text-lighterGreen shadow-[inset_0_0_0_1px_rgba(82,201,137,0.18)]'
              : 'bg-danger/15 text-danger shadow-[inset_0_0_0_1px_rgba(240,107,107,0.18)]'
          }`}
          role={message.tone === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </div>
      )}

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
            ['course', 'Course Registration', courseCount],
            ['exam', 'Exam Registration', examCount],
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
                {selectedTab === 'exam' ? 'Available exams' : 'Register'}
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
                  title={selectedTab === 'exam' ? 'No available exam sittings' : 'No courses ready to register'}
                  body="You've registered for all implementations that are currently available for registration."
                />
              )}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.07em] text-darkishGrey uppercase">
                {selectedTab === 'exam' ? 'Exam registrations confirmed' : 'Registration processed'}
                <span className="ml-2 rounded bg-accent/20 px-2 py-0.5 tracking-normal text-lighterGreen tabular-nums">
                  {displayedRegistrationCount}
                </span>
              </h2>
              <div className="flex items-center gap-3">
                {selectedTab === 'course' && (
                  <span className="text-xs font-semibold text-lightGrey tabular-nums">{confirmedCredits} cr total</span>
                )}
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-lightGrey transition-colors hover:text-offwhite">
                  <input
                    type="checkbox"
                    checked={showAllAttempts}
                    onChange={(event) => setShowAllAttempts(event.target.checked)}
                    className="size-3.5 accent-[var(--color-accent)]"
                  />
                  Show attempts
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
                <EmptyState
                  title="No confirmed registrations"
                  body="When you register for a course or exam, the registration will first be processed. Once done, it will appear here."
                />
              )}
            </div>
          </section>
        </div>
      ) : (
        <EmptyState
          title="No planned courses with registration data"
          body="Add courses to your plan first, then return here when implementations are published."
        />
      )}

      {dialogState && !isStudyRightLoading && (
        <ImplementationDialog
          course={dialogState.course}
          initialImplementation={dialogState.implementation}
          isPending={registerMutation.isPending}
          onClose={() => setDialogState(null)}
          onConfirm={(implementation, selections) =>
            registerMutation.mutate({
              course: dialogState.course,
              implementation,
              selections,
              studyRightId: studyRight?.[0].id,
            })
          }
        />
      )}
    </section>
  );
};

export default RegistrationView;
