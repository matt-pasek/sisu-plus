/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { isResumeFresh, resolveResumeRoute, RESUME_TTL_MS } from './sessionResume';

const stash = (route: string, savedAt = 1_000) => ({ route, savedAt });

describe('isResumeFresh', () => {
  test('accepts a stash saved within the time-to-live', () => {
    expect(isResumeFresh(stash('/student/courses', 1_000), 1_000 + RESUME_TTL_MS - 1)).toBe(true);
  });

  test('rejects a stash older than the time-to-live', () => {
    expect(isResumeFresh(stash('/student/courses', 1_000), 1_000 + RESUME_TTL_MS)).toBe(false);
  });

  test('rejects a stash saved in the future', () => {
    expect(isResumeFresh(stash('/student/courses', 5_000), 1_000)).toBe(false);
  });
});

describe('resolveResumeRoute', () => {
  test('restores the stashed route when Shibboleth sanitized us back to the landing page', () => {
    expect(resolveResumeRoute({ currentPath: '/student', stash: stash('/student/courses/abc'), now: 1_000 })).toBe(
      '/student/courses/abc',
    );
  });

  test('treats a trailing slash on the landing page the same way', () => {
    expect(resolveResumeRoute({ currentPath: '/student/', stash: stash('/student/courses/abc'), now: 1_000 })).toBe(
      '/student/courses/abc',
    );
  });

  test('restores nothing when Shibboleth honored the deep target', () => {
    expect(
      resolveResumeRoute({ currentPath: '/student/courses/abc', stash: stash('/student/courses/abc'), now: 1_000 }),
    ).toBeNull();
  });

  test('restores nothing when there is no stash', () => {
    expect(resolveResumeRoute({ currentPath: '/student', stash: undefined, now: 1_000 })).toBeNull();
  });

  test('restores nothing from a stale stash', () => {
    expect(
      resolveResumeRoute({
        currentPath: '/student',
        stash: stash('/student/courses/abc', 1_000),
        now: 1_000 + RESUME_TTL_MS,
      }),
    ).toBeNull();
  });

  test('restores nothing when the stashed route is itself the landing page', () => {
    expect(resolveResumeRoute({ currentPath: '/student', stash: stash('/student'), now: 1_000 })).toBeNull();
  });
});
