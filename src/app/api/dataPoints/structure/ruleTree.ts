import type { LocalizedMarkupString } from '@/app/api/generated/KoriApi';

export type EditableRule = {
  type: string;
  localId?: string;
  rules?: EditableRule[];
  rule?: EditableRule;
  require?: { min: number; max?: number };
  count?: { min: number; max?: number };
  credits?: { min: number; max?: number };
  description?: LocalizedMarkupString;
  moduleGroupId?: string;
  courseUnitGroupId?: string;
  allMandatory?: boolean;
};

export interface RuleRange {
  min: number | null;
  max: number | null;
  creditsMin: number | null;
  creditsMax: number | null;
}

export const ruleChildren = (rule: EditableRule): EditableRule[] => {
  if (rule.type === 'CompositeRule') return rule.rules ?? [];
  if (rule.type === 'CourseUnitCountRule') return rule.rule ? [rule.rule] : [];
  if (rule.type === 'CreditsRule') return rule.rule ? [rule.rule] : [];
  return [];
};

export const getRuleRange = (rule: EditableRule): RuleRange => {
  if (rule.type === 'CompositeRule')
    return { min: rule.require?.min ?? null, max: rule.require?.max ?? null, creditsMin: null, creditsMax: null };
  if (rule.type === 'CourseUnitCountRule') {
    return { min: rule.count?.min ?? null, max: rule.count?.max ?? null, creditsMin: null, creditsMax: null };
  }
  if (rule.type === 'CreditsRule') {
    return { min: null, max: null, creditsMin: rule.credits?.min ?? null, creditsMax: rule.credits?.max ?? null };
  }
  return { min: null, max: null, creditsMin: null, creditsMax: null };
};

export const collectRuleGroupIds = (
  rule: EditableRule,
  result = { moduleGroupIds: new Set<string>(), courseUnitGroupIds: new Set<string>() },
) => {
  if (rule.type === 'ModuleRule' && rule.moduleGroupId) result.moduleGroupIds.add(rule.moduleGroupId);
  if (rule.type === 'CourseUnitRule' && rule.courseUnitGroupId) result.courseUnitGroupIds.add(rule.courseUnitGroupId);
  for (const child of ruleChildren(rule)) collectRuleGroupIds(child, result);
  return result;
};

export const hasAnyCourseRule = (rule: EditableRule): boolean =>
  rule.type === 'AnyCourseUnitRule' || ruleChildren(rule).some(hasAnyCourseRule);

export const isAllRequired = (rule: EditableRule): boolean =>
  rule.allMandatory === true ||
  (rule.type === 'CompositeRule' && rule.require != null && rule.require.min >= (rule.rules?.length ?? 0));
