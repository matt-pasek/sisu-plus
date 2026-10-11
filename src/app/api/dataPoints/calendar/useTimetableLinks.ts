import { useCallback, useEffect, useState } from 'react';
import { LINKS_KEY, parseLinks, withLink, withoutLink } from './timetableLinks';
import type { TimetableLink } from './types';

type Links = Record<string, TimetableLink>;

export const useTimetableLinks = (): {
  links: Links;
  saveLink: (courseKey: string, link: TimetableLink) => void;
  removeLink: (courseKey: string) => void;
} => {
  const [links, setLinks] = useState<Links>({});

  useEffect(() => {
    let active = true;
    chrome.storage.sync
      .get(LINKS_KEY)
      .then((items) => {
        if (active) setLinks(parseLinks(items[LINKS_KEY]));
      })
      .catch(() => undefined);
    const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'sync' && changes[LINKS_KEY]) setLinks(parseLinks(changes[LINKS_KEY].newValue));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const write = useCallback((next: Links) => {
    setLinks(next);
    void chrome.storage.sync.set({ [LINKS_KEY]: next }).catch(() => undefined);
  }, []);
  const saveLink = useCallback(
    (courseKey: string, link: TimetableLink) => write(withLink(links, courseKey, link)),
    [links, write],
  );
  const removeLink = useCallback((courseKey: string) => write(withoutLink(links, courseKey)), [links, write]);

  return { links, saveLink, removeLink };
};
