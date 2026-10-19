/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { getResizedLocators } from './courseLocators';

describe('getResizedLocators', () => {
  const visible = ['a', 'b', 'c', 'd'];

  test('grows and shrinks from the first period', () => {
    expect(getResizedLocators(['b'], visible, 1)).toEqual(['b', 'c']);
    expect(getResizedLocators(['b', 'c'], visible, -5)).toEqual(['b']);
  });

  test('stops at the last visible period', () => {
    expect(getResizedLocators(['c'], visible, 5)).toEqual(['c', 'd']);
  });

  test('null when unscheduled or not visible', () => {
    expect(getResizedLocators([], visible, 1)).toBeNull();
    expect(getResizedLocators(['x'], visible, 1)).toBeNull();
  });
});
