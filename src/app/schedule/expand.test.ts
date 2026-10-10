/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { expandSeries } from './expand';
import type { RecurringSeries } from './types';

const AUTUMN = { startKey: '2026-08-01', endKey: '2027-01-01' };

const weeklyTuesday = (overrides: Partial<RecurringSeries> = {}): RecurringSeries => ({
  id: 'se-1',
  startTime: '2026-10-20T11:00:00.000Z',
  duration: 'PT2H',
  recursEvery: 'WEEKLY',
  recursUntil: '2026-11-03',
  locationIds: ['loc-aud'],
  ...overrides,
});

describe('expandSeries: generated', () => {
  test('keeps the Helsinki wall time across the October DST change', () => {
    const starts = expandSeries(weeklyTuesday(), AUTUMN).map((o) => o.start.toISOString());
    expect(starts).toEqual(['2026-10-20T11:00:00.000Z', '2026-10-27T12:00:00.000Z', '2026-11-03T12:00:00.000Z']);
  });

  test('sets end from the duration and date keys in Helsinki time', () => {
    const [first] = expandSeries(weeklyTuesday(), AUTUMN);
    expect(first.end.toISOString()).toBe('2026-10-20T13:00:00.000Z');
    expect(first.dateKey).toBe('2026-10-20');
    expect(first.locationIds).toEqual(['loc-aud']);
  });

  test('skips exceptions and keeps numbering continuous', () => {
    const occurrences = expandSeries(weeklyTuesday({ exceptions: ['2026-10-27'] }), AUTUMN);
    expect(occurrences.map((o) => [o.dateKey, o.index])).toEqual([
      ['2026-10-20', 0],
      ['2026-11-03', 1],
    ]);
  });

  test('flags cancellations without removing them', () => {
    const occurrences = expandSeries(weeklyTuesday({ cancellations: ['2026-11-03'] }), AUTUMN);
    expect(occurrences.map((o) => o.cancelled)).toEqual([false, false, true]);
  });

  test('clips to the range but keeps series-wide numbering', () => {
    const occurrences = expandSeries(weeklyTuesday(), { startKey: '2026-10-26', endKey: '2026-12-01' });
    expect(occurrences.map((o) => o.index)).toEqual([1, 2]);
  });

  test('NEVER yields a single occurrence', () => {
    expect(expandSeries(weeklyTuesday({ recursEvery: 'NEVER', recursUntil: undefined }), AUTUMN)).toHaveLength(1);
  });

  test('MONTHLY clamps to month ends without drifting', () => {
    const series = weeklyTuesday({
      startTime: '2027-01-31T08:00:00.000Z',
      recursEvery: 'MONTHLY',
      recursUntil: '2027-03-31',
    });
    const occurrences = expandSeries(series, { startKey: '2027-01-01', endKey: '2027-08-01' });
    expect(occurrences.map((o) => o.dateKey)).toEqual(['2027-01-31', '2027-02-28', '2027-03-31']);
    expect(occurrences[2].start.toISOString()).toBe('2027-03-31T07:00:00.000Z');
  });

  test('without recursUntil stops at the range end', () => {
    const series = weeklyTuesday({ startTime: '2026-11-24T08:00:00.000Z', recursUntil: undefined });
    const occurrences = expandSeries(series, { startKey: '2026-11-01', endKey: '2026-12-09' });
    expect(occurrences.map((o) => o.dateKey)).toEqual(['2026-11-24', '2026-12-01', '2026-12-08']);
  });
});

describe('expandSeries: populated by the API', () => {
  const populated = weeklyTuesday({
    occurrences: [
      { start: '2026-10-19T13:00:00.000Z', end: '2026-10-19T15:00:00.000Z' },
      { start: '2026-10-26T14:00:00.000Z', excluded: true },
      { start: '2026-11-02T14:00:00.000Z', cancelled: true, irregularLocationIds: ['loc-2310'], notice: 'Moved' },
      { end: '2026-11-09T16:00:00.000Z' },
    ],
  });

  test('drops excluded occurrences and ones without a start', () => {
    expect(expandSeries(populated, AUTUMN).map((o) => o.dateKey)).toEqual(['2026-10-19', '2026-11-02']);
  });

  test('uses irregular locations, notices and the series duration', () => {
    const second = expandSeries(populated, AUTUMN)[1];
    expect(second.index).toBe(1);
    expect(second.cancelled).toBe(true);
    expect(second.locationIds).toEqual(['loc-2310']);
    expect(second.notice).toBe('Moved');
    expect(second.end.toISOString()).toBe('2026-11-02T16:00:00.000Z');
  });
});
