/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { getStatusTone, getWarningLabel } from './getStatusLabel';
import { makeCourse } from './__fixtures__/timeline';

describe('getWarningLabel', () => {
  const prerequisite = { id: 'a', message: 'a', type: 'prerequisite' as const };
  const period = { id: 'b', message: 'b', type: 'period' as const };

  test('names a single warning by its kind and counts several', () => {
    expect(getWarningLabel([prerequisite])).toBe('Prereq');
    expect(getWarningLabel([period])).toBe('Timing');
    expect(getWarningLabel([prerequisite, period])).toBe('2 issues');
  });
});

describe('getStatusTone', () => {
  test('passed is ok, enrolled is info, otherwise neutral', () => {
    expect(getStatusTone(makeCourse({ courseUnitId: 'a', isPassed: true, grade: 4 }))).toBe('ok');
    expect(getStatusTone(makeCourse({ courseUnitId: 'b', isEnrolled: true }))).toBe('info');
    expect(getStatusTone(makeCourse({ courseUnitId: 'c' }))).toBe('neutral');
  });
});
