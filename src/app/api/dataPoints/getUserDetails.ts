import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchUserDetails } from '@/app/api/endpoints/userDetails';

export const getUserDetails = () => {
  const { data: userDetails, isLoading: loadingDetails, error } = useSisuQuery(['user-details'], fetchUserDetails);
  return { userDetails, loadingDetails, detailsError: error };
};
