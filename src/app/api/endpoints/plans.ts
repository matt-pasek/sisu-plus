import { osuvaApi } from '../client';
import type { Plan } from '../generated/OsuvaApi';

export type { Plan };
export type PlansResponse = Plan[];

export async function fetchPlans(): Promise<PlansResponse> {
  const response = await osuvaApi.api.getMyPlans();
  return response.data;
}
