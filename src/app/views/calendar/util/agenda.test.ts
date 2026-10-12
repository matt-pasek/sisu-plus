/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiWallTimeToInstant } from '@/app/schedule';
import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { agendaFor, countdownTo, mergeDay } from './agenda';

const at = (dateKey: string, hour: number): Date => helsinkiWallTimeToInstant(dateKey, hour * 60);
const AUTUMN = { startKey: '2026-08-01', endKey: '2027-01-01' };

describe('agendaFor', () => {
  const attended = [
    buildSession('morning', '2026-10-27', 8, 10),
    buildSession('noon', '2026-10-27', 12, 14),
    buildSession('gone', '2026-10-27', 15, 16, { cancelled: true }),
    buildSession('thursday', '2026-10-29', 10, 12),
  ];
  const skipped = [buildSession('skip', '2026-10-27', 16, 18)];

  test('next is the first running or upcoming class, the day list holds attended and skipped', () => {
    const agenda = agendaFor(attended, skipped, '2026-10-27', at('2026-10-27', 13), AUTUMN);
    expect(agenda.next?.id).toBe('noon');
    expect(agenda.day.map((session) => session.id)).toEqual(['morning', 'noon', 'gone', 'skip']);
    expect(agenda.following?.id).toBe('thursday');
  });

  test('cancelled classes are never next', () => {
    expect(agendaFor(attended, [], '2026-10-27', at('2026-10-27', 14.5), AUTUMN).next?.id).toBe('thursday');
  });

  test('next is unknown when today is outside the loaded term', () => {
    const agenda = agendaFor(attended, [], '2026-10-27', at('2027-02-01', 9), AUTUMN);
    expect(agenda.next).toBeNull();
    expect(agenda.nextKnown).toBe(false);
    expect(agenda.day.map((session) => session.id)).toEqual(['morning', 'noon', 'gone']);
  });

  test('another viewed day keeps next about now', () => {
    const agenda = agendaFor(attended, [], '2026-10-29', at('2026-10-27', 9), AUTUMN);
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

describe('mergeDay', () => {
  test('interleaves classes and notes by start time', () => {
    const entries = mergeDay(
      [buildSession('morning', '2026-10-27', 8, 10), buildSession('noon', '2026-10-27', 12, 14)],
      [buildNote('coffee', '2026-10-27', 10, 10.5)],
    );
    expect(entries.map((entry) => (entry.type === 'session' ? entry.session.id : entry.note.noteId))).toEqual([
      'morning',
      'coffee',
      'noon',
    ]);
  });

  test('notes never become the next class', () => {
    const notes = [buildNote('early', '2026-10-27', 7, 8)];
    const agenda = agendaFor(
      [buildSession('noon', '2026-10-27', 12, 14)],
      [],
      '2026-10-27',
      at('2026-10-27', 6),
      AUTUMN,
    );
    expect(agenda.next?.id).toBe('noon');
    expect(mergeDay(agenda.day, notes)[0]).toMatchObject({ type: 'note' });
  });
});
