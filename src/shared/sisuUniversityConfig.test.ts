/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildShibbolethLoginUrl, extractShibbolethUrl } from './sisuUniversityConfig';

const universityConfigJs = `
var universityConfig = {
  "identityProviderLogins": [
    {
      "abbr": "HY",
      "name": {
        "en": "University of Helsinki",
        "fi": "Helsingin yliopisto",
        "sv": "Helsingfors universitet"
      },
      "shibbolethUrl": "/Shibboleth.sso/HYLogin?target="
    }
  ]
};
`;

describe('Sisu universityConfig.js helpers', () => {
  test('extracts the Shibboleth login URL from universityConfig.js', () => {
    expect(extractShibbolethUrl(universityConfigJs)).toBe('/Shibboleth.sso/HYLogin?target=');
  });

  test('builds an absolute Shibboleth login URL with the current page as target', () => {
    expect(
      buildShibbolethLoginUrl({
        shibbolethUrl: '/Shibboleth.sso/HYLogin?target=',
        sisuOrigin: 'https://sisu.helsinki.fi',
        targetUrl: 'https://sisu.helsinki.fi/student/plan/123',
      }),
    ).toBe(
      'https://sisu.helsinki.fi/Shibboleth.sso/HYLogin?target=https%3A%2F%2Fsisu.helsinki.fi%2Fstudent%2Fplan%2F123',
    );
  });
});
