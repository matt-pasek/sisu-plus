/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { CHINESE_SHARED_ROW, FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { mapCalendarRows } from './mapCalendarRows';
import { coursesWithoutTimes, parseCachedTimetable, parseLinks, withLink, withoutLink } from './timetableLinks';
import type { CalendarCourse } from './types';

const LINK = { url: 'https://cloud.timeedit.net/a.ics', codeFilter: 'K200DK03' };

describe('timetable links', () => {
  test('parses valid links and drops broken ones', () => {
    expect(parseLinks({ a: LINK, b: { url: 3 }, c: { url: 'https://x.test/a.ics' } })).toEqual({
      a: LINK,
      c: { url: 'https://x.test/a.ics', codeFilter: null },
    });
    expect(parseLinks('nope')).toEqual({});
  });

  test('adds and removes links without mutating', () => {
    const links = withLink({}, 'cur-1', LINK);
    expect(withoutLink(links, 'cur-1')).toEqual({});
    expect(links).toEqual({ 'cur-1': LINK });
  });

  test('parses the cached response', () => {
    expect(parseCachedTimetable({ url: 'u', text: 't', fetchedAt: 5 })).toEqual({ url: 'u', text: 't', fetchedAt: 5 });
    expect(parseCachedTimetable({ url: 'u' })).toBeNull();
  });

  test('finds courses whose groups list no study events and that have no Sisu sessions', () => {
    const label = (value: { en?: string; fi?: string } | null | undefined) => value?.en ?? value?.fi ?? null;
    const [chinese] = mapCalendarRows([CHINESE_SHARED_ROW], FIXTURE_RANGE, label).courses;
    const lab: CalendarCourse = {
      ...chinese,
      realisationId: 'lab-cur-42901',
      groupSets: [
        {
          id: 'opetus',
          name: 'Opetus',
          min: 0,
          max: 0,
          groups: [{ ...chinese.groupSets[0].groups[0], eventIds: [] }],
        },
      ],
    };
    const ungrouped: CalendarCourse = { ...chinese, realisationId: 'cur-cni', groupSets: [] };
    const sessions = [buildSession('cni', '2026-10-05', 10, 12, { courseKey: 'cur-cni' })];
    expect([...coursesWithoutTimes([chinese, lab, ungrouped], sessions)]).toEqual(['lab-cur-42901']);
  });
});
