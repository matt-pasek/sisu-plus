export interface ShareLink {
  token: string | null;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  reset: () => void;
  isResetting: boolean;
}
