/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { isNotFound, resolveShareToken, shareTokenKey } from './shareTokenCache';

describe('share token cache', () => {
  test('keys the token by Sisu origin and student, so a shared browser never shows another feed', () => {
    expect(shareTokenKey('https://sisu.lut.fi', 'otm-1')).toBe('calendarShareToken:https://sisu.lut.fi:otm-1');
    expect(shareTokenKey('https://sisu.lut.fi', 'otm-2')).not.toBe(shareTokenKey('https://sisu.lut.fi', 'otm-1'));
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

  test('a 404 on reset means the token is already revoked', () => {
    expect(isNotFound({ status: 404 })).toBe(true);
    expect(isNotFound({ status: 503 })).toBe(false);
    expect(isNotFound(null)).toBe(false);
    expect(isNotFound('Not Found')).toBe(false);
  });
});
