type AuthFailureResponse = Pick<Response, 'status' | 'redirected' | 'url'>;

const AUTH_FAILURE_REDIRECT_PATTERN = /\/(student\/)?login|\/sso|\/idp/i;

export const isAuthFailure = (response: AuthFailureResponse): boolean =>
  response.status === 401 ||
  response.status === 403 ||
  (response.redirected && AUTH_FAILURE_REDIRECT_PATTERN.test(response.url));
