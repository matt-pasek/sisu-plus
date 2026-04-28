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

export const ilmoApi = new IlmoApi({ baseUrl: getSisuApiBaseUrl('ilmo'), securityWorker });
export const oriApi = new OriApi({ baseUrl: getSisuApiBaseUrl('ori'), securityWorker });
export const osuvaApi = new OsuvaApi({ baseUrl: getSisuApiBaseUrl('osuva'), securityWorker });
export const koriApi = new KoriApi({ baseUrl: getSisuApiBaseUrl('kori'), securityWorker });
export const artoApi = new ArtoApi({ baseUrl: getSisuApiBaseUrl('arto'), securityWorker });
