/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CourseUnit, Location } from '@/app/api/generated/KoriApi';
import { mapCourseUnits } from './mapCourseUnits';
import { mapLocations } from './mapLocations';
import type { LabelPicker } from './types';

const label: LabelPicker = (value) => value?.en ?? null;

describe('mapLocations', () => {
  test('maps rooms with and without buildings and skips ones without an id', () => {
    const rooms = mapLocations(
      [
        { id: 'loc-aud1b', name: { en: 'M19_AUD1B Auditorio 1' }, buildingId: 'b1', building: { name: { en: 'LAB' } } },
        { id: 'loc-x', name: { en: 'Room X' }, buildingId: 'b2' },
        { name: { en: 'No id' }, buildingId: 'b3' },
      ] as unknown as Location[],
      label,
    );
    expect(rooms).toEqual({
      'loc-aud1b': { id: 'loc-aud1b', name: 'M19_AUD1B Auditorio 1', building: 'LAB' },
      'loc-x': { id: 'loc-x', name: 'Room X', building: null },
    });
  });
});

describe('mapCourseUnits', () => {
  test('keeps code, minimum credits and name', () => {
    const units = mapCourseUnits(
      [
        { id: 'cu-chn', code: 'HDD7010', credits: { min: 5 }, name: { en: 'Basic Chinese 1' } },
        { code: 'NOID', credits: { min: 1 }, name: { en: 'No id' } },
      ] as unknown as CourseUnit[],
      label,
    );
    expect(units).toEqual({ 'cu-chn': { id: 'cu-chn', code: 'HDD7010', credits: 5, name: 'Basic Chinese 1' } });
  });
});
