/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { createLimiter } from './concurrency';

describe('createLimiter', () => {
  test('never runs more than max tasks at once and keeps each result', async () => {
    const limit = createLimiter(2);
    let active = 0;
    let peak = 0;
    const task = (value: number) =>
      limit(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await Bun.sleep(5);
        active -= 1;
        return value;
      });
    expect(await Promise.all([1, 2, 3, 4, 5].map(task))).toEqual([1, 2, 3, 4, 5]);
    expect(peak).toBe(2);
  });

  test('a call landing between release and waiter wake-up does not exceed max', async () => {
    const limit = createLimiter(1);
    let active = 0;
    let peak = 0;
    const track = async () => {
      active += 1;
      peak = Math.max(peak, active);
      await Bun.sleep(2);
      active -= 1;
    };

    const late: Array<Promise<void>> = [];
    const first = limit(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
            queueMicrotask(() => late.push(limit(track)));
          }, 5);
        }),
    );
    const second = limit(track);

    await Promise.all([first, second]);
    await Promise.all(late);
    expect(peak).toBe(1);
  });

  test('a rejecting task frees its slot and its error reaches the caller', async () => {
    const limit = createLimiter(1);
    const failing = limit(async () => {
      throw new Error('boom');
    });
    const next = limit(async () => 'ran');

    await expect(failing).rejects.toThrow('boom');
    expect(await next).toBe('ran');
  });
});
