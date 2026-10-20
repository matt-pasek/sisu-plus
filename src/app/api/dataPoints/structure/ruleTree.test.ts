/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { getRuleRange, hasAnyCourseRule, isAllRequired, ruleChildren, type EditableRule } from './ruleTree';

const cu = (id: string): EditableRule => ({ type: 'CourseUnitRule', courseUnitGroupId: id });

describe('ruleTree', () => {
  test('children of wrapper rules', () => {
    expect(ruleChildren({ type: 'CompositeRule', rules: [cu('a'), cu('b')] })).toHaveLength(2);
    expect(ruleChildren({ type: 'CreditsRule', rule: cu('a') })).toEqual([cu('a')]);
    expect(ruleChildren(cu('a'))).toEqual([]);
  });

  test('ranges by rule type', () => {
    expect(getRuleRange({ type: 'CreditsRule', credits: { min: 30 } })).toEqual({
      min: null,
      max: null,
      creditsMin: 30,
      creditsMax: null,
    });
    expect(getRuleRange({ type: 'CompositeRule', require: { min: 1, max: 1 } }).max).toBe(1);
  });

  test('any-course rule found at depth', () => {
    expect(
      hasAnyCourseRule({
        type: 'CreditsRule',
        rule: { type: 'CompositeRule', rules: [{ type: 'AnyCourseUnitRule' }] },
      }),
    ).toBe(true);
  });

  test('all required', () => {
    expect(isAllRequired({ type: 'CompositeRule', allMandatory: true, rules: [cu('a'), cu('b')] })).toBe(true);
    expect(isAllRequired({ type: 'CompositeRule', require: { min: 2 }, rules: [cu('a'), cu('b')] })).toBe(true);
    expect(isAllRequired({ type: 'CompositeRule', require: { min: 1 }, rules: [cu('a'), cu('b'), cu('c')] })).toBe(
      false,
    );
  });
});
