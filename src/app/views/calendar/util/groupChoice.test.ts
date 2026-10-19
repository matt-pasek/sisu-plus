/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CalendarCourse, CalendarGroup, CalendarGroupSet } from '@/app/api/dataPoints/calendar/types';
import { alternativeGroups, shortGroupName } from './groupChoice';
import { promptSets } from './groups';

const group = (id: string, name: string | null, isInCalendar = true): CalendarGroup => ({
  id,
  name,
  setId: 'set-lahti',
  eventIds: [`${id}-event`],
  isInCalendar,
  hasEntry: true,
  cancelled: false,
});

const groupSet = (groups: CalendarGroup[]): CalendarGroupSet => ({
  id: 'set-lahti',
  name: 'LAHTI-Teaching',
  min: 0,
  max: 0,
  groups,
});

const LECTURES = group('lec', 'CT60A5540 1 LAHTI Lectures for everyone');
const TUTORIALS = group('tut', 'CT60A5540 1 LAHTI Tutorials for everyone');

describe('alternativeGroups', () => {
  test('two tutorial groups are alternatives', () => {
    const set = groupSet([group('t1', 'Tutorial 1'), group('t2', 'Tutorial 2')]);
    expect(alternativeGroups(set).map((item) => item.id)).toEqual(['t1', 't2']);
  });

  test('lectures and tutorials complement each other, so there is no choice', () => {
    expect(alternativeGroups(groupSet([LECTURES, TUTORIALS]))).toEqual([]);
  });

  test('picks the kind with the most groups switched on', () => {
    const set = groupSet([
      group('l1', 'Lecture group A'),
      group('l2', 'Lecture group B', false),
      group('t1', 'Tutorial 1'),
      group('t2', 'Tutorial 2'),
    ]);
    expect(alternativeGroups(set).map((item) => item.id)).toEqual(['t1', 't2']);
  });

  test('skips cancelled groups and groups without sessions', () => {
    const set = groupSet([group('t1', 'Tutorial 1'), { ...group('t2', 'Tutorial 2'), cancelled: true }]);
    expect(alternativeGroups(set)).toEqual([]);
  });
});

describe('promptSets with complementary groups', () => {
  test('does not ask "which one" when the switched-on groups are a lecture and a tutorial', () => {
    const course = { realisationId: 'cur-net', isInCalendar: true, groupSets: [groupSet([LECTURES, TUTORIALS])] };
    expect(promptSets(course as CalendarCourse, undefined)).toEqual([]);
  });
});

describe('shortGroupName', () => {
  test('drops the course code, the implementation number and "for everyone"', () => {
    expect(shortGroupName('CT60A5540 1 LAHTI Lectures for everyone', 'CT60A5540')).toBe('LAHTI Lectures');
  });

  test('drops the Finnish "kaikille" too', () => {
    expect(shortGroupName('K200DK03 1 Luennot kaikille', 'K200DK03')).toBe('Luennot');
  });

  test('leaves plain names alone', () => {
    expect(shortGroupName('Tutorial 1', 'HDD7010')).toBe('Tutorial 1');
  });

  test('keeps the original when stripping would leave nothing', () => {
    expect(shortGroupName('CT60A5540 1', 'CT60A5540')).toBe('CT60A5540 1');
  });

  test('passes null through', () => {
    expect(shortGroupName(null, 'CT60A5540')).toBeNull();
  });
});
