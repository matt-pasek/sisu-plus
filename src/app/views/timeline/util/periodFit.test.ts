/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';

import { makePeriod } from './__fixtures__/timeline';
import { getPeriodFit } from './periodFit';

const y25p3 = makePeriod({
  locator: '25-3',
  name: '3. period',
  studyYear: 2025,
  startDate: '2026-01-01',
  endDate: '2026-03-01',
});
const y25p4 = makePeriod({
  locator: '25-4',
  name: '4. period',
  studyYear: 2025,
  startDate: '2026-03-02',
  endDate: '2026-05-31',
});
const y26p3 = makePeriod({
  locator: '26-3',
  name: '3. period',
  studyYear: 2026,
  startDate: '2027-01-01',
  endDate: '2027-03-01',
});
const y26p4 = makePeriod({
  locator: '26-4',
  name: '4. period',
  studyYear: 2026,
  startDate: '2027-03-02',
  endDate: '2027-05-31',
});
const periods = [y25p3, y25p4, y26p3, y26p4];

describe('getPeriodFit', () => {
  test('confirmed when a realisation overlaps the target', () => {
    expect(getPeriodFit([{ startDate: '2027-01-10', endDate: '2027-02-20' }], periods, '26-3')).toEqual({
      certainty: 'confirmed',
      periodLocators: ['26-3'],
    });
  });
  test('a two-period realisation places on both, even from its second period', () => {
    expect(getPeriodFit([{ startDate: '2027-01-10', endDate: '2027-05-01' }], periods, '26-4')?.periodLocators).toEqual(
      ['26-3', '26-4'],
    );
  });
  test('likely from last year by period name, keeping the span', () => {
    expect(getPeriodFit([{ startDate: '2026-01-10', endDate: '2026-05-01' }], periods, '26-3')).toEqual({
      certainty: 'likely',
      periodLocators: ['26-3', '26-4'],
    });
  });
  test('confirmed beats likely', () => {
    const fit = getPeriodFit(
      [
        { startDate: '2026-01-10', endDate: '2026-02-01' },
        { startDate: '2027-01-10', endDate: '2027-02-01' },
      ],
      periods,
      '26-3',
    );
    expect(fit?.certainty).toBe('confirmed');
  });
  test('null when never taught in a matching period', () => {
    expect(getPeriodFit([{ startDate: '2026-03-10', endDate: '2026-04-01' }], periods, '26-3')).toBeNull();
    expect(getPeriodFit([{ startDate: null, endDate: '2027-02-01' }], periods, '26-3')).toBeNull();
  });
  test('a realisation running past the known periods keeps only known ones', () => {
    expect(getPeriodFit([{ startDate: '2027-03-10', endDate: '2027-09-30' }], periods, '26-4')?.periodLocators).toEqual(
      ['26-4'],
    );
  });
});
