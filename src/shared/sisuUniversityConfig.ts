import type { UniversityConfig } from '@/app/types/universityConfig';

type IdentityProviderLogin = {
  shibbolethUrl?: unknown;
};

type SisuUniversityConfigPayload = {
  identityProviderLogins?: IdentityProviderLogin[];
};

export const extractShibbolethUrl = (source: string): string | null => {
  const match = /var\s+universityConfig\s*=\s*({[\s\S]*?});/.exec(source);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]) as SisuUniversityConfigPayload;
    const shibbolethUrl = parsed.identityProviderLogins?.find(
      (login) => typeof login.shibbolethUrl === 'string' && login.shibbolethUrl.trim().length > 0,
    )?.shibbolethUrl;

    return typeof shibbolethUrl === 'string' ? shibbolethUrl : null;
  } catch {
    return null;
  }
};

export const fetchShibbolethUrl = async (sisuOrigin: string): Promise<string | null> => {
  try {
    const response = await fetch(`${sisuOrigin}/student/universityConfig.js`, {
      credentials: 'omit',
    });

    if (!response.ok) return null;

    return extractShibbolethUrl(await response.text());
  } catch {
    return null;
  }
};

export const buildShibbolethLoginUrl = ({
  shibbolethUrl,
  sisuOrigin,
  targetUrl,
}: {
  shibbolethUrl: string;
  sisuOrigin: string;
  targetUrl: string;
}): string => {
  const url = new URL(shibbolethUrl, sisuOrigin);
  url.searchParams.set('target', targetUrl);
  return url.toString();
};

export const withResolvedShibbolethUrl = async (config: UniversityConfig): Promise<UniversityConfig> => {
  if (config.shibbolethUrl) return config;

  const shibbolethUrl = await fetchShibbolethUrl(config.sisuOrigin);
  if (!shibbolethUrl) return config;

  return { ...config, shibbolethUrl };
};
