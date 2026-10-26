/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { isQuerySettled } from './querySettled';

describe('isQuerySettled', () => {
  test('is settled once fresh data has arrived', () => {
    expect(isQuerySettled({ isSuccess: true, isFetching: false })).toBe(true);
  });

  test('is not settled when the load failed, so an empty fallback never prunes the draft', () => {
    expect(isQuerySettled({ isSuccess: false, isFetching: false })).toBe(false);
  });

  test('is not settled while a refetch replaces stale data', () => {
    expect(isQuerySettled({ isSuccess: true, isFetching: true })).toBe(false);
  });
});
