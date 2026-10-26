/// <reference types="bun-types" />
import { afterEach, describe, expect, test } from 'bun:test';
import { dismissToast, getToasts, notify, runToastAction } from './notify';

afterEach(() => {
  getToasts().forEach((toast) => dismissToast(toast.id));
});

describe('notify.undoable', () => {
  test('shows a success toast carrying the action for the given time', () => {
    notify.undoable('Added Hackathon', { label: 'Undo', onAction: () => undefined, durationMs: 5_000 });
    const [toast] = getToasts();
    expect(toast.tone).toBe('success');
    expect(toast.action?.label).toBe('Undo');
    expect(toast.durationMs).toBe(5_000);
  });

  test('running the action calls it once and dismisses the toast', () => {
    let calls = 0;
    notify.undoable('Added Hackathon', { label: 'Undo', onAction: () => (calls += 1), durationMs: 5_000 });
    const [toast] = getToasts();
    runToastAction(toast.id);
    runToastAction(toast.id);
    expect(calls).toBe(1);
    expect(getToasts()).toHaveLength(0);
  });
});
