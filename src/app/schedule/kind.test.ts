/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { classifySessionKind } from './kind';

describe('classifySessionKind', () => {
  test('exam realisations are exams regardless of names', () => {
    expect(classifySessionKind(['Lectures for everyone'], true)).toBe('exam');
  });

  test('reads English group names', () => {
    expect(classifySessionKind(['HDD7010 1 LAHTI Lectures for everyone', null, 'LAHTI-Teaching'], false)).toBe(
      'lecture',
    );
    expect(classifySessionKind(['HDD7010 1 LAHTI Tutorial 2', null, 'LAHTI-Excercises'], false)).toBe('exercise');
    expect(classifySessionKind(['Lab B'], false)).toBe('lab');
    expect(classifySessionKind(['Research seminar'], false)).toBe('seminar');
  });

  test('reads Finnish group names', () => {
    expect(classifySessionKind(['Luento-opetus'], false)).toBe('lecture');
    expect(classifySessionKind(['Harjoitusryhmä 3'], false)).toBe('exercise');
    expect(classifySessionKind(['Tentti'], false)).toBe('exam');
  });

  test('falls back to a later text, then to other', () => {
    expect(classifySessionKind([null, undefined, 'LAHTI-Teaching'], false)).toBe('lecture');
    expect(classifySessionKind(['Group A'], false)).toBe('other');
    expect(classifySessionKind([], false)).toBe('other');
  });
});
