/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { ACCENT_MARK, splitAccent } from './accentText';

describe('splitAccent', () => {
  test('splits a translated sentence around the accent mark, wherever the language puts it', () => {
    expect(splitAccent(`Graduating in ${ACCENT_MARK}`, 'Spring 2028')).toEqual({
      before: 'Graduating in ',
      accent: 'Spring 2028',
      after: '',
    });
    expect(splitAccent(`${ACCENT_MARK} of graduating`, '4 cr short')).toEqual({
      before: '',
      accent: '4 cr short',
      after: ' of graduating',
    });
  });

  test('a sentence without the mark has no accent at all', () => {
    expect(splitAccent('No courses scheduled yet', 'ignored')).toEqual({
      before: 'No courses scheduled yet',
      accent: '',
      after: '',
    });
  });
});
