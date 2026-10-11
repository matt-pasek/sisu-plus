/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { easterSundayKey, finnishHolidays, holidaysInRange } from './holidays';

const dayOf = (year: number) => new Map(finnishHolidays(year).map((holiday) => [holiday.id, holiday.dateKey]));

describe('easterSundayKey', () => {
  test('matches known Easter Sundays', () => {
    expect(easterSundayKey(2024)).toBe('2024-03-31');
    expect(easterSundayKey(2026)).toBe('2026-04-05');
    expect(easterSundayKey(2027)).toBe('2027-03-28');
  });
});

describe('finnishHolidays', () => {
  test('moving holidays of 2027 follow Easter and the Midsummer rules', () => {
    const days = dayOf(2027);
    expect(days.get('goodFriday')).toBe('2027-03-26');
    expect(days.get('easterMonday')).toBe('2027-03-29');
    expect(days.get('ascension')).toBe('2027-05-06');
    expect(days.get('whitsun')).toBe('2027-05-16');
    expect(days.get('midsummerEve')).toBe('2027-06-25');
    expect(days.get('midsummerDay')).toBe('2027-06-26');
  });

  test('autumn 2026 has All Saints on Saturday 31.10 and Independence Day on 6.12', () => {
    const days = dayOf(2026);
    expect(days.get('allSaints')).toBe('2026-10-31');
    expect(days.get('independence')).toBe('2026-12-06');
    expect(days.get('christmasEve')).toBe('2026-12-24');
  });

  test('lists fifteen holidays in date order', () => {
    const keys = finnishHolidays(2027).map((holiday) => holiday.dateKey);
    expect(keys).toHaveLength(15);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('holidaysInRange', () => {
  test('covers an academic year across the new year once', () => {
    const ids = holidaysInRange({ startKey: '2026-08-01', endKey: '2027-08-01' }).map((holiday) => holiday.id);
    expect(ids[0]).toBe('allSaints');
    expect(ids[ids.length - 1]).toBe('midsummerDay');
    expect(ids.filter((id) => id === 'christmasDay')).toHaveLength(1);
    expect(ids).toContain('newYear');
  });
});
