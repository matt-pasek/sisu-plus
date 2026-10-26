/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { decodeHtmlEntities, getCategoryLabel, getFirstIcsCategory } from './icsCategory';

describe('getFirstIcsCategory', () => {
  test('rejoins a Moodle course name the parser split on its escaped commas', () => {
    expect(getFirstIcsCategory(['CT60A5540 Contact teaching\\', ' Lpr\\', ' Lahti 26.10.2026-11.12.2026'])).toBe(
      'CT60A5540 Contact teaching, Lpr, Lahti 26.10.2026-11.12.2026',
    );
  });

  test('decodes the double-escaped ampersand Moodle sends', () => {
    expect(getFirstIcsCategory(['K200DK03 Verkko-opetus P1&amp;amp;2\\', ' K200DK03-3003 31.8.2026-13.12.2026'])).toBe(
      'K200DK03 Verkko-opetus P1&2, K200DK03-3003 31.8.2026-13.12.2026',
    );
  });

  test('unescapes semicolons and backslashes a parser left in place', () => {
    expect(getFirstIcsCategory(['P1&amp\\;2 \\\\ B'])).toBe('P1&2 \\ B');
  });

  test('keeps an escaped backslash right before a real separator', () => {
    expect(getFirstIcsCategory(['Path \\\\', 'Next'])).toBe('Path \\');
  });

  test('is null without categories', () => {
    expect(getFirstIcsCategory(undefined)).toBeNull();
    expect(getFirstIcsCategory([])).toBeNull();
  });
});

describe('getCategoryLabel', () => {
  test('keeps the part before the campus and date details', () => {
    expect(getCategoryLabel('CT60A5540 Contact teaching, Lpr, Lahti 26.10.2026-11.12.2026')).toBe(
      'CT60A5540 Contact teaching',
    );
  });

  test('leaves a name without details alone', () => {
    expect(getCategoryLabel('CT60A4304_12.09.2026')).toBe('CT60A4304_12.09.2026');
  });
});

describe('decodeHtmlEntities', () => {
  test('decodes named and numeric entities', () => {
    expect(decodeHtmlEntities('A &lt;b&gt; &quot;c&quot; &#39;d&#x27; &nbsp;e')).toBe('A <b> "c" \'d\'  e');
  });

  test('leaves unknown entities and bare ampersands as they are', () => {
    expect(decodeHtmlEntities('R&D &copy2 &unknown;')).toBe('R&D &copy2 &unknown;');
  });
});
