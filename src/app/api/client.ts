import { IlmoApi } from './generated/IlmoApi';
import { OriApi } from './generated/OriApi';
import { OsuvaApi } from './generated/OsuvaApi';
import { KoriApi } from './generated/KoriApi';
import { ArtoApi } from './generated/ArtoApi';
import { getSisuApiBaseUrl } from '@/shared/domains';

const securityWorker = async () => {
  const { sisuToken } = await new Promise<{ sisuToken?: string }>((resolve) =>
    chrome.runtime.sendMessage({ type: 'GET_TOKEN', origin: window.location.origin }, resolve),
  );
  if (!sisuToken) return {};
  return { headers: { Authorization: `Bearer ${sisuToken}` } };
};

const customFetch = new Proxy(fetch, {
  async apply(target, _thisArg, args) {
    const response = await (Reflect.apply(target, globalThis, args) as Promise<Response>);
    if (response.url.includes('/student/login')) {
      window.dispatchEvent(new CustomEvent('sisuplus:session-expired'));
    }
    return response;
  },
});

const apiConfig = { securityWorker, customFetch };

export const ilmoApi = new IlmoApi({ baseUrl: getSisuApiBaseUrl('ilmo'), ...apiConfig });
export const oriApi = new OriApi({ baseUrl: getSisuApiBaseUrl('ori'), ...apiConfig });
export const osuvaApi = new OsuvaApi({ baseUrl: getSisuApiBaseUrl('osuva'), ...apiConfig });
export const koriApi = new KoriApi({ baseUrl: getSisuApiBaseUrl('kori'), ...apiConfig });
export const artoApi = new ArtoApi({ baseUrl: getSisuApiBaseUrl('arto'), ...apiConfig });
