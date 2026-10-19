/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { stageDraft } from './applyDraft';

describe('stageDraft', () => {
  test('adds a move that differs from the original periods', () => {
    expect(stageDraft(new Map(), ['p1'], 'cu1', ['p2']).get('cu1')).toEqual(['p2']);
  });

  test('drops the entry when the course is moved back to its original periods', () => {
    expect(stageDraft(new Map([['cu1', ['p2']]]), ['p1'], 'cu1', ['p1']).has('cu1')).toBe(false);
  });

  test('leaves the current draft untouched', () => {
    const current = new Map([['cu1', ['p2']]]);
    stageDraft(current, ['p1'], 'cu1', ['p3']);
    expect(current.get('cu1')).toEqual(['p2']);
  });
});
