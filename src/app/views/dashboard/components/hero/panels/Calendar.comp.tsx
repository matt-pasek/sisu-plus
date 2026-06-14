import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

export const Calendar: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  return (
    <div className="hidden min-w-36 flex-col items-start gap-2 md:flex">
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
        {t('hero.panel.calendar')}
      </p>
      <div className="rounded-lg border border-dashed border-border px-3 py-2 text-[11px] text-lightGrey/50">
        Course Calendar
        <br />
        coming soon
      </div>
    </div>
  );
};
