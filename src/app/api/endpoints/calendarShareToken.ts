import { ilmoApi } from '@/app/api/client';
import type { CalendarShareToken } from '@/app/api/generated/IlmoApi';

export const createShareToken = async (language: string): Promise<CalendarShareToken> => {
  const response = await ilmoApi.api.createToken({ language, role: 'STUDENT' });
  return response.data;
};

export const removeShareToken = async (token: string): Promise<void> => {
  await ilmoApi.api.removeToken(token);
};
