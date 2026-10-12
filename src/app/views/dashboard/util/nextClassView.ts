import type { NextClassModel, NextClassView } from '../types';

interface NextClassInput {
  error: Error | null;
  updatedAt: number;
  courseCount: number;
  model: NextClassModel | null;
}

export const nextClassView = ({ error, updatedAt, courseCount, model }: NextClassInput): NextClassView => {
  if (error) return 'failed';
  if (updatedAt === 0) return 'loading';
  if (courseCount === 0) return 'noCourses';
  return model ? 'ready' : 'noneLeft';
};
