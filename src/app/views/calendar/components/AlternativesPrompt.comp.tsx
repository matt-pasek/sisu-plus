import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  setName: string | null;
  onPick: () => void;
  onDismiss: () => void;
}

export const AlternativesPrompt: React.FC<Props> = ({ setName, onPick, onDismiss }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div className="mt-2 ml-6 rounded-lg bg-container2/70 px-2.5 py-2 text-[12px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
      <p className="text-offwhite">{t('prompt.question')}</p>
      {setName && <p className="mt-0.5 font-mono text-[10.5px] text-lightGrey">{setName}</p>}
      <div className="mt-2 flex gap-1.5">
        <Button variant="accent" className="min-h-7 px-2" onClick={onPick}>
          {t('prompt.pick')}
        </Button>
        <Button variant="onSurface" className="min-h-7 px-2" onClick={onDismiss}>
          {t('prompt.notNow')}
        </Button>
      </div>
    </div>
  );
};
