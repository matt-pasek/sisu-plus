/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { findClashes, groupClashesBySession, summarizeSeriesClashes } from './clashes';

const DAY = '2026-10-27';

describe('findClashes', () => {
  test('reports a full clash for identical slots', () => {
    const [clash] = findClashes([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 14, 16)]);
    expect(clash.kind).toBe('full');
    expect(clash.minutes).toBe(120);
    expect(clash.sessionIds.sort()).toEqual(['a', 'b']);
  });

  test('reports a partial clash with the overlap length', () => {
    const [clash] = findClashes([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 15, 17)]);
    expect(clash.kind).toBe('partial');
    expect(clash.minutes).toBe(60);
  });

  test('a session covering a shorter one is a full clash', () => {
    const [clash] = findClashes([buildSession('a', DAY, 13, 17), buildSession('b', DAY, 14, 15)]);
    expect(clash.kind).toBe('full');
  });

  test('touching sessions do not clash', () => {
    expect(findClashes([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 16, 18)])).toEqual([]);
  });

  test('cancelled sessions are ignored', () => {
    expect(findClashes([buildSession('a', DAY, 14, 16), buildSession('b', DAY, 14, 16, { cancelled: true })])).toEqual(
      [],
    );
  });

  test('exam clashes sort first', () => {
    const clashes = findClashes([
      buildSession('a', DAY, 10, 12),
      buildSession('b', DAY, 10, 12),
      buildSession('c', DAY, 16, 18),
      buildSession('d', DAY, 16, 18, { kind: 'exam' }),
    ]);
    expect(clashes[0].involvesExam).toBe(true);
    expect(clashes[1].involvesExam).toBe(false);
  });
});

describe('summarizeSeriesClashes', () => {
  test('counts clashing sessions of a series and names the other series once', () => {
    const lecture = (id: string, day: string) => buildSession(id, day, 14, 16, { seriesId: 'cni', courseName: 'CN&I' });
    const chinese = (id: string, day: string) =>
      buildSession(id, day, 14, 16, { seriesId: 'chn', courseName: 'Basic Chinese 1' });
    const sessions = [
      lecture('l1', '2026-10-27'),
      lecture('l2', '2026-11-03'),
      lecture('l3', '2026-11-10'),
      chinese('c1', '2026-10-27'),
      chinese('c2', '2026-11-03'),
    ];
    const summary = summarizeSeriesClashes('cni', sessions, groupClashesBySession(findClashes(sessions)));
    expect(summary.total).toBe(3);
    expect(summary.clashing).toBe(2);
    expect(summary.perSession.map((entry) => entry.clashes)).toEqual([true, true, false]);
    expect(summary.otherSessions.map((other) => other.courseName)).toEqual(['Basic Chinese 1']);
  });
});
