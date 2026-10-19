/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from './__fixtures__/buildSession';
import { seriesKeyOf } from './series';

describe('seriesKeyOf', () => {
  test('groups weekly study events of one study subgroup into one series', () => {
    const week1 = buildSession('a', '2026-10-05', 14, 16, { seriesId: 'se-1', courseKey: 'cur', groupId: 'sub-lec' });
    const week2 = buildSession('b', '2026-10-12', 14, 16, { seriesId: 'se-2', courseKey: 'cur', groupId: 'sub-lec' });
    expect(seriesKeyOf(week1)).toBe(seriesKeyOf(week2));
  });

  test('keeps subgroups of different implementations apart', () => {
    const a = buildSession('a', '2026-10-05', 14, 16, { courseKey: 'cur-1', groupId: 'sub' });
    const b = buildSession('b', '2026-10-05', 14, 16, { courseKey: 'cur-2', groupId: 'sub' });
    expect(seriesKeyOf(a)).not.toBe(seriesKeyOf(b));
  });

  test('falls back to the study event without a subgroup', () => {
    const a = buildSession('a', '2026-10-05', 14, 16, { seriesId: 'se-1' });
    const b = buildSession('b', '2026-10-12', 14, 16, { seriesId: 'se-1' });
    const other = buildSession('c', '2026-10-12', 14, 16, { seriesId: 'se-2' });
    expect(seriesKeyOf(a)).toBe(seriesKeyOf(b));
    expect(seriesKeyOf(a)).not.toBe(seriesKeyOf(other));
  });
});
