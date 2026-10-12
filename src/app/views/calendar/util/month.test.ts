/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildDeadline } from '@/app/api/dataPoints/calendar/__fixtures__/buildDeadline';
import { findClashes, type Session } from '@/app/schedule';
import { buildNote } from '@/app/schedule/__fixtures__/buildNote';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import type { MonthInput } from '../types';
import { monthWeeks, roomChangeIds } from './month';

const input = (overrides: Partial<MonthInput> = {}): MonthInput => ({
  monthKey: '2026-10-01',
  todayKey: '2026-10-27',
  attended: [],
  clashes: [],
  periods: [],
  holidays: [],
  noTeachingWeeks: new Set(),
  roomChangeIds: new Set(),
  showCancelled: false,
  notes: [],
  deadlines: [],
  ...overrides,
});

const cellOf = (weeks: ReturnType<typeof monthWeeks>, dateKey: string) =>
  weeks.flatMap((week) => week.cells).find((cell) => cell.dateKey === dateKey);

describe('monthWeeks', () => {
  test('lays out October 2026 from Monday 28.9 in five weeks', () => {
    const weeks = monthWeeks(input());
    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toMatchObject({ weekKey: '2026-09-28', weekNumber: 40, isCurrent: false });
    expect(weeks[4].isCurrent).toBe(true);
    expect(cellOf(weeks, '2026-10-27')?.isToday).toBe(true);
    expect(cellOf(weeks, '2026-10-31')?.isWeekend).toBe(true);
  });

  test('out-of-month days stay empty even when sessions exist there', () => {
    const weeks = monthWeeks(input({ attended: [buildSession('a', '2026-09-29', 10, 12)] }));
    expect(cellOf(weeks, '2026-09-29')).toMatchObject({ inMonth: false, minutes: 0, shape: [], exceptions: [] });
  });

  test('sums busy hours and builds the shape from sessions that run', () => {
    const attended = [
      buildSession('a', '2026-10-27', 10, 12),
      buildSession('b', '2026-10-27', 14, 16),
      buildSession('gone', '2026-10-27', 16, 18, { cancelled: true }),
    ];
    const cell = cellOf(monthWeeks(input({ attended })), '2026-10-27');
    expect(cell?.minutes).toBe(240);
    expect(cell?.shape.map((segment) => segment.sessionId)).toEqual(['a', 'b']);
    expect(cell?.exceptions).toEqual([]);
  });

  test('lists cancelled sessions only when the layer is on', () => {
    const attended = [buildSession('gone', '2026-10-27', 16, 18, { cancelled: true })];
    const cell = cellOf(monthWeeks(input({ attended, showCancelled: true })), '2026-10-27');
    expect(cell?.exceptions.map((exception) => exception.kind)).toEqual(['cancelled']);
  });

  test('hasClash comes only from unresolved clashes', () => {
    const attended = [buildSession('a', '2026-10-27', 14, 16), buildSession('b', '2026-10-27', 15, 17)];
    const resolved = cellOf(monthWeeks(input({ attended })), '2026-10-27');
    expect(resolved?.hasClash).toBe(false);
    const open = cellOf(monthWeeks(input({ attended, clashes: findClashes(attended) })), '2026-10-27');
    expect(open?.hasClash).toBe(true);
    expect(open?.shape.every((segment) => segment.clashing)).toBe(true);
    expect(open?.exceptions.map((exception) => exception.kind)).toEqual(['clash']);
  });

  test('adds exam, period start, holiday and no-teaching lines', () => {
    const exam = buildSession('exam', '2026-10-21', 9, 12, { kind: 'exam' });
    const weeks = monthWeeks(
      input({
        attended: [exam],
        periods: [{ name: 'Period 2', startDate: '2026-10-26' }],
        holidays: [{ dateKey: '2026-10-31', id: 'allSaints' }],
        noTeachingWeeks: new Set(['2026-10-19']),
      }),
    );
    const kindsOn = (dateKey: string) => cellOf(weeks, dateKey)?.exceptions.map((exception) => exception.kind);
    expect(kindsOn('2026-10-21')).toEqual(['noTeaching', 'exam']);
    expect(kindsOn('2026-10-24')).toEqual([]);
    expect(kindsOn('2026-10-26')).toEqual(['periodStart']);
    expect(kindsOn('2026-10-31')).toEqual(['holiday']);
  });
});

describe('roomChangeIds', () => {
  const slot = (id: string, dateKey: string, room: string): Session =>
    buildSession(id, dateKey, 14, 16, { groupId: 'g1', groupIds: ['g1'], courseKey: 'c', locationIds: [room] });

  test('flags the one session of a weekly slot held in another room', () => {
    const sessions = [
      slot('w1', '2026-10-05', 'aud1'),
      slot('w2', '2026-10-12', 'aud1'),
      slot('w3', '2026-10-19', 'lab9'),
      slot('w4', '2026-10-26', 'aud1'),
    ];
    expect([...roomChangeIds(sessions)]).toEqual(['w3']);
  });

  test('a lasting move to another room is not a one-off change', () => {
    const sessions = [
      slot('p1', '2026-10-05', 'aud1'),
      slot('p2', '2026-10-12', 'aud1'),
      slot('p3', '2026-10-26', 'aud2'),
      slot('p4', '2026-11-02', 'aud2'),
      slot('p5', '2026-11-09', 'aud2'),
    ];
    expect(roomChangeIds(sessions).size).toBe(0);
  });

  test('ignores a group whose different weekly slots use different rooms', () => {
    const monday = ['2026-10-05', '2026-10-12', '2026-10-19'].map((dateKey, index) =>
      slot(`m${index}`, dateKey, 'aud1'),
    );
    const tuesday = ['2026-10-06', '2026-10-13', '2026-10-20'].map((dateKey, index) =>
      slot(`t${index}`, dateKey, 'b103'),
    );
    expect(roomChangeIds([...monday, ...tuesday]).size).toBe(0);
  });
});

describe('month notes', () => {
  test('one-off notes get a line, repeating notes stay out', () => {
    const weeks = monthWeeks(
      input({
        notes: [
          buildNote('dentist', '2026-10-21', 14, 15),
          buildNote('gym', '2026-10-21', 17, 18, { recurring: true }),
        ],
      }),
    );
    const lines = cellOf(weeks, '2026-10-21')?.exceptions ?? [];
    expect(lines.filter((line) => line.kind === 'note')).toHaveLength(1);
    expect(lines.find((line) => line.kind === 'note')).toMatchObject({ note: { noteId: 'dentist' } });
  });

  test('notes never add hours or a day shape', () => {
    const cell = cellOf(monthWeeks(input({ notes: [buildNote('dentist', '2026-10-21', 14, 15)] })), '2026-10-21');
    expect(cell?.minutes).toBe(0);
    expect(cell?.shape).toEqual([]);
  });
});

describe('month deadlines', () => {
  test('each deadline gets a line on its day', () => {
    const weeks = monthWeeks(input({ deadlines: [buildDeadline('report', '2026-10-23', 23.98)] }));
    const lines = cellOf(weeks, '2026-10-23')?.exceptions ?? [];
    expect(lines.find((line) => line.kind === 'deadline')).toMatchObject({ deadline: { id: 'report' } });
  });
});
