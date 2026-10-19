/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { isCalendarText, isGrantableOrigin, isTimetableFetchResult, validTimetableUrl } from './timetables';

describe('timetable guards', () => {
  test('recognises calendar text', () => {
    expect(isCalendarText('BEGIN:VCALENDAR\r\nVERSION:2.0')).toBe(true);
    expect(isCalendarText('\n  BEGIN:VCALENDAR')).toBe(true);
    expect(isCalendarText('<!doctype html><html>')).toBe(false);
  });

  test('accepts only plain https links', () => {
    expect(validTimetableUrl('https://cloud.timeedit.net/a.ics')?.host).toBe('cloud.timeedit.net');
    expect(validTimetableUrl('http://cloud.timeedit.net/a.ics')).toBeNull();
    expect(validTimetableUrl('https://u:p@example.com/a.ics')).toBeNull();
    expect(validTimetableUrl(42)).toBeNull();
  });

  test('grants only bare https origins', () => {
    expect(isGrantableOrigin('https://cloud.timeedit.net')).toBe(true);
    expect(isGrantableOrigin('https://cloud.timeedit.net:8443')).toBe(true);
    expect(isGrantableOrigin('https://cloud.timeedit.net/path')).toBe(false);
    expect(isGrantableOrigin('https://*.example.com')).toBe(false);
    expect(isGrantableOrigin('http://cloud.timeedit.net')).toBe(false);
  });

  test('validates fetch results coming back from the worker', () => {
    expect(isTimetableFetchResult({ ok: true, text: 'BEGIN:VCALENDAR' })).toBe(true);
    expect(isTimetableFetchResult({ ok: false, reason: 'permission' })).toBe(true);
    expect(isTimetableFetchResult({ ok: false, reason: 'oops' })).toBe(false);
    expect(isTimetableFetchResult(undefined)).toBe(false);
  });
});
