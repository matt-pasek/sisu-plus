import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { PLAN_WRITE_KEY } from '@/app/api/dataPoints/planCache';
import type { PlanCourseOption } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import { useAddCourseToPlan } from '@/app/api/dataPoints/useAddCourseToPlan';
import { useRemoveCourseFromPlan } from '@/app/api/dataPoints/useRemoveCourseFromPlan';
import { notify } from '@/app/components/ui/notify';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { ADD_UNDO_MS, MIN_TOAST_UNDO_MS } from '@/app/views/timeline/constants/addCourse.const';
import { toCandidateCourse } from '@/app/views/timeline/util/candidateCourse';

export interface AddCourseInput {
  option: PlanCourseOption;
  sectionId: string;
  sectionName: string;
  parentModuleId: string;
  periodLocators: string[];
}

interface Args {
  planId: string | undefined;
  studyPeriodMap: StudyPeriodMap;
}

interface AddedCourse {
  id: string;
  name: string;
  planId: string;
}

const idInPlan = (course: AddedCourse | null, planId: string | undefined): string | null =>
  course && course.planId === planId ? course.id : null;

export const useAddCourseFlow = ({ planId, studyPeriodMap }: Args) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const [openLocator, setOpenLocator] = useState<string | null>(null);
  const [pendingAdd, setPendingAdd] = useState<AddedCourse | null>(null);
  const [lastAdded, setLastAdded] = useState<AddedCourse | null>(null);
  const [undoing, setUndoing] = useState<AddedCourse | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const undoTimerRef = useRef<number | undefined>(undefined);
  const undoableRef = useRef<{ course: AddedCourse; until: number } | null>(null);
  const sessionRef = useRef(0);
  const { mutate: addMutate } = useAddCourseToPlan();
  const { mutate: removeMutate } = useRemoveCourseFromPlan();
  const isWriting = useIsMutating({ mutationKey: PLAN_WRITE_KEY }) > 0;

  const clearUndoTimer = useCallback(() => {
    window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = undefined;
  }, []);

  useEffect(() => clearUndoTimer, [clearUndoTimer]);

  const startUndoWindow = useCallback(
    (course: AddedCourse) => {
      clearUndoTimer();
      setLastAdded(course);
      undoableRef.current = { course, until: Date.now() + ADD_UNDO_MS };
      undoTimerRef.current = window.setTimeout(() => {
        setLastAdded(null);
        undoableRef.current = null;
      }, ADD_UNDO_MS);
    },
    [clearUndoTimer],
  );

  const endUndoWindow = useCallback(() => {
    clearUndoTimer();
    setLastAdded(null);
    undoableRef.current = null;
  }, [clearUndoTimer]);

  const removeAdded = useCallback(
    (course: AddedCourse) => {
      removeMutate(
        { courseUnitId: course.id, planId: course.planId },
        {
          onError: () => notify.error(t('addCourse.undoFailed', { course: course.name })),
          onSettled: () => setUndoing(null),
        },
      );
      setUndoing(course);
    },
    [removeMutate, t],
  );

  const handOffUndo = useCallback(
    (course: AddedCourse, durationMs: number) => {
      if (durationMs < MIN_TOAST_UNDO_MS) return;
      notify.undoable(t('addCourse.addedToast', { course: course.name }), {
        label: t('addCourse.undo'),
        onAction: () => removeAdded(course),
        durationMs,
      });
    },
    [removeAdded, t],
  );

  const open = useCallback((periodLocator: string, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenLocator(periodLocator);
  }, []);

  const dismiss = useCallback(() => {
    sessionRef.current += 1;
    const undoable = undoableRef.current;
    if (undoable) handOffUndo(undoable.course, undoable.until - Date.now());
    endUndoWindow();
    setOpenLocator(null);
    triggerRef.current = null;
  }, [endUndoWindow, handOffUndo]);

  const close = useCallback(() => {
    triggerRef.current?.focus({ preventScroll: true });
    dismiss();
  }, [dismiss]);

  const add = useCallback(
    (input: AddCourseInput) => {
      if (!planId || isWriting) return;
      const plannedPeriods = input.periodLocators.flatMap((locator) => {
        const info = studyPeriodMap.get(locator);
        return info ? [info] : [];
      });
      const { courseUnitId, courseUnitGroupId, name } = input.option;
      const course = { id: courseUnitId, name, planId };
      const session = sessionRef.current;
      endUndoWindow();
      setPendingAdd(course);
      addMutate(
        {
          courseUnitId,
          courseUnitGroupId,
          parentModuleId: input.parentModuleId,
          plannedPeriodLocators: input.periodLocators,
          planId,
          optimisticCourse: toCandidateCourse({
            option: input.option,
            sectionId: input.sectionId,
            sectionName: input.sectionName,
            parentModuleId: input.parentModuleId,
            plannedPeriods,
          }),
        },
        {
          onSuccess: () => {
            if (sessionRef.current === session) startUndoWindow(course);
            else handOffUndo(course, ADD_UNDO_MS);
          },
          onError: () => notify.error(t('addCourse.addFailed', { course: name })),
          onSettled: () => setPendingAdd((current) => (current?.id === courseUnitId ? null : current)),
        },
      );
    },
    [addMutate, endUndoWindow, handOffUndo, isWriting, planId, startUndoWindow, studyPeriodMap, t],
  );

  const undo = useCallback(() => {
    if (!lastAdded || lastAdded.planId !== planId || isWriting) return;
    endUndoWindow();
    removeAdded(lastAdded);
  }, [endUndoWindow, isWriting, lastAdded, planId, removeAdded]);

  const pendingAddId = idInPlan(pendingAdd, planId);
  const lastAddedId = idInPlan(lastAdded, planId);

  return {
    openLocator,
    open,
    close,
    dismiss,
    add,
    undo,
    pendingAddId,
    lastAddedId,
    keepVisibleId: pendingAddId ?? lastAddedId ?? idInPlan(undoing, planId),
    isWriting,
  };
};
