import { koriApi } from '../client';
import type { CourseUnit } from '../generated/KoriApi';

export async function fetchCourseUnit(courseUnitId: string): Promise<CourseUnit> {
  const response = await koriApi.api.getCourseUnit(courseUnitId);
  return response.data;
}

export async function fetchCourseUnitsByGroupIds(groupIds: string[]): Promise<CourseUnit[]> {
  const results = await Promise.all(groupIds.map((groupId) => koriApi.api.findBy2({ groupId }).then((r) => r.data)));
  return results.flat();
}
