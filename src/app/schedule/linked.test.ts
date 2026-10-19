/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import type { IcsEvent, IcsEventBase } from 'ts-ics';

import { expandSeries } from './expand';
import { toLinkedSeries } from './linked';
import { helsinkiMinutesOfDay } from './time';

const RANGE = { startKey: '2026-08-01', endKey: '2027-01-01' };
const SUMMARY = 'K200DK03 K200DK03-3003 Finnish 5 - Finnish for Work, KKIE26LABH, KKIE26LUTH, Verkkoluento';

const event = (uid: string, start: string, end: string, extra: Partial<IcsEventBase> = {}): IcsEvent => ({
  uid,
  summary: SUMMARY,
  stamp: { date: new Date('2026-10-11T19:08:55Z') },
  start: { date: new Date(start), type: 'DATE-TIME' },
  end: { date: new Date(end), type: 'DATE-TIME' },
  ...extra,
});

const expandAll = (events: IcsEvent[], code: string | null = 'K200DK03') =>
  toLinkedSeries(events, code).items.flatMap((item) => expandSeries(item.series, RANGE));

describe('toLinkedSeries', () => {
  test('maps single UTC events to Helsinki wall time across the DST change', () => {
    const occurrences = expandAll([
      event('586512-1@timeedit.com', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z'),
      event('586513-1@timeedit.com', '2026-10-26T10:00:00Z', '2026-10-26T12:00:00Z'),
    ]);
    expect(occurrences.map((occurrence) => helsinkiMinutesOfDay(occurrence.start))).toEqual([720, 720]);
    expect(occurrences.map((occurrence) => occurrence.dateKey)).toEqual(['2026-10-05', '2026-10-26']);
  });

  test('keeps the summary and a trimmed location', () => {
    const [item] = toLinkedSeries(
      [event('a', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z', { location: '  ' })],
      null,
    ).items;
    expect(item.summary).toBe(SUMMARY);
    expect(item.location).toBeNull();
  });

  test('keeps only events that mention the course code when the feed mixes courses', () => {
    const result = toLinkedSeries(
      [
        event('a', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z'),
        event('b', '2026-10-08T09:00:00Z', '2026-10-08T11:00:00Z'),
        event('c', '2026-10-06T09:00:00Z', '2026-10-06T11:00:00Z', { summary: 'CT60A0250 Other course' }),
      ],
      'k200dk03',
    );
    expect(result.items).toHaveLength(2);
    expect([result.matched, result.total]).toEqual([2, 3]);
  });

  test('keeps everything when no event mentions the code', () => {
    const result = toLinkedSeries([event('a', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z')], 'XYZ123');
    expect(result.items).toHaveLength(1);
    expect(result.matched).toBe(0);
  });

  test('skips all-day events and counts them', () => {
    const allDay = {
      ...event('d', '2026-10-05T00:00:00Z', '2026-10-06T00:00:00Z'),
      start: { date: new Date('2026-10-05T00:00:00Z'), type: 'DATE' as const },
    };
    const result = toLinkedSeries([allDay], null);
    expect(result.items).toEqual([]);
    expect(result.skippedAllDay).toBe(1);
  });

  test('maps a weekly rule with UNTIL and EXDATE', () => {
    const weekly = event('w', '2026-10-06T09:00:00Z', '2026-10-06T11:00:00Z', {
      recurrenceRule: { frequency: 'WEEKLY', until: { date: new Date('2026-10-20T21:00:00Z') } },
      exceptionDates: [{ date: new Date('2026-10-13T09:00:00Z') }],
    });
    expect(expandAll([weekly], null).map((occurrence) => occurrence.dateKey)).toEqual(['2026-10-06', '2026-10-20']);
  });

  test('maps an every-other-week rule', () => {
    const biweekly = event('b', '2026-10-06T09:00:00Z', '2026-10-06T11:00:00Z', {
      recurrenceRule: { frequency: 'WEEKLY', interval: 2, until: { date: new Date('2026-11-04T00:00:00Z') } },
    });
    expect(toLinkedSeries([biweekly], null).items[0].series.recursEvery).toBe('EVERY_SECOND_WEEK');
  });

  test('keeps the first occurrence of an unsupported rule and counts it', () => {
    const monthly = event('m', '2026-10-06T09:00:00Z', '2026-10-06T11:00:00Z', {
      recurrenceRule: { frequency: 'MONTHLY', count: 3 },
    });
    const result = toLinkedSeries([monthly], null);
    expect(result.firstOnly).toBe(1);
    expect(expandAll([monthly], null)).toHaveLength(1);
  });

  test('marks a cancelled single event as cancelled', () => {
    const [occurrence] = expandAll([
      event('x', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z', { status: 'CANCELLED' }),
    ]);
    expect(occurrence.cancelled).toBe(true);
  });

  test('builds stable, safe series ids', () => {
    const [item] = toLinkedSeries(
      [event('586512-1372700886-0@timeedit.com', '2026-10-05T09:00:00Z', '2026-10-05T11:00:00Z')],
      null,
    ).items;
    expect(item.series.id).toBe(`linked-586512-1372700886-0_timeedit_com-${Date.parse('2026-10-05T09:00:00Z')}`);
  });
});
