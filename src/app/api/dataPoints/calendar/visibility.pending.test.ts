/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { pendingGroupIds } from './visibility';

describe('pendingGroupIds', () => {
  test('collects the groups of every visibility write still in flight', () => {
    const pending = pendingGroupIds([
      { courseKey: 'c1', enrolmentId: 'e1', groups: [{ groupId: 't1', visible: true }] },
      undefined,
      {
        courseKey: 'c2',
        enrolmentId: 'e2',
        groups: [
          { groupId: 'l1', visible: false },
          { groupId: 'l2', visible: false },
        ],
      },
    ]);
    expect([...pending].sort()).toEqual(['l1', 'l2', 't1']);
  });

  test('a course-level change has no group ids', () => {
    expect(pendingGroupIds([{ courseKey: 'c1', enrolmentId: 'e1', groups: [], courseVisible: false }]).size).toBe(0);
  });
});
