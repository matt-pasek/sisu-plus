/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { keepDraftForCourses, pruneDraft, stageDraft } from './applyDraft';

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

describe('keepDraftForCourses', () => {
  const draft = new Map([
    ['cu1', ['p2']],
    ['gone', ['p3']],
  ]);

  test('drops entries whose course left the timeline', () => {
    expect([...keepDraftForCourses(draft, [{ courseUnitId: 'cu1' }]).keys()]).toEqual(['cu1']);
    expect(draft.size).toBe(2);
  });

  test('returns the same draft when every course is still there', () => {
    expect(keepDraftForCourses(draft, [{ courseUnitId: 'cu1' }, { courseUnitId: 'gone' }])).toBe(draft);
  });
});

describe('pruneDraft', () => {
  test('drops an entry once its course has left the loaded timeline, so a re-added course starts clean', () => {
    const dragged = new Map([['cu1', ['p2']]]);
    const pruned = pruneDraft(dragged, [], true);
    expect(pruned.has('cu1')).toBe(false);
    expect(pruneDraft(pruned, [{ courseUnitId: 'cu1' }], true).has('cu1')).toBe(false);
    expect(dragged.get('cu1')).toEqual(['p2']);
  });

  test('keeps the draft while the timeline is still loading', () => {
    const draft = new Map([['cu1', ['p2']]]);
    expect(pruneDraft(draft, [], false)).toBe(draft);
  });
});
