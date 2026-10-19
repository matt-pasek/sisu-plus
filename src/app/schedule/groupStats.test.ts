/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { statsForCandidate } from './groupStats';

const COURSE = 'cur-hdd';
const SIBLINGS = new Set(['t1', 't2']);

const t1Mon = buildSession('t1-mon', '2026-10-05', 14, 16, { courseKey: COURSE, groupId: 't1', groupIds: ['t1'] });
const t1Thu = buildSession('t1-thu', '2026-10-08', 14, 16, { courseKey: COURSE, groupId: 't1', groupIds: ['t1'] });
const t1Gone = buildSession('t1-tue', '2026-10-06', 14, 16, {
  courseKey: COURSE,
  groupId: 't1',
  groupIds: ['t1'],
  cancelled: true,
});
const t2Mon = buildSession('t2-mon', '2026-10-05', 15, 17, { courseKey: COURSE, groupId: 't2', groupIds: ['t2'] });
const labThu = buildSession('lab-thu', '2026-10-08', 14, 15, { courseKey: 'cur-net' });

describe('statsForCandidate', () => {
  test('counts clashes with other courses and ignores the sibling group being replaced', () => {
    const stats = statsForCandidate([t1Mon, t1Thu, t1Gone], [t2Mon, labThu], SIBLINGS);
    expect(stats.total).toBe(2);
    expect(stats.clashing).toBe(1);
    expect(stats.perSession).toEqual([
      { sessionId: 't1-mon', clashes: false },
      { sessionId: 't1-thu', clashes: true },
    ]);
    expect(stats.clashWith).toEqual([{ courseName: 'Course lab-thu', kind: 'lecture' }]);
  });

  test("names the kind, so a tutorial clashing with its own course's exam is clear", () => {
    const exam = buildSession('exam', '2026-10-05', 15, 18, {
      courseKey: 'cur-hdd-exam',
      courseName: 'Course t1-mon',
      kind: 'exam',
    });
    expect(statsForCandidate([t1Mon], [exam], SIBLINGS).clashWith).toEqual([
      { courseName: 'Course t1-mon', kind: 'exam' },
    ]);
  });

  test('a shared session still counts when a group outside the set owns it', () => {
    const lecture = buildSession('lec-mon', '2026-10-05', 15, 16, { courseKey: COURSE, groupIds: ['lec', 't1'] });
    expect(statsForCandidate([t1Mon], [lecture], SIBLINGS).clashing).toBe(1);
  });

  test('the candidate sessions themselves are never clashes', () => {
    expect(statsForCandidate([t1Mon], [t1Mon], new Set()).clashing).toBe(0);
  });
});
