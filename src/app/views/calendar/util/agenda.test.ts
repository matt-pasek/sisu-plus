/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiWallTimeToInstant } from '@/app/schedule';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { agendaFor, countdownTo } from './agenda';

const at = (dateKey: string, hour: number): Date => helsinkiWallTimeToInstant(dateKey, hour * 60);

describe('agendaFor', () => {
  const attended = [
    buildSession('morning', '2026-10-27', 8, 10),
    buildSession('noon', '2026-10-27', 12, 14),
    buildSession('gone', '2026-10-27', 15, 16, { cancelled: true }),
    buildSession('thursday', '2026-10-29', 10, 12),
  ];
  const skipped = [buildSession('skip', '2026-10-27', 16, 18)];

  test('next is the first running or upcoming class, the day list holds attended and skipped', () => {
    const agenda = agendaFor(attended, skipped, '2026-10-27', at('2026-10-27', 13));
    expect(agenda.next?.id).toBe('noon');
    expect(agenda.day.map((session) => session.id)).toEqual(['morning', 'noon', 'gone', 'skip']);
    expect(agenda.following?.id).toBe('thursday');
  });

  test('cancelled classes are never next', () => {
    expect(agendaFor(attended, [], '2026-10-27', at('2026-10-27', 14.5)).next?.id).toBe('thursday');
  });

  test('another viewed day keeps next about now', () => {
    const agenda = agendaFor(attended, [], '2026-10-29', at('2026-10-27', 9));
    expect(agenda.next?.id).toBe('morning');
    expect(agenda.day.map((session) => session.id)).toEqual(['thursday']);
    expect(agenda.following).toBeNull();
  });
});

describe('countdownTo', () => {
  const session = buildSession('a', '2026-10-27', 14, 16);

  test('reads now while the class runs', () => {
    expect(countdownTo(session, at('2026-10-27', 15))).toEqual({ kind: 'now', until: session.end });
  });

  test('counts minutes within a day, later beyond', () => {
    expect(countdownTo(session, at('2026-10-27', 13.25))).toEqual({ kind: 'soon', minutes: 45 });
    expect(countdownTo(session, at('2026-10-25', 9))).toEqual({ kind: 'later' });
  });
});
