import { isAuthFailure } from './authFailure';

export type SessionValidationOutcome = 'valid' | 'expired' | 'indeterminate';

type PingResponse = Pick<Response, 'status' | 'redirected' | 'url'>;

type SessionRevalidatorOptions = {
  validate: () => Promise<SessionValidationOutcome>;
  onExpired: () => void;
  now?: () => number;
  minIntervalMs?: number;
};

const DEFAULT_MIN_INTERVAL_MS = 30_000;

export const validateSession = async (ping: () => Promise<PingResponse>): Promise<SessionValidationOutcome> => {
  try {
    return isAuthFailure(await ping()) ? 'expired' : 'valid';
  } catch {
    return 'indeterminate';
  }
};

export const createSessionRevalidator = ({
  validate,
  onExpired,
  now = () => Date.now(),
  minIntervalMs = DEFAULT_MIN_INTERVAL_MS,
}: SessionRevalidatorOptions) => {
  let lastCheckedAt: number | undefined;
  let inFlight: Promise<void> | undefined;
  let expired = false;

  const run = async () => {
    lastCheckedAt = now();

    if ((await validate()) !== 'expired') return;

    expired = true;
    onExpired();
  };

  const revalidate = () => {
    if (expired) return Promise.resolve();
    if (inFlight) return inFlight;
    if (lastCheckedAt !== undefined && now() - lastCheckedAt < minIntervalMs) return Promise.resolve();

    inFlight = run().finally(() => {
      inFlight = undefined;
    });

    return inFlight;
  };

  const reset = () => {
    lastCheckedAt = undefined;
    expired = false;
  };

  return { revalidate, reset };
};
