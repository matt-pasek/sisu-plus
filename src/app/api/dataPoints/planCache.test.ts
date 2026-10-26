/// <reference types="bun-types" />
import { afterEach, describe, expect, setSystemTime, test } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { findCachedPlan, findCachedPrimaryPlan, restorePlans, snapshotPlans, updateCachedPlan } from './planCache';

const planA = { id: 'a', name: 'Primary', primary: true } as Plan;
const planB = { id: 'b', name: 'Other' } as Plan;

const seeded = () => {
  const client = new QueryClient();
  client.setQueryData(['plans', 'en'], [planA]);
  client.setQueryData(['plans', 'fi'], [planA]);
  return client;
};

const diverged = () => {
  const client = new QueryClient();
  client.setQueryData(['plans', 'fi'], [{ ...planA, name: 'Stale' }], { updatedAt: 1_000 });
  client.setQueryData(['plans', 'en'], [{ ...planA, name: 'Fresh' }], { updatedAt: 2_000 });
  return client;
};

afterEach(() => {
  setSystemTime();
});

describe('plan cache', () => {
  test('finds a plan under any language key', () => {
    expect(findCachedPlan(seeded(), 'a')).toEqual(planA);
    expect(findCachedPlan(seeded(), 'missing')).toBeUndefined();
  });

  test('returns the most recently updated copy when language copies diverge', () => {
    expect(findCachedPlan(diverged(), 'a')?.name).toBe('Fresh');
  });

  test('finds the primary plan in the freshest copy', () => {
    expect(findCachedPrimaryPlan(diverged())?.name).toBe('Fresh');
    expect(findCachedPrimaryPlan(new QueryClient())).toBeUndefined();
  });

  test('updates every language copy', () => {
    const client = seeded();
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    expect(client.getQueryData<Plan[]>(['plans', 'en'])?.[0].name).toBe('Changed');
    expect(client.getQueryData<Plan[]>(['plans', 'fi'])?.[0].name).toBe('Changed');
  });

  test('an optimistic update keeps the fresh copy ahead of the stale one', () => {
    setSystemTime(new Date('2026-10-19T12:00:00Z'));
    const client = diverged();
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: `${plan.name} + course` }));
    expect(findCachedPlan(client, 'a')?.name).toBe('Fresh + course');
    expect(client.getQueryState(['plans', 'fi'])?.dataUpdatedAt).toBe(1_000);
  });

  test('an optimistic update marks the freshest copy as fresh, so a panel opened mid-write does not refetch it', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    setSystemTime(now);
    const client = diverged();
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    expect(client.getQueryState(['plans', 'en'])?.dataUpdatedAt).toBe(now.getTime());
    expect(client.getQueryState(['plans', 'fi'])?.dataUpdatedAt).toBe(1_000);
  });

  test('updating on an empty client creates nothing', () => {
    const client = new QueryClient();
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    expect(client.getQueryCache().findAll()).toHaveLength(0);
  });

  test('leaves a non-matching plan untouched', () => {
    const client = new QueryClient();
    client.setQueryData(['plans', 'en'], [planA, planB]);
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    expect(client.getQueryData<Plan[]>(['plans', 'en'])?.[1]).toBe(planB);
  });

  test('restores a snapshot in every language', () => {
    const client = seeded();
    const snapshot = snapshotPlans(client);
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    restorePlans(client, snapshot);
    expect(client.getQueryData<Plan[]>(['plans', 'fi'])?.[0].name).toBe('Primary');
  });

  test('a restore keeps the fresher copy ahead of the stale one', () => {
    setSystemTime(new Date('2026-10-19T12:00:00Z'));
    const client = diverged();
    const snapshot = snapshotPlans(client);
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Optimistic' }));
    restorePlans(client, snapshot);
    expect(findCachedPlan(client, 'a')?.name).toBe('Fresh');
  });
});
