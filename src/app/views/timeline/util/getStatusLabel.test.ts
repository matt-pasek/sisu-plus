/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { getStatusTone } from './getStatusLabel';
import { makeCourse } from './__fixtures__/timeline';

describe('getStatusTone', () => {
  test('passed is ok, enrolled is info, otherwise neutral', () => {
    expect(getStatusTone(makeCourse({ courseUnitId: 'a', isPassed: true, grade: 4 }))).toBe('ok');
    expect(getStatusTone(makeCourse({ courseUnitId: 'b', isEnrolled: true }))).toBe('info');
    expect(getStatusTone(makeCourse({ courseUnitId: 'c' }))).toBe('neutral');
  });
});
