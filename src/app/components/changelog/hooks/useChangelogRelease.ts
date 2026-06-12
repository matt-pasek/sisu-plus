import { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { CHANGELOG_V2 } from '../constants';
import type { InAppChangelogRelease } from '../types';

export const useChangelogRelease = (): InAppChangelogRelease => {
  const { t } = useTranslationWithPrefix('components.changelog');

  return useMemo(() => {
    const [intro, universities, dashboard, structure, registration, notifications, outro] = CHANGELOG_V2.pages;

    return {
      version: CHANGELOG_V2.version,
      title: 'Sisu+ 2.0',
      subtitle: '',
      pages: [
        {
          ...intro,
          eyebrow: t('pages.intro.eyebrow'),
          titlePrefix: t('pages.intro.titlePrefix'),
          title: t('pages.intro.title'),
          body: t('pages.intro.body'),
          tags: [t('pages.intro.tag0'), t('pages.intro.tag1')],
          badge: t('pages.intro.badge'),
        },
        {
          ...universities,
          eyebrow: t('pages.universities.eyebrow'),
          title: t('pages.universities.title'),
          body: t('pages.universities.body'),
          tags: [t('pages.universities.tag0'), t('pages.universities.tag1'), t('pages.universities.tag2')],
        },
        {
          ...dashboard,
          eyebrow: t('pages.dashboard.eyebrow'),
          title: t('pages.dashboard.title'),
          body: t('pages.dashboard.body'),
          tags: [t('pages.dashboard.tag0'), t('pages.dashboard.tag1'), t('pages.dashboard.tag2')],
        },
        {
          ...structure,
          eyebrow: t('pages.structure.eyebrow'),
          title: t('pages.structure.title'),
          body: t('pages.structure.body'),
          tags: [t('pages.structure.tag0'), t('pages.structure.tag1'), t('pages.structure.tag2')],
        },
        {
          ...registration,
          eyebrow: t('pages.registration.eyebrow'),
          title: t('pages.registration.title'),
          body: t('pages.registration.body'),
          tags: [t('pages.registration.tag0'), t('pages.registration.tag1'), t('pages.registration.tag2')],
        },
        {
          ...notifications,
          eyebrow: t('pages.notifications.eyebrow'),
          title: t('pages.notifications.title'),
          body: t('pages.notifications.body'),
          tags: [t('pages.notifications.tag0'), t('pages.notifications.tag1')],
        },
        {
          ...outro,
          eyebrow: t('pages.outro.eyebrow'),
          titlePrefix: t('pages.outro.titlePrefix'),
          title: t('pages.outro.title'),
          titleSuffix: t('pages.outro.titleSuffix'),
          body: '',
          tags: [],
          primaryCta: t('pages.outro.primaryCta'),
        },
      ],
    };
  }, [t]);
};
