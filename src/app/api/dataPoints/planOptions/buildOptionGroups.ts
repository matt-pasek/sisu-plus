import type { CourseUnit, Module } from '@/app/api/generated/KoriApi';
import { stripMarkup } from '@/app/api/dataPoints/structure/markup';
import {
  getRuleRange,
  isAllRequired,
  ruleChildren,
  type EditableRule,
  type RuleRange,
} from '@/app/api/dataPoints/structure/ruleTree';

export interface PlanCourseOption {
  courseUnitId: string;
  courseUnitGroupId: string;
  code: string | null;
  name: string;
  credits: number | null;
  required: boolean;
}

export interface PlanOptionGroup extends RuleRange {
  id: string;
  sectionId: string;
  sectionName: string;
  moduleId: string;
  moduleName: string;
  title: string | null;
  options: PlanCourseOption[];
}

export type LocalizedText = Record<string, string | undefined>;
export type PickText = (value: LocalizedText) => string | null;

export interface BuildOptionGroupsArgs {
  module: Module;
  moduleName: string;
  sectionId: string;
  sectionName: string;
  courseUnits: CourseUnit[];
  pickText?: PickText;
}

const defaultPickText: PickText = (value) => value.en ?? value.fi ?? value.sv ?? null;

const NO_RANGE: RuleRange = { min: null, max: null, creditsMin: null, creditsMax: null };

const mergeRange = (own: RuleRange, inherited: RuleRange): RuleRange => ({
  min: own.min ?? inherited.min,
  max: own.max ?? inherited.max,
  creditsMin: own.creditsMin ?? inherited.creditsMin,
  creditsMax: own.creditsMax ?? inherited.creditsMax,
});

export const buildOptionGroups = ({
  module,
  moduleName,
  sectionId,
  sectionName,
  courseUnits,
  pickText = defaultPickText,
}: BuildOptionGroupsArgs): PlanOptionGroup[] => {
  const moduleId = module.id ?? module.groupId;
  const unitsByGroupId = new Map(courseUnits.map((unit) => [unit.groupId, unit]));

  const toOptions = (rules: EditableRule[], required: boolean): PlanCourseOption[] =>
    rules.flatMap((rule) => {
      const unit = rule.courseUnitGroupId ? unitsByGroupId.get(rule.courseUnitGroupId) : undefined;
      if (!unit?.id) return [];
      return [
        {
          courseUnitId: unit.id,
          courseUnitGroupId: unit.groupId,
          code: unit.code ?? null,
          name: pickText(unit.name as unknown as LocalizedText) ?? unit.code ?? unit.groupId,
          credits: unit.credits?.min ?? null,
          required,
        },
      ];
    });

  const visit = (node: EditableRule, path: string, inherited: RuleRange, standalone: boolean): PlanOptionGroup[] => {
    const range = mergeRange(getRuleRange(node), inherited);
    const children = ruleChildren(node);
    const isComposite = node.type === 'CompositeRule';

    const options = isComposite
      ? toOptions(
          children.filter((child) => child.type === 'CourseUnitRule'),
          isAllRequired(node),
        )
      : node.type === 'CourseUnitRule' && standalone
        ? toOptions([node], true)
        : [];

    const own: PlanOptionGroup[] =
      options.length === 0
        ? []
        : [
            {
              id: `${moduleId}:${node.localId ?? path}`,
              sectionId,
              sectionName,
              moduleId,
              moduleName,
              title:
                isComposite && node.description
                  ? stripMarkup(pickText(node.description as unknown as LocalizedText))
                  : null,
              options,
              ...range,
            },
          ];

    const nested = children.flatMap((child, index) =>
      visit(child, path ? `${path}.${index}` : `${index}`, isComposite ? NO_RANGE : range, !isComposite),
    );
    return [...own, ...nested];
  };

  return visit(module.rule as unknown as EditableRule, '', NO_RANGE, true);
};
