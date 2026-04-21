export interface SisuApiMessage {
  type: 'SISU_API_REQUEST';
  endpoint: string;
  params?: Record<string, string>;
}

export interface SisuApiResponse<T> {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
}

export function sisuRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  return new Promise((resolve, reject) => {
    const message: SisuApiMessage = { type: 'SISU_API_REQUEST', endpoint, params };

    chrome.runtime.sendMessage(message, (response: SisuApiResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response.ok) {
        reject(new Error(`${endpoint} — HTTP ${response.status ?? 'unknown'}: ${response.error ?? 'request failed'}`));
        return;
      }
      resolve(response.data as T);
    });
  });
}
