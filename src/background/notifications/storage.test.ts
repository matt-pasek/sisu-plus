/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildReminderSnapshot } from './__fixtures__/buildReminderSnapshot';
import { EMPTY_NOTIFICATION_CACHE, normalizeNotificationCache } from './storage';

describe('normalizeNotificationCache', () => {
  test('nothing stored gives the empty cache with no reminder snapshot', () => {
    expect(normalizeNotificationCache(undefined)).toEqual(EMPTY_NOTIFICATION_CACHE);
    expect(normalizeNotificationCache(undefined).calendar).toBeNull();
  });

  test('a cache written before Phase 5 gains an empty snapshot and keeps its data', () => {
    const cache = normalizeNotificationCache({ moodle: { lastFetch: 5 }, scheduledAlarms: ['x'] });
    expect(cache.calendar).toBeNull();
    expect(cache.moodle).toEqual({ deadlines: [], lastFetch: 5 });
    expect(cache.scheduledAlarms).toEqual(['x']);
  });

  test('keeps a valid snapshot and drops a broken one', () => {
    const snapshot = buildReminderSnapshot();
    expect(normalizeNotificationCache({ calendar: snapshot }).calendar).toEqual(snapshot);
    expect(normalizeNotificationCache({ calendar: { sessions: 'x' } }).calendar).toBeNull();
  });
});
