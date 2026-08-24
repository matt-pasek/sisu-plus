/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { isAuthFailure } from './authFailure';

const response = (
  status: number,
  url: string,
  redirected = false,
): Pick<Response, 'status' | 'redirected' | 'url'> => ({
  redirected,
  status,
  url,
});

describe('isAuthFailure', () => {
  test('treats unauthorized API responses as auth failures', () => {
    expect(isAuthFailure(response(401, 'https://opetushallinto.example.fi/kori/api'))).toBe(true);
    expect(isAuthFailure(response(403, 'https://opetushallinto.example.fi/kori/api'))).toBe(true);
  });

  test('treats redirected login and identity provider responses as auth failures', () => {
    expect(isAuthFailure(response(200, 'https://sisu.example.fi/student/login', true))).toBe(true);
    expect(isAuthFailure(response(200, 'https://idp.example.fi/idp/profile/SAML2/Redirect/SSO', true))).toBe(true);
  });

  test('ignores ordinary successful API responses', () => {
    expect(isAuthFailure(response(200, 'https://opetushallinto.example.fi/kori/api'))).toBe(false);
  });
});
