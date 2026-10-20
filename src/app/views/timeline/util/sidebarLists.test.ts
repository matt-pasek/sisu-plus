/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { makeCourse, makePeriod } from './__fixtures__/timeline';
import { getShortModuleName, listIssues, listModules } from './sidebarLists';

describe('getShortModuleName', () => {
  test('drops a trailing generic word', () => {
    expect(getShortModuleName('General Studies')).toBe('General');
    expect(getShortModuleName('Elective studies')).toBe('Elective');
    expect(getShortModuleName('Syventävät opinnot')).toBe('Syventävät');
  });

  test('falls back to the first word when the name is still long', () => {
    expect(getShortModuleName('Intermediate Specialisation Studies')).toBe('Intermediate');
    expect(getShortModuleName('Language and Communication Studies')).toBe('Language');
    expect(getShortModuleName('Kieli- ja viestintäopinnot')).toBe('Kieli');
  });

  test('keeps short names and Finnish compounds whole', () => {
    expect(getShortModuleName('Yleisopinnot')).toBe('Yleisopinnot');
    expect(getShortModuleName('  Minor  ')).toBe('Minor');
    expect(getShortModuleName('Studies')).toBe('Studies');
  });
});

describe('listModules', () => {
  test('keeps first-seen order, skips null modules, falls back to the unknown label', () => {
    const courses = [
      makeCourse({ courseUnitId: 'a', moduleId: 'm2', moduleName: 'Minor' }),
      makeCourse({ courseUnitId: 'b', moduleId: null }),
      makeCourse({ courseUnitId: 'c', moduleId: 'm1', moduleName: null }),
      makeCourse({ courseUnitId: 'd', moduleId: 'm2', moduleName: 'Minor' }),
    ];
    expect(listModules(courses, 'Unknown')).toEqual([
      { id: 'm2', name: 'Minor' },
      { id: 'm1', name: 'Unknown' },
    ]);
  });
});

describe('listIssues', () => {
  test('one row per warning, ordered by first planned period then name', () => {
    const late = makeCourse({
      courseUnitId: 'late',
      courseName: 'B',
      plannedPeriods: [makePeriod({ locator: 'p2', startDate: '2027-01-01' })],
    });
    const early = makeCourse({
      courseUnitId: 'early',
      courseName: null,
      courseCode: 'CT1',
      plannedPeriods: [makePeriod({ locator: 'p1' })],
    });
    const w = (id: string) => ({ id, message: id, type: 'prerequisite' as const });
    const rows = listIssues(
      new Map([
        ['late', [w('x')]],
        ['early', [w('y'), w('z')]],
      ]),
      [late, early],
    );
    expect(rows.map((r) => [r.courseUnitId, r.courseName, r.warning.id])).toEqual([
      ['early', 'CT1', 'y'],
      ['early', 'CT1', 'z'],
      ['late', 'B', 'x'],
    ]);
  });

  test('uses the earliest planned period even when plannedPeriods is out of order', () => {
    const shuffled = makeCourse({
      courseUnitId: 'shuffled',
      courseName: 'Z',
      plannedPeriods: [
        makePeriod({ locator: 'p3', startDate: '2027-03-01' }),
        makePeriod({ locator: 'p1', startDate: '2026-09-01' }),
      ],
    });
    const middle = makeCourse({
      courseUnitId: 'middle',
      courseName: 'A',
      plannedPeriods: [makePeriod({ locator: 'p2', startDate: '2027-01-01' })],
    });
    const w = { id: 'w', message: 'w', type: 'period' as const };
    const rows = listIssues(
      new Map([
        ['middle', [w]],
        ['shuffled', [w]],
      ]),
      [middle, shuffled],
    );
    expect(rows.map((r) => r.courseUnitId)).toEqual(['shuffled', 'middle']);
  });

  test('sorts a course with no planned period last', () => {
    const unplanned = makeCourse({ courseUnitId: 'unplanned', courseName: 'A' });
    const planned = makeCourse({
      courseUnitId: 'planned',
      courseName: 'B',
      plannedPeriods: [makePeriod({ locator: 'p1' })],
    });
    const w = { id: 'w', message: 'w', type: 'period' as const };
    const rows = listIssues(
      new Map([
        ['unplanned', [w]],
        ['planned', [w]],
      ]),
      [unplanned, planned],
    );
    expect(rows.map((r) => r.courseUnitId)).toEqual(['planned', 'unplanned']);
  });
});
