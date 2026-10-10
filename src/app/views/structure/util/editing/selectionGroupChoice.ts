import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { StructureOption, StructureSelectionGroup } from '@/app/views/structure/types';
import {
  addCourseToModule,
  addModuleToModule,
  removeCourseFromModule,
  removeModuleFromPlan,
  selectCourseOption,
  selectModuleOption,
} from './structurePlanDraft';

export const isOptionSelected = (option: StructureOption, plan: Plan): boolean =>
  option.type === 'module'
    ? plan.moduleSelections.some((selection) => selection.moduleId === option.id)
    : plan.courseUnitSelections.some((selection) => selection.courseUnitId === option.id);

export const isSingleChoiceGroup = (group: StructureSelectionGroup): boolean => group.max === 1;

export const isGroupFull = (group: StructureSelectionGroup, plan: Plan): boolean =>
  !isSingleChoiceGroup(group) &&
  group.max != null &&
  group.options.filter((option) => isOptionSelected(option, plan)).length >= group.max;

const optionIdsOfType = (group: StructureSelectionGroup, type: StructureOption['type']) =>
  group.options.filter((candidate) => candidate.type === type).map((candidate) => candidate.id);

const replaceChoice = (plan: Plan, group: StructureSelectionGroup, option: StructureOption): Plan => {
  if (option.type === 'module') {
    return selectModuleOption(plan, {
      parentModuleId: group.parentModuleId,
      selectedModuleId: option.id,
      optionModuleIds: optionIdsOfType(group, 'module'),
    });
  }
  return selectCourseOption(plan, {
    parentModuleId: group.parentModuleId,
    selectedCourseUnitId: option.id,
    optionCourseUnitIds: optionIdsOfType(group, 'course'),
  });
};

const toggleChoice = (plan: Plan, group: StructureSelectionGroup, option: StructureOption): Plan => {
  if (isOptionSelected(option, plan)) {
    return option.type === 'module'
      ? removeModuleFromPlan(plan, option.id)
      : removeCourseFromModule(plan, option.id, group.parentModuleId);
  }
  if (isGroupFull(group, plan)) return plan;
  return option.type === 'module'
    ? addModuleToModule(plan, option.id, group.parentModuleId)
    : addCourseToModule(plan, option.id, group.parentModuleId);
};

export const chooseGroupOption = (plan: Plan, group: StructureSelectionGroup, option: StructureOption): Plan =>
  isSingleChoiceGroup(group) ? replaceChoice(plan, group, option) : toggleChoice(plan, group, option);
