/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiWallTimeToInstant } from '@/app/schedule';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import type { ReminderLabels } from '../types';
import { reminderSyncKey, toReminderSnapshot } from './reminders';

const at = (dateKey: string, hour: number): Date => helsinkiWallTimeToInstant(dateKey, Math.round(hour * 60));
const AUTUMN = { startKey: '2026-08-01', endKey: '2027-01-01' };
const SPRING = { startKey: '2027-01-01', endKey: '2027-08-01' };
const labels: ReminderLabels = {
  kind: (kind) => `kind:${kind}`,
  room: { noRoom: 'No room', unavailable: 'Room unavailable' },
  date: (dateKey) => `day ${dateKey}`,
};
const ROOMS = { r1: { id: 'r1', name: 'M19_AUD1B Auditorio 1', building: 'LUT' } };

describe('toReminderSnapshot', () => {
  const now = at('2026-10-13', 9);
  const attended = [
    buildSession('later', '2026-10-19', 14, 16),
    buildSession('past', '2026-10-13', 8, 9),
    buildSession('soon', '2026-10-13', 10, 12, { locationIds: ['r1'] }),
    buildSession('cancelled', '2026-10-14', 10, 12, { cancelled: true }),
    buildSession('exam', '2026-10-15', 9, 12, { kind: 'exam' }),
    buildSession('beyond', '2026-10-20', 10, 12),
  ];

  test('keeps upcoming, non-cancelled classes from today through the next six days, sorted', () => {
    const snapshot = toReminderSnapshot(attended, ROOMS, AUTUMN, now, labels);
    expect(snapshot?.sessions.map((session) => session.id)).toEqual(['soon', 'exam', 'later']);
    expect(snapshot?.horizonKey).toBe('2026-10-19');
    expect(snapshot?.horizonLabel).toBe('day 2026-10-19');
    expect(snapshot?.hasMoreAfter).toBe(true);
    expect(snapshot?.syncedAt).toBe(now.getTime());
  });

  test('stores instants, labels, the short room and whether it is an exam', () => {
    const [soon, exam] = toReminderSnapshot(attended, ROOMS, AUTUMN, now, labels)?.sessions ?? [];
    expect(soon).toEqual({
      id: 'soon',
      startsAt: at('2026-10-13', 10).toISOString(),
      endsAt: at('2026-10-13', 12).toISOString(),
      courseName: 'Course soon',
      kindLabel: 'kind:lecture',
      room: 'AUD1B',
      isExam: false,
    });
    expect(exam?.isExam).toBe(true);
    expect(exam?.room).toBe('No room');
  });

  test('a linked session keeps its own location text', () => {
    const linked = buildSession('ics', '2026-10-13', 12, 13, { source: 'linked', locationText: 'Room 6218' });
    expect(toReminderSnapshot([linked], {}, AUTUMN, now, labels)?.sessions[0]?.room).toBe('Room 6218');
  });

  test('stops at the end of the loaded term and reports nothing later', () => {
    const december = toReminderSnapshot(
      [buildSession('xmas', '2026-12-30', 10, 12)],
      {},
      AUTUMN,
      at('2026-12-28', 9),
      labels,
    );
    expect(december?.horizonKey).toBe('2026-12-31');
    expect(december?.hasMoreAfter).toBe(false);
  });

  test('returns nothing when today is outside the loaded range', () => {
    expect(toReminderSnapshot(attended, ROOMS, SPRING, now, labels)).toBeNull();
  });

  test('keeps Helsinki wall time across the 25 Oct DST change', () => {
    const sunday = toReminderSnapshot(
      [buildSession('dst', '2026-10-25', 12, 14)],
      {},
      AUTUMN,
      at('2026-10-24', 9),
      labels,
    );
    expect(sunday?.sessions[0]?.startsAt).toBe('2026-10-25T10:00:00.000Z');
  });
});

describe('reminderSyncKey', () => {
  test('ignores when the snapshot was made', () => {
    const sessions = [buildSession('a', '2026-10-14', 10, 12)];
    const first = toReminderSnapshot(sessions, {}, AUTUMN, at('2026-10-13', 9), labels);
    const second = toReminderSnapshot(sessions, {}, AUTUMN, at('2026-10-13', 9.5), labels);
    expect(first && second && reminderSyncKey(first) === reminderSyncKey(second)).toBe(true);
  });

  test('midnight moves the window, so the key changes', () => {
    const sessions = [buildSession('a', '2026-10-14', 10, 12)];
    const before = toReminderSnapshot(sessions, {}, AUTUMN, at('2026-10-13', 23.98), labels);
    const after = toReminderSnapshot(sessions, {}, AUTUMN, at('2026-10-14', 0.02), labels);
    expect(before?.horizonKey).toBe('2026-10-19');
    expect(after?.horizonKey).toBe('2026-10-20');
    expect(before && after && reminderSyncKey(before) !== reminderSyncKey(after)).toBe(true);
  });
});
