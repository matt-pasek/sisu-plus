import React, { useMemo } from 'react';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { CourseSearchSection } from '@/app/views/timeline/components/addCourse/CourseSearchSection.comp';
import { SuggestionGroupSection } from '@/app/views/timeline/components/addCourse/SuggestionGroupSection.comp';
import type { AddCourseInput } from '@/app/views/timeline/hooks/useAddCourseFlow';
import { usePeriodSuggestions } from '@/app/views/timeline/hooks/usePeriodSuggestions';

interface Props {
  plan: Plan | undefined;
  targetLocator: string;
  courses: TimelineCourse[];
  studyPeriodMap: StudyPeriodMap;
  attainments: CourseUnitAttainmentRestricted[];
  pendingAddId: string | null;
  lastAddedId: string | null;
  keepVisibleId: string | null;
  isWriting: boolean;
  onAdd: (input: AddCourseInput) => void;
  onUndo: () => void;
}

const SKELETON_ROWS = [0, 1, 2];

export const AddCourseSuggestions: React.FC<Props> = ({
  plan,
  targetLocator,
  courses,
  studyPeriodMap,
  attainments,
  pendingAddId,
  lastAddedId,
  keepVisibleId,
  isWriting,
  onAdd,
  onUndo,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const addProgress = useMemo(() => ({ pendingAddId, lastAddedId }), [lastAddedId, pendingAddId]);
  const {
    groups,
    optionGroups,
    prerequisitesById,
    freeSearchModules,
    planCourseUnitIds,
    planGroupIds,
    periods,
    isLoading,
    loadFailed,
    uncheckedCount,
  } = usePeriodSuggestions({
    plan,
    enabled: true,
    targetLocator,
    courses,
    studyPeriodMap,
    attainments,
    keepVisibleId,
  });

  return (
    <>
      {!isLoading && !loadFailed && groups.length === 0 && (
        <div className="mb-3 flex flex-col gap-1">
          <p className="text-xs text-pretty text-lightGrey">
            {t(freeSearchModules.length > 0 ? 'addCourse.empty' : 'addCourse.emptyNoSearch')}
          </p>
          {uncheckedCount > 0 && (
            <p className="text-[11px] text-lightGrey">{t('addCourse.someUnchecked', { count: uncheckedCount })}</p>
          )}
        </div>
      )}
      <CourseSearchSection
        freeSearchModules={freeSearchModules}
        optionGroups={optionGroups}
        planGroupIds={planGroupIds}
        planCourseUnitIds={planCourseUnitIds}
        courses={courses}
        attainments={attainments}
        periods={periods}
        targetLocator={targetLocator}
        addProgress={addProgress}
        keepVisibleId={keepVisibleId}
        isWriting={isWriting}
        onAdd={onAdd}
        onUndo={onUndo}
      />
      {isLoading ? (
        <div role="status" aria-label={t('addCourse.loading')} className="flex flex-col gap-2">
          {SKELETON_ROWS.map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-lg bg-container2/80 motion-reduce:animate-none" />
          ))}
        </div>
      ) : loadFailed ? (
        <p role="alert" className="text-xs text-warn">
          {t('addCourse.loadFailed')}
        </p>
      ) : groups.length === 0 ? null : (
        <>
          {groups.map((suggestionGroup) => (
            <SuggestionGroupSection
              key={suggestionGroup.group.id}
              suggestionGroup={suggestionGroup}
              prerequisitesById={prerequisitesById}
              studyPeriodMap={studyPeriodMap}
              targetLocator={targetLocator}
              addProgress={addProgress}
              isWriting={isWriting}
              onAdd={onAdd}
              onUndo={onUndo}
            />
          ))}
          {uncheckedCount > 0 && (
            <p className="mt-4 text-[11px] text-lightGrey">{t('addCourse.someUnchecked', { count: uncheckedCount })}</p>
          )}
        </>
      )}
    </>
  );
};
