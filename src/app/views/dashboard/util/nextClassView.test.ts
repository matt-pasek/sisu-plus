/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { nextClassView } from './nextClassView';

const model = { session: buildSession('a', '2026-10-13', 10, 12), laterToday: [] };
const loaded = { error: null, updatedAt: 1, courseCount: 2, model };

describe('nextClassView', () => {
  test('shows the class once the timetable has loaded', () => {
    expect(nextClassView(loaded)).toBe('ready');
  });

  test('an error wins over everything else, including failed user details', () => {
    expect(nextClassView({ ...loaded, error: new Error('419'), updatedAt: 0, courseCount: 0 })).toBe('failed');
  });

  test('a timetable that never loaded (still loading or paused offline) keeps loading instead of claiming no classes', () => {
    expect(nextClassView({ ...loaded, updatedAt: 0, courseCount: 0, model: null })).toBe('loading');
  });

  test('no courses, or nothing left this term', () => {
    expect(nextClassView({ ...loaded, courseCount: 0, model: null })).toBe('noCourses');
    expect(nextClassView({ ...loaded, model: null })).toBe('noneLeft');
  });
});
