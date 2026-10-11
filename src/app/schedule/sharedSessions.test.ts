/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { sharedRelations, stillShownThrough } from './sharedSessions';
import type { GroupEvents } from './types';

const group = (id: string, eventIds: string[], visible = true): GroupEvents => ({ id, eventIds, visible });

describe('sharedRelations', () => {
  test('groups with the same events are identical', () => {
    const relations = sharedRelations([group('lec', ['e1', 'e2']), group('t1', ['e2', 'e1']), group('t2', ['e3'])]);
    expect(relations.get('lec')).toEqual([{ groupId: 't1', kind: 'identical', count: 2 }]);
    expect(relations.get('t1')).toEqual([{ groupId: 'lec', kind: 'identical', count: 2 }]);
    expect(relations.get('t2')).toEqual([]);
  });

  test('overlapping event lists are partial with the shared count', () => {
    const relations = sharedRelations([group('a', ['e1', 'e2', 'e2']), group('b', ['e2', 'e3'])]);
    expect(relations.get('a')).toEqual([{ groupId: 'b', kind: 'partial', count: 1 }]);
  });

  test('a group without events shares nothing', () => {
    const relations = sharedRelations([group('ssg', []), group('lec', ['e1'])]);
    expect(relations.get('ssg')).toEqual([]);
    expect(relations.get('lec')).toEqual([]);
  });
});

describe('stillShownThrough', () => {
  const groups = [group('lec', ['e1'], true), group('t1', ['e1'], false), group('t2', ['e9'], true)];

  test('lists visible groups that still show the hidden group events', () => {
    expect(stillShownThrough('t1', groups)).toEqual(['lec']);
  });

  test('is empty when the sharing group is hidden too', () => {
    expect(stillShownThrough('t1', [group('lec', ['e1'], false), group('t1', ['e1'], false)])).toEqual([]);
  });
});
