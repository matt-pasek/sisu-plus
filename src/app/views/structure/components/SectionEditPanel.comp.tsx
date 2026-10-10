import React, { useState } from 'react';
import { searchCourseUnits } from '@/app/api/dataPoints/searchCourseUnits';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { getSectionInstructionsForEdit } from '@/app/views/structure/components/sectionInstructions';
import { SectionData } from '@/app/views/structure/types';
import { chooseGroupOption } from '@/app/views/structure/util/editing/selectionGroupChoice';
import { addCourseToModule, removeCourseFromModule } from '@/app/views/structure/util/editing/structurePlanDraft';
import { ReplacedByHint } from './ReplacedByHint.comp';
import { SelectionGroupCard } from './SelectionGroupCard.comp';

interface Props {
  color: ModuleColor;
  draftPlan: Plan;
  section: SectionData;
  onDraftPlanChange: (plan: Plan) => void;
}

function selectedCourseIds(plan: Plan): Set<string> {
  return new Set(plan.courseUnitSelections.map((selection) => selection.courseUnitId));
}

export const SectionEditPanel: React.FC<Props> = ({ color, draftPlan, section, onDraftPlanChange }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const [query, setQuery] = useState('');
  const search = searchCourseUnits(query.trim());
  const selectedCourses = selectedCourseIds(draftPlan);
  const courseNames = new Map(
    section.courses.map((course) => [course.courseUnitId, course.name ?? course.code ?? course.courseUnitId]),
  );
  const sectionInstructions = getSectionInstructionsForEdit(section.instructions, section.selectionGroups);

  return (
    <div className="border-t border-border/80 bg-container/70 px-4 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-bold tracking-[0.13em] text-lightGrey uppercase">{t('edit.title')}</div>
          <p className="mt-1 text-xs text-darkishGrey">{t('edit.draftHint')}</p>
        </div>
        <span className={`rounded px-2 py-1 font-mono text-xs font-semibold ${color.text} bg-container2`}>
          {section.selectionGroups.length} {t('edit.groups')}
        </span>
      </div>

      <div className="grid gap-3">
        {sectionInstructions && (
          <div className="rounded-lg bg-container2/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="mb-1 text-xs font-bold tracking-[0.13em] text-lightGrey uppercase">
              {t('edit.instructions')}
            </div>
            <p className="text-sm leading-6 text-offwhite">{sectionInstructions}</p>
          </div>
        )}

        {section.selectionGroups.map((group) => (
          <SelectionGroupCard
            key={group.id}
            color={color}
            courseNames={courseNames}
            draftPlan={draftPlan}
            group={group}
            onSelect={(option) => onDraftPlanChange(chooseGroupOption(draftPlan, group, option))}
          />
        ))}

        {section.selectionGroups.length === 0 && (
          <div className="rounded-lg bg-container2/60 px-4 py-3 text-sm text-lightGrey">{t('edit.noGroups')}</div>
        )}

        {section.supportsFreeCourseSearch && (
          <div className="rounded-lg bg-container2/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <label className="mb-2 block text-xs font-bold tracking-[0.13em] text-lightGrey uppercase">
              {t('edit.searchLabel')}
            </label>
            <input
              className="w-full rounded-md border border-border2 bg-container px-3 py-2 text-sm text-offwhite transition-colors outline-none placeholder:text-darkishGrey focus:border-accent"
              placeholder={t('edit.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query.trim().length > 0 && query.trim().length < 3 && (
              <p className="mt-2 text-xs text-darkishGrey">{t('edit.searchMinLength')}</p>
            )}
            <div className="mt-3 grid gap-2">
              {(search.data ?? []).map((course) => {
                const isSelected = selectedCourses.has(course.courseUnitId);
                return (
                  <button
                    key={course.courseUnitId}
                    className={`flex min-h-14 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                      isSelected ? 'bg-accent/12 text-lighterGreen' : 'bg-container hover:bg-container/80'
                    }`}
                    type="button"
                    onClick={() =>
                      onDraftPlanChange(
                        isSelected
                          ? removeCourseFromModule(draftPlan, course.courseUnitId, section.moduleId)
                          : addCourseToModule(draftPlan, course.courseUnitId, section.moduleId),
                      )
                    }
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-offwhite">{course.name}</span>
                      <span className="mt-1 block font-mono text-xs text-lightGrey">
                        {course.code ?? course.courseUnitId} · {course.credits ?? 0} cr
                      </span>
                      <ReplacedByHint
                        plan={draftPlan}
                        courseUnitId={course.courseUnitId}
                        courseNames={courseNames}
                        iconClassName={color.text}
                      />
                    </span>
                    <span className={`shrink-0 text-sm font-bold ${isSelected ? 'text-lighterGreen' : color.text}`}>
                      {isSelected ? t('edit.remove') : t('edit.add')}
                    </span>
                  </button>
                );
              })}
              {search.isLoading && <div className="text-xs text-darkishGrey">{t('edit.searching')}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
