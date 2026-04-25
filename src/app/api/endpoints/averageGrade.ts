import { oriApi } from '@/app/api/client';
import { GradeAverageCalculationRequest, GradeAverageCalculationResult } from '@/app/api/generated/OriApi';

export async function fetchAverageGrade(
  request: GradeAverageCalculationRequest,
): Promise<GradeAverageCalculationResult> {
  const response = await oriApi.api.calculateGradeAverage(request);
  return response.data;
}
