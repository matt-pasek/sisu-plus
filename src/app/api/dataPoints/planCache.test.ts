/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { findCachedPlan, restorePlans, snapshotPlans, updateCachedPlan } from './planCache';

const planA = { id: 'a', name: 'Primary' } as Plan;

const seeded = () => {
  const client = new QueryClient();
  client.setQueryData(['plans', 'en'], [planA]);
  client.setQueryData(['plans', 'fi'], [planA]);
  return client;
};

describe('plan cache', () => {
  test('finds a plan under any language key', () => {
    expect(findCachedPlan(seeded(), 'a')).toEqual(planA);
    expect(findCachedPlan(seeded(), 'missing')).toBeUndefined();
  });

  test('updates every language copy', () => {
    const client = seeded();
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    expect(client.getQueryData<Plan[]>(['plans', 'en'])?.[0].name).toBe('Changed');
    expect(client.getQueryData<Plan[]>(['plans', 'fi'])?.[0].name).toBe('Changed');
  });

  test('restores a snapshot in every language', () => {
    const client = seeded();
    const snapshot = snapshotPlans(client);
    updateCachedPlan(client, 'a', (plan) => ({ ...plan, name: 'Changed' }));
    restorePlans(client, snapshot);
    expect(client.getQueryData<Plan[]>(['plans', 'fi'])?.[0].name).toBe('Primary');
  });
});
