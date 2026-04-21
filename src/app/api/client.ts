import { IlmoApi } from './generated/IlmoApi';
import { OriApi } from './generated/OriApi';
import { OsuvaApi } from './generated/OsuvaApi';
import { KoriApi } from './generated/KoriApi';
import { ArtoApi } from './generated/ArtoApi';

const securityWorker = async () => {
  const { sisuToken } = await new Promise<{ sisuToken?: string }>((resolve) =>
    chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, resolve),
  );
  if (!sisuToken) return {};
  return { headers: { Authorization: `Bearer ${sisuToken}` } };
};

export const ilmoApi = new IlmoApi({ securityWorker });
export const oriApi = new OriApi({ securityWorker });
export const osuvaApi = new OsuvaApi({ securityWorker });
export const koriApi = new KoriApi({ securityWorker });
export const artoApi = new ArtoApi({ securityWorker });
