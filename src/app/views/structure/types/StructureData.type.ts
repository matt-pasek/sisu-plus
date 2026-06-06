import { Plan } from '@/app/api/generated/OsuvaApi';
import { SectionData } from './SectionData.type';

export type StructureData = {
  planId: string;
  plan: Plan;
  planName: string;
  studyRightUntil: string | null;
  totalTarget: number;
  degreeMinimumCredits: number | null;
  totalCompleted: number;
  sections: SectionData[];
};
