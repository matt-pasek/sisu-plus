import { useEffect, useMemo, useState } from 'react';
import type { NotificationCache } from '@/background/notifications/types';

const NOTIFICATION_CACHE_KEY = 'sisuPlusNotifications';

export const useNotificationCache = () => {
  const [cache, setCache] = useState<NotificationCache | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_NOTIFICATION_STATE' }, (response) => {
      if (response?.ok) setCache(response.cache as NotificationCache);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes[NOTIFICATION_CACHE_KEY]) {
        setCache(changes[NOTIFICATION_CACHE_KEY].newValue as NotificationCache);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const unread = useMemo(() => (cache?.unread ?? []).filter((item) => !item.read), [cache?.unread]);

  return {
    cache,
    unread,
    unreadCount: unread.length,
  };
};
