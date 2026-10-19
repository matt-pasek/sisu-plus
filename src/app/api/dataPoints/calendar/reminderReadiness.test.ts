/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { remindersReady } from './reminderReadiness';
import type { LinkedTimetableState, ReminderReadiness } from './types';

const linked = (status: LinkedTimetableState['status']): LinkedTimetableState => ({
  url: 'https://cloud.timeedit.net/x.ics',
  label: 'TimeEdit',
  status,
  reason: null,
  fetchedAt: null,
  count: 0,
});

const settled: ReminderReadiness = {
  plansLoaded: true,
  rowsSettled: true,
  courseUnitsSettled: true,
  roomsSettled: true,
  candidatesSettled: true,
  extraCoursesSettled: true,
  linksLoaded: true,
  linkedStates: [linked('ok'), linked('stale')],
};

describe('remindersReady', () => {
  test('ready once everything has settled', () => {
    expect(remindersReady(settled)).toBe(true);
  });

  test('a timetable request that never succeeded (paused offline, or user details failed) is not ready', () => {
    expect(remindersReady({ ...settled, rowsSettled: false })).toBe(false);
  });

  test('waits for the attendance plan', () => {
    expect(remindersReady({ ...settled, plansLoaded: false })).toBe(false);
  });

  test('waits for course names, rooms, swap candidates and extra courses', () => {
    expect(remindersReady({ ...settled, courseUnitsSettled: false })).toBe(false);
    expect(remindersReady({ ...settled, roomsSettled: false })).toBe(false);
    expect(remindersReady({ ...settled, candidatesSettled: false })).toBe(false);
    expect(remindersReady({ ...settled, extraCoursesSettled: false })).toBe(false);
  });

  test('waits for linked timetables still loading, but not for ones that failed', () => {
    expect(remindersReady({ ...settled, linksLoaded: false })).toBe(false);
    expect(remindersReady({ ...settled, linkedStates: [linked('loading')] })).toBe(false);
    expect(remindersReady({ ...settled, linkedStates: [linked('error')] })).toBe(true);
  });
});
