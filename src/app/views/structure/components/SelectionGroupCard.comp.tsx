import React from 'react';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { StructureOption, StructureSelectionGroup } from '@/app/views/structure/types';
import {
  isGroupFull,
  isOptionSelected,
  isSingleChoiceGroup,
} from '@/app/views/structure/util/editing/selectionGroupChoice';
import { ReplacedByHint } from './ReplacedByHint.comp';

interface Props {
  color: ModuleColor;
  courseNames: Map<string, string>;
  draftPlan: Plan;
  group: StructureSelectionGroup;
  onSelect: (option: StructureOption) => void;
}

export const SelectionGroupCard: React.FC<Props> = ({ color, courseNames, draftPlan, group, onSelect }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const markerShape = isSingleChoiceGroup(group) ? 'rounded-full' : 'rounded-[5px]';
  const groupFull = isGroupFull(group, draftPlan);

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
          const locked = groupFull && !selected;
          return (
            <button
              key={`${option.type}:${option.id}`}
              className={`group flex min-h-16 items-center gap-3 rounded-md px-3 py-2 text-left transition-[background-color,box-shadow,scale,opacity] ${
                selected
                  ? 'bg-accent/12 shadow-[0_0_0_1px_rgba(82,201,137,0.28)] active:scale-[0.98]'
                  : locked
                    ? 'cursor-not-allowed bg-container opacity-45'
                    : 'bg-container hover:bg-container/80 active:scale-[0.98]'
              }`}
              type="button"
              disabled={locked}
              onClick={() => onSelect(option)}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center border ${markerShape} ${
                  selected ? 'border-lighterGreen bg-lighterGreen text-container' : 'border-darkishGrey'
                }`}
              >
                {selected && <span className={`size-2 bg-container ${markerShape}`} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-offwhite">{option.name}</span>
                <span className="mt-1 block font-mono text-xs text-lightGrey">
                  {option.code ?? option.id} · {option.credits ?? 0} cr
                </span>
                {option.type === 'course' && (
                  <ReplacedByHint
                    plan={draftPlan}
                    courseUnitId={option.id}
                    courseNames={courseNames}
                    iconClassName={color.text}
                  />
                )}
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
