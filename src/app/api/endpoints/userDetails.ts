import { PrivatePerson } from '@/app/api/generated/OriApi';
import { oriApi } from '@/app/api/client';

export async function fetchUserDetails(): Promise<PrivatePerson> {
  const response = await oriApi.api.getUserDetails();
  return response.data;
}
