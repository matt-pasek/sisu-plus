/// <reference types="bun-types" />

import { describe, expect, mock, test } from 'bun:test';

import { createSessionRevalidator, validateSession } from './sessionValidation';

const response = (status: number, url = 'https://sisu.example.fi/ori/api/user-details', redirected = false) => ({
  redirected,
  status,
  url,
});

describe('validateSession', () => {
  test('reports an expired session when the ping comes back as an auth failure', async () => {
    expect(await validateSession(async () => response(401))).toBe('expired');
    expect(await validateSession(async () => response(403))).toBe('expired');
  });

  test('reports a valid session when the ping succeeds', async () => {
    expect(await validateSession(async () => response(200))).toBe('valid');
  });

  test('reports indeterminate when the ping cannot complete', async () => {
    const outcome = await validateSession(async () => {
      throw new TypeError('Failed to fetch');
    });

    expect(outcome).toBe('indeterminate');
  });
});

describe('createSessionRevalidator', () => {
  const revalidatorWith = (outcomes: Array<'valid' | 'expired' | 'indeterminate'>, startTime = 0) => {
    let currentTime = startTime;
    const onExpired = mock(() => {});
    const validate = mock(async () => outcomes.shift() ?? 'valid');

    return {
      onExpired,
      validate,
      advance: (ms: number) => {
        currentTime += ms;
      },
      revalidator: createSessionRevalidator({
        validate,
        onExpired,
        now: () => currentTime,
        minIntervalMs: 30_000,
      }),
    };
  };

  test('signals expiry when the session no longer validates', async () => {
    const { revalidator, onExpired } = revalidatorWith(['expired']);

    await revalidator.revalidate();

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  test('stays quiet for a valid session', async () => {
    const { revalidator, onExpired } = revalidatorWith(['valid']);

    await revalidator.revalidate();

    expect(onExpired).not.toHaveBeenCalled();
  });

  test('never signals expiry when the network is unreachable', async () => {
    const { revalidator, onExpired } = revalidatorWith(['indeterminate']);

    await revalidator.revalidate();

    expect(onExpired).not.toHaveBeenCalled();
  });

  test('throttles repeated checks inside the interval', async () => {
    const { revalidator, validate, advance } = revalidatorWith(['valid', 'valid']);

    await revalidator.revalidate();
    advance(5_000);
    await revalidator.revalidate();

    expect(validate).toHaveBeenCalledTimes(1);
  });

  test('checks again once the interval has elapsed', async () => {
    const { revalidator, validate, advance } = revalidatorWith(['valid', 'valid']);

    await revalidator.revalidate();
    advance(30_000);
    await revalidator.revalidate();

    expect(validate).toHaveBeenCalledTimes(2);
  });

  test('collapses concurrent checks into a single ping', async () => {
    const { revalidator, validate } = revalidatorWith(['valid', 'valid']);

    await Promise.all([revalidator.revalidate(), revalidator.revalidate()]);

    expect(validate).toHaveBeenCalledTimes(1);
  });

  test('stops checking once the session is known to be expired', async () => {
    const { revalidator, validate, onExpired, advance } = revalidatorWith(['expired', 'expired']);

    await revalidator.revalidate();
    advance(60_000);
    await revalidator.revalidate();

    expect(validate).toHaveBeenCalledTimes(1);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  test('resumes checking after a reset, so a re-authenticated session is watched again', async () => {
    const { revalidator, validate, onExpired } = revalidatorWith(['expired', 'valid']);

    await revalidator.revalidate();
    revalidator.reset();
    await revalidator.revalidate();

    expect(validate).toHaveBeenCalledTimes(2);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  test('a reset clears the throttle window', async () => {
    const { revalidator, validate } = revalidatorWith(['valid', 'valid']);

    await revalidator.revalidate();
    revalidator.reset();
    await revalidator.revalidate();

    expect(validate).toHaveBeenCalledTimes(2);
  });
});
