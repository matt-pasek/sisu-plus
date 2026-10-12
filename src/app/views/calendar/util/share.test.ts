/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { shareFeedUrl, shareLanguage } from './share';

describe('share link', () => {
  test('builds the Sisu feed URL like OG Sisu does', () => {
    expect(shareFeedUrl('https://sisu.lut.fi', 'abc123')).toBe('https://sisu.lut.fi/ilmo/api/calendar-share/abc123');
  });

  test('escapes the token', () => {
    expect(shareFeedUrl('https://sisu.lut.fi', 'a/b')).toBe('https://sisu.lut.fi/ilmo/api/calendar-share/a%2Fb');
  });

  test('passes a Sisu language, falling back to English', () => {
    expect(shareLanguage('fi')).toBe('fi');
    expect(shareLanguage('en-GB')).toBe('en');
    expect(shareLanguage('de')).toBe('en');
  });
});
