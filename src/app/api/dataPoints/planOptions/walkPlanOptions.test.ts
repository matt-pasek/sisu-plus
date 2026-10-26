/// <reference types="bun-types" />
import { describe, expect, mock, test } from 'bun:test';
import type { CourseUnit, Module } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { PickText } from './buildOptionGroups';
import { walkPlanOptions } from './walkPlanOptions';

const pickText: PickText = (value) => value.en ?? value.fi ?? value.sv ?? null;

const course = (groupId: string) =>
  ({ id: `${groupId}-id`, groupId, code: groupId.toUpperCase(), name: { en: groupId } }) as unknown as CourseUnit;
const moduleDoc = (id: string, rule: unknown) =>
  ({ id, groupId: `g-${id}`, name: { en: id }, rule }) as unknown as Module;

const documents: Record<string, Module> = {
  s1: moduleDoc('s1', {
    type: 'CompositeRule',
    rules: [
      { type: 'ModuleRule', moduleGroupId: 'g-minor' },
      { type: 'ModuleRule', moduleGroupId: 'g-other' },
      { type: 'CourseUnitRule', courseUnitGroupId: 'a' },
    ],
  }),
  minor: moduleDoc('minor', { type: 'CompositeRule', rules: [{ type: 'CourseUnitRule', courseUnitGroupId: 'b' }] }),
  other: moduleDoc('other', { type: 'CompositeRule', rules: [{ type: 'CourseUnitRule', courseUnitGroupId: 'c' }] }),
  free: moduleDoc('free', { type: 'AnyCourseUnitRule' }),
};

const unitsByModule: Record<string, CourseUnit[]> = {
  s1: [course('a')],
  minor: [course('b')],
  other: [course('c')],
  free: [],
};

const makeFakes = () => ({
  fetchModuleDocument: mock(async (id: string) => documents[id] ?? null),
  fetchRuleOptions: mock(async (module: Module) => ({
    modules: [],
    courseUnits: unitsByModule[module.id ?? ''] ?? [],
  })),
});

const makePlan = (moduleSelections: Array<{ moduleId: string; parentModuleId: string }>) =>
  ({ rootId: 'root', curriculumPeriodId: 'cp', moduleSelections }) as unknown as Pick<
    Plan,
    'rootId' | 'curriculumPeriodId' | 'moduleSelections'
  >;

describe('walkPlanOptions', () => {
  test('walks into chosen sub-modules only, attributing groups to the owning module', async () => {
    const fakes = makeFakes();
    const plan = makePlan([
      { moduleId: 's1', parentModuleId: 'root' },
      { moduleId: 'unfetched', parentModuleId: 'root' },
      { moduleId: 'minor', parentModuleId: 's1' },
    ]);
    const result = await walkPlanOptions(plan, fakes, pickText);
    expect(result.groups.map((g) => [g.moduleId, g.sectionId, g.options[0].courseUnitId])).toEqual([
      ['s1', 's1', 'a-id'],
      ['minor', 's1', 'b-id'],
    ]);
    expect(fakes.fetchModuleDocument).not.toHaveBeenCalledWith('other');
  });

  test('lists modules that accept any course for free search', async () => {
    const fakes = makeFakes();
    const plan = makePlan([
      { moduleId: 'a-wrapper', parentModuleId: 'root' },
      { moduleId: 'free', parentModuleId: 'root' },
    ]);
    const result = await walkPlanOptions(plan, fakes, pickText);
    expect(result.freeSearchModules.map((m) => m.moduleId)).toEqual(['free']);
  });

  test('a section whose rule options fail rejects instead of looking empty', async () => {
    const fakes = {
      ...makeFakes(),
      fetchRuleOptions: mock(async () => {
        throw new Error('network');
      }),
    };
    const plan = makePlan([
      { moduleId: 's1', parentModuleId: 'root' },
      { moduleId: 'free', parentModuleId: 'root' },
    ]);
    await expect(walkPlanOptions(plan, fakes, pickText)).rejects.toThrow('network');
  });

  test('a section document that fails to load rejects', async () => {
    const fakes = {
      ...makeFakes(),
      fetchModuleDocument: mock(async () => {
        throw new Error('network');
      }),
    };
    const plan = makePlan([
      { moduleId: 's1', parentModuleId: 'root' },
      { moduleId: 'free', parentModuleId: 'root' },
    ]);
    await expect(walkPlanOptions(plan, fakes, pickText)).rejects.toThrow('network');
  });

  test('a nested module that fails is skipped', async () => {
    const base = makeFakes();
    const fakes = {
      ...base,
      fetchModuleDocument: mock(async (id: string) => {
        if (id === 'minor') throw new Error('network');
        return documents[id] ?? null;
      }),
    };
    const plan = makePlan([
      { moduleId: 's1', parentModuleId: 'root' },
      { moduleId: 'unfetched', parentModuleId: 'root' },
      { moduleId: 'minor', parentModuleId: 's1' },
    ]);
    const result = await walkPlanOptions(plan, fakes, pickText);
    expect(result.groups.map((g) => g.moduleId)).toEqual(['s1']);
  });

  test('visits a module once even if selected twice', async () => {
    const fakes = makeFakes();
    const plan = makePlan([
      { moduleId: 's1', parentModuleId: 'root' },
      { moduleId: 'unfetched', parentModuleId: 'root' },
      { moduleId: 'minor', parentModuleId: 's1' },
      { moduleId: 'minor', parentModuleId: 's1' },
    ]);
    await walkPlanOptions(plan, fakes, pickText);
    expect(fakes.fetchModuleDocument.mock.calls.filter(([id]) => id === 'minor')).toHaveLength(1);
  });
});
