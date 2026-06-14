import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getMoodleCalendarExportUrlFromConfig } from '@/shared/domains';

export const MoodleMissingToken: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const [prefs] = useChromeStorage();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <svg aria-hidden="true" className="size-8 text-lightGrey" fill="currentColor" viewBox="0 0 24 24">
          <path
            clipRule="evenodd"
            d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
            fillRule="evenodd"
          />
        </svg>
        <div className="text-offwhite">
          <p className="text-sm font-medium">{t('moodleMissing.title')}</p>
          <p className="text-xs font-light">{t('moodleMissing.subtitle')}</p>
        </div>
      </div>
      <p className="text-xs font-light text-lightGrey">{t('moodleMissing.description')}</p>
      <Button
        onClick={() =>
          prefs.universityConfig && window.open(getMoodleCalendarExportUrlFromConfig(prefs.universityConfig))
        }
      >
        {t('moodleMissing.button')}
      </Button>
    </div>
  );
};
