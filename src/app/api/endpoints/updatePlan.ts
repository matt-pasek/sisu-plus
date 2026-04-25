import { osuvaApi } from '@/app/api/client';
import type { Plan } from '@/app/api/generated/OsuvaApi';

export async function updatePlan(planId: string, plan: Plan): Promise<Plan> {
  const response = await osuvaApi.api.updatePlan(planId, plan);
  return response.data;
}
