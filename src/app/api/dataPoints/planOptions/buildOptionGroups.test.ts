/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import type { CourseUnit, Module } from '@/app/api/generated/KoriApi';
import { buildOptionGroups } from './buildOptionGroups';

const course = (groupId: string, credits = 5) =>
  ({
    id: `${groupId}-id`,
    groupId,
    code: groupId.toUpperCase(),
    name: { en: groupId },
    credits: { min: credits },
  }) as unknown as CourseUnit;
const moduleWith = (rule: unknown) => ({ id: 'm1', groupId: 'g-m1', rule }) as unknown as Module;
const args = (rule: unknown, courseUnits: CourseUnit[]) => ({
  module: moduleWith(rule),
  moduleName: 'Minor',
  sectionId: 's1',
  sectionName: 'Studies',
  courseUnits,
});

describe('buildOptionGroups', () => {
  test('a pick-one composite becomes one optional group', () => {
    const groups = buildOptionGroups(
      args(
        {
          type: 'CompositeRule',
          require: { min: 1, max: 1 },
          rules: [
            { type: 'CourseUnitRule', courseUnitGroupId: 'a' },
            { type: 'CourseUnitRule', courseUnitGroupId: 'b' },
          ],
        },
        [course('a'), course('b')],
      ),
    );
    expect(groups).toHaveLength(1);
    const [group] = groups;
    expect(group).toMatchObject({ moduleId: 'm1', sectionId: 's1', moduleName: 'Minor', min: 1, max: 1 });
    expect(group.options.map((o) => [o.courseUnitId, o.required])).toEqual([
      ['a-id', false],
      ['b-id', false],
    ]);
  });

  test('credit range from a wrapping CreditsRule reaches the group', () => {
    const [group] = buildOptionGroups(
      args(
        {
          type: 'CreditsRule',
          credits: { min: 30 },
          rule: { type: 'CompositeRule', rules: [{ type: 'CourseUnitRule', courseUnitGroupId: 'a' }] },
        },
        [course('a')],
      ),
    );
    expect(group.creditsMin).toBe(30);
  });

  test('a lone course rule is a required one-option group', () => {
    expect(
      buildOptionGroups(args({ type: 'CourseUnitRule', courseUnitGroupId: 'a' }, [course('a')]))[0].options[0].required,
    ).toBe(true);
  });

  test('course rules whose unit was not fetched are skipped', () => {
    expect(
      buildOptionGroups(
        args({ type: 'CompositeRule', rules: [{ type: 'CourseUnitRule', courseUnitGroupId: 'zzz' }] }, []),
      ),
    ).toEqual([]);
  });
});
