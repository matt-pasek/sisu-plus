/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import { applyNoteChange, noteStillExists, withoutId } from './noteCache';

const note = (id: string, name = 'Note'): CalendarEvent => ({
  id,
  name,
  startTime: '2026-10-20T14:00',
  duration: 'PT1H',
  recursEvery: 'NEVER',
});

describe('applyNoteChange', () => {
  const events = [note('a'), note('b')];

  test('create appends, update replaces by id, delete removes', () => {
    expect(applyNoteChange(events, { type: 'create', event: note('pending-1') }).map((e) => e.id)).toEqual([
      'a',
      'b',
      'pending-1',
    ]);
    expect(applyNoteChange(events, { type: 'update', event: note('b', 'Renamed') })[1].name).toBe('Renamed');
    expect(applyNoteChange(events, { type: 'delete', noteId: 'a' }).map((e) => e.id)).toEqual(['b']);
  });

  test('never mutates the cached list', () => {
    applyNoteChange(events, { type: 'delete', noteId: 'a' });
    expect(events.map((e) => e.id)).toEqual(['a', 'b']);
  });

  test('withoutId strips the temporary id before POST', () => {
    expect(JSON.parse(JSON.stringify(withoutId(note('pending-1')))).id).toBeUndefined();
  });
});

describe('noteStillExists', () => {
  test('finds a note in any cached range and ignores empty caches', () => {
    expect(noteStillExists([undefined, [note('a'), note('b')]], 'b')).toBe(true);
    expect(noteStillExists([undefined, [note('a')]], 'b')).toBe(false);
    expect(noteStillExists([], 'b')).toBe(false);
  });
});
