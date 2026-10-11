/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { normalizeTimetableUrl, timetableHost, timetableOrigin, timetableSourceLabel } from './timetableUrl';

const PAGE = 'https://cloud.timeedit.net/lut-saimia/web/public/ri1Y6X1QQ7wZ46QfQ5078235yYY95Z7.html';
const FEED = 'https://cloud.timeedit.net/lut-saimia/web/public/ri1Y6X1QQ7wZ46QfQ5078235yYY95Z7.ics';

describe('normalizeTimetableUrl', () => {
  test('rewrites a TimeEdit page link to its calendar feed', () => {
    expect(normalizeTimetableUrl(`  ${PAGE} `)).toBe(FEED);
  });

  test('turns webcal into https and keeps other https links', () => {
    expect(normalizeTimetableUrl('webcal://example.com/cal.ics')).toBe('https://example.com/cal.ics');
    expect(normalizeTimetableUrl('https://example.com/cal.ics?x=1')).toBe('https://example.com/cal.ics?x=1');
  });

  test('rejects http, credentials and garbage', () => {
    expect(normalizeTimetableUrl('http://example.com/cal.ics')).toBeNull();
    expect(normalizeTimetableUrl('https://user:pw@example.com/cal.ics')).toBeNull();
    expect(normalizeTimetableUrl('not a link')).toBeNull();
    expect(normalizeTimetableUrl('https://intra.example.com/schedule.html')).toBe(
      'https://intra.example.com/schedule.html',
    );
  });
});

describe('labels', () => {
  test('names TimeEdit and falls back to the host', () => {
    expect(timetableSourceLabel(FEED)).toBe('TimeEdit');
    expect(timetableSourceLabel('https://www.example.com/a.ics')).toBe('example.com');
    expect(timetableHost(FEED)).toBe('cloud.timeedit.net');
    expect(timetableOrigin(FEED)).toBe('https://cloud.timeedit.net');
  });
});
