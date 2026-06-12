import { Plan } from '@/app/api/generated/OsuvaApi';
import { SectionData } from './SectionData.type';

export type StructureData = {
  planId: string;
  plan: Plan;
  planName: string;
  degreeProgramName: string | null;
  curriculumPeriodName: string | null;
  planModifiedOn: string | null;
  planCreatedOn: string | null;
  studyRightUntil: string | null;
  totalTarget: number;
  degreeMinimumCredits: number | null;
  totalCompleted: number;
  sections: SectionData[];
};
