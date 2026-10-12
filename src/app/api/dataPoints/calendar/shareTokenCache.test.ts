/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { resolveShareToken, shareTokenKey } from './shareTokenCache';

describe('share token cache', () => {
  test('keys the token by Sisu origin', () => {
    expect(shareTokenKey('https://sisu.lut.fi')).toBe('calendarShareToken:https://sisu.lut.fi');
  });

  test('reuses a saved token without asking Sisu for a new one', async () => {
    let created = 0;
    const create = async () => {
      created += 1;
      return 'fresh';
    };
    expect(await resolveShareToken('saved', create)).toEqual({ token: 'saved', created: false });
    expect(created).toBe(0);
  });

  test('creates a token only when none is saved', async () => {
    expect(await resolveShareToken(null, async () => 'fresh')).toEqual({ token: 'fresh', created: true });
  });
});
