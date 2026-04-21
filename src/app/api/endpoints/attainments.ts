import { oriApi } from '../client';
import type {
  AssessmentItemAttainmentRestricted,
  CourseUnitAttainmentRestricted,
  CustomCourseUnitAttainmentRestricted,
  CustomModuleAttainmentRestricted,
  DegreeProgrammeAttainmentRestricted,
  ModuleAttainmentRestricted,
} from '../generated/OriApi';

export type Attainment =
  | AssessmentItemAttainmentRestricted
  | CourseUnitAttainmentRestricted
  | CustomCourseUnitAttainmentRestricted
  | CustomModuleAttainmentRestricted
  | DegreeProgrammeAttainmentRestricted
  | ModuleAttainmentRestricted;

export type AttainmentsResponse = Attainment[];

export async function fetchAttainments(): Promise<AttainmentsResponse> {
  const response = await oriApi.api.getMyAttainments();
  return response.data;
}
