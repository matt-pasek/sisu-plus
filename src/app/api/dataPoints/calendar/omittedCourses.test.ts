/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CourseUnitRealisation, Enrolment } from '@/app/api/generated/IlmoApi';
import { FIXTURE_RANGE } from './__fixtures__/calendarRows.fixture';
import { activeRealisationIds, omittedRows } from './omittedCourses';

const enrolment = (realisationId: string, state: Enrolment['state']): Enrolment =>
  ({ id: `en-${realisationId}`, courseUnitRealisationId: realisationId, courseUnitId: 'cu-fin', state }) as Enrolment;

const realisation = (
  id: string,
  eventIds: string[],
  activityPeriod: { startDate?: string; endDate?: string },
): CourseUnitRealisation =>
  ({
    id,
    name: { en: 'Online teaching P1&2' },
    activityPeriod,
    courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
    studyGroupSets: [
      {
        localId: 'set-1',
        name: { fi: 'Opetusryhmä' },
        subGroupRange: { min: 0, max: 0 },
        studySubGroups: [{ id: `${id}-g1`, name: { fi: 'Opetusryhmä' }, studyEventIds: eventIds }],
      },
    ],
  }) as unknown as CourseUnitRealisation;

const TERM = { startDate: '2026-08-31', endDate: '2026-12-13' };

describe('activeRealisationIds', () => {
  test('lists enrolled or confirmed realisations, including ones the calendar rows already have', () => {
    const enrolments = [
      enrolment('lab-cur-42901', 'ENROLLED'),
      enrolment('lab-cur-42858', 'CONFIRMED'),
      enrolment('lut-HDD7010-t1-26-27', 'ENROLLED'),
      enrolment('lut-old', 'NOT_ENROLLED'),
      enrolment('lut-aborted', 'ABORTED_BY_STUDENT'),
    ];
    expect(activeRealisationIds(enrolments)).toEqual(['lab-cur-42858', 'lab-cur-42901', 'lut-HDD7010-t1-26-27']);
  });
});

describe('omittedRows', () => {
  test('keeps term courses whose groups list no study events at all', () => {
    const rows = omittedRows(
      [enrolment('lab-cur-42901', 'ENROLLED')],
      [realisation('lab-cur-42901', [], TERM)],
      new Set(),
      FIXTURE_RANGE,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].courseUnitRealisation?.id).toBe('lab-cur-42901');
    expect(rows[0].enrolment?.id).toBe('en-lab-cur-42901');
    expect(rows[0].studyEvents).toEqual([]);
  });

  test('keeps hidden term courses whose study events Sisu leaves out of the calendar', () => {
    const rows = omittedRows(
      [enrolment('hidden', 'ENROLLED')],
      [realisation('hidden', ['se-1'], TERM)],
      new Set(),
      FIXTURE_RANGE,
    );
    expect(rows.map((row) => row.courseUnitRealisation?.id)).toEqual(['hidden']);
  });

  test('skips courses outside the term and courses already shown', () => {
    const rows = omittedRows(
      [enrolment('last-year', 'ENROLLED'), enrolment('shown', 'ENROLLED')],
      [
        realisation('last-year', [], { startDate: '2025-08-31', endDate: '2025-12-14' }),
        realisation('shown', [], TERM),
      ],
      new Set(['shown']),
      FIXTURE_RANGE,
    );
    expect(rows).toEqual([]);
  });

  test('keeps an open-ended course that started before the term', () => {
    const rows = omittedRows(
      [enrolment('open', 'CONFIRMED')],
      [realisation('open', [], { startDate: '2026-01-10' })],
      new Set(),
      FIXTURE_RANGE,
    );
    expect(rows.map((row) => row.courseUnitRealisation?.id)).toEqual(['open']);
  });
});
