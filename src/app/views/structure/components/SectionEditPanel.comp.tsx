import React, { useState } from 'react';
import { searchCourseUnits } from '@/app/api/dataPoints/searchCourseUnits';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { getSectionInstructionsForEdit } from '@/app/views/structure/components/sectionInstructions';
import {
  addCourseToModule,
  removeCourseFromModule,
  selectCourseOption,
  selectModuleOption,
} from '@/app/views/structure/editing/structurePlanDraft';
import type { SectionData, StructureOption, StructureSelectionGroup } from '@/app/views/structure/structureTypes';

interface Props {
  color: ModuleColor;
  draftPlan: Plan;
  section: SectionData;
  onDraftPlanChange: (plan: Plan) => void;
}

function isOptionSelected(option: StructureOption, draftPlan: Plan): boolean {
  if (option.type === 'module') return draftPlan.moduleSelections.some((selection) => selection.moduleId === option.id);
  return draftPlan.courseUnitSelections.some((selection) => selection.courseUnitId === option.id);
}

function selectedCourseIds(plan: Plan): Set<string> {
  return new Set(plan.courseUnitSelections.map((selection) => selection.courseUnitId));
}

export const SectionEditPanel: React.FC<Props> = ({ color, draftPlan, section, onDraftPlanChange }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const [query, setQuery] = useState('');
  const search = searchCourseUnits(query.trim());
  const selectedCourses = selectedCourseIds(draftPlan);
  const sectionInstructions = getSectionInstructionsForEdit(section.instructions, section.selectionGroups);

  const chooseOption = (group: StructureSelectionGroup, option: StructureOption) => {
    if (option.type === 'module') {
      onDraftPlanChange(
        selectModuleOption(draftPlan, {
          parentModuleId: group.parentModuleId,
          selectedModuleId: option.id,
          optionModuleIds: group.options
            .filter((candidate) => candidate.type === 'module')
            .map((candidate) => candidate.id),
        }),
      );
      return;
    }

    onDraftPlanChange(
      selectCourseOption(draftPlan, {
        parentModuleId: group.parentModuleId,
        selectedCourseUnitId: option.id,
        optionCourseUnitIds: group.options
          .filter((candidate) => candidate.type === 'course')
          .map((candidate) => candidate.id),
      }),
    );
  };

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
            draftPlan={draftPlan}
            group={group}
            onSelect={(option) => chooseOption(group, option)}
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

const SelectionGroupCard: React.FC<{
  color: ModuleColor;
  draftPlan: Plan;
  group: StructureSelectionGroup;
  onSelect: (option: StructureOption) => void;
}> = ({ color, draftPlan, group, onSelect }) => {
  const { t } = useTranslationWithPrefix('views.structure');

  return (
    <section className="rounded-lg bg-container2/70 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-offwhite">{group.title}</h3>
          <p className="mt-1 text-xs text-lightGrey">
            {group.creditsMin != null
              ? t('edit.creditRule', { min: group.creditsMin, max: group.creditsMax ?? '∞' })
              : t('edit.countRule', { min: group.min ?? 0, max: group.max ?? '∞' })}
          </p>
          {group.instructions && <p className="mt-2 max-w-5xl text-sm leading-6 text-offwhite">{group.instructions}</p>}
        </div>
        <span className="rounded bg-container px-2 py-1 font-mono text-xs text-darkishGrey">
          {group.options.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {group.options.map((option) => {
          const selected = isOptionSelected(option, draftPlan);
          return (
            <button
              key={`${option.type}:${option.id}`}
              className={`group flex min-h-16 items-center gap-3 rounded-md px-3 py-2 text-left transition-[background-color,box-shadow,scale] active:scale-[0.98] ${
                selected
                  ? 'bg-accent/12 shadow-[0_0_0_1px_rgba(82,201,137,0.28)]'
                  : 'bg-container hover:bg-container/80'
              }`}
              type="button"
              onClick={() => onSelect(option)}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                  selected ? 'border-lighterGreen bg-lighterGreen text-container' : 'border-darkishGrey'
                }`}
              >
                {selected && <span className="size-2 rounded-full bg-container" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-offwhite">{option.name}</span>
                <span className="mt-1 block font-mono text-xs text-lightGrey">
                  {option.code ?? option.id} · {option.credits ?? 0} cr
                </span>
              </span>
              <span className={`shrink-0 text-xs font-bold ${selected ? 'text-lighterGreen' : color.text}`}>
                {selected ? t('edit.selected') : t('edit.select')}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
