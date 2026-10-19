/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { helsinkiWallTimeToInstant, type Clash } from '@/app/schedule';
import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import { clashCourseNames, pickNextClass } from './nextClass';

const at = (dateKey: string, hour: number): Date => helsinkiWallTimeToInstant(dateKey, Math.round(hour * 60));
const TUESDAY = '2026-10-13';
const attended = [
  buildSession('morning', TUESDAY, 10, 12),
  buildSession('noon', TUESDAY, 13, 14),
  buildSession('cancelled', TUESDAY, 14, 15, { cancelled: true }),
  buildSession('afternoon', TUESDAY, 15, 16),
  buildSession('evening', TUESDAY, 17, 18),
  buildSession('late', TUESDAY, 18, 19),
  buildSession('wednesday', '2026-10-14', 9, 10),
];

describe('pickNextClass', () => {
  test('a class in progress comes first, with up to three after it', () => {
    const model = pickNextClass(attended, at(TUESDAY, 11));
    expect(model?.session.id).toBe('morning');
    expect(model?.following.map((session) => session.id)).toEqual(['noon', 'afternoon', 'evening']);
  });

  test('the classes after it can be on later days', () => {
    const model = pickNextClass(attended, at(TUESDAY, 17.5));
    expect(model?.session.id).toBe('evening');
    expect(model?.following.map((session) => session.id)).toEqual(['late', 'wednesday']);
  });

  test('otherwise the next class later today', () => {
    expect(pickNextClass(attended, at(TUESDAY, 12.5))?.session.id).toBe('noon');
  });

  test('cancelled classes are skipped', () => {
    expect(pickNextClass(attended, at(TUESDAY, 14.2))?.session.id).toBe('afternoon');
  });

  test('after the last class of the day, the next day with nothing after it', () => {
    const model = pickNextClass(attended, at(TUESDAY, 19.5));
    expect(model?.session.id).toBe('wednesday');
    expect(model?.following).toEqual([]);
  });

  test('a shorter class that already ended inside a longer one is not coming up', () => {
    const nested = [buildSession('long', TUESDAY, 9, 12), buildSession('short', TUESDAY, 10, 11)];
    const model = pickNextClass(nested, at(TUESDAY, 11.5));
    expect(model?.session.id).toBe('long');
    expect(model?.following).toEqual([]);
  });

  test('a clashing class starting at the same time comes right after', () => {
    const clash = [buildSession('a', TUESDAY, 10, 12), buildSession('b', TUESDAY, 10, 11)];
    const model = pickNextClass(clash, at(TUESDAY, 9));
    expect(model?.session.id).toBe('a');
    expect(model?.following.map((session) => session.id)).toEqual(['b']);
  });

  test('nothing left this term', () => {
    expect(pickNextClass(attended, at('2026-10-15', 9))).toBeNull();
    expect(pickNextClass([], at(TUESDAY, 9))).toBeNull();
  });
});

describe('clashCourseNames', () => {
  test('names the other courses once each', () => {
    const sessions = [
      buildSession('a', TUESDAY, 10, 12, { courseName: 'Networks' }),
      buildSession('b', TUESDAY, 10, 11, { courseName: 'Physics' }),
      buildSession('c', TUESDAY, 11, 12, { courseName: 'Physics' }),
    ];
    const clash = (id: string, other: string): Clash => ({
      id,
      sessionIds: ['a', other],
      start: at(TUESDAY, 10),
      end: at(TUESDAY, 11),
      minutes: 60,
      kind: 'full',
      involvesExam: false,
    });
    const byId = new Map([['a', [clash('x', 'b'), clash('y', 'c')]]]);
    expect(clashCourseNames('a', byId, sessions)).toEqual(['Physics']);
    expect(clashCourseNames('b', byId, sessions)).toEqual([]);
  });
});
