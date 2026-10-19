import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SwapSuggestionModel } from '../types';
import { formatClock, formatSessionDate } from '../util';

interface Props {
  suggestion: SwapSuggestionModel;
  locale: string;
  onSwitch: () => void;
  onKeep: () => void;
}

export const SwapSuggestion: React.FC<Props> = ({ suggestion, locale, onSwitch, onKeep }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const { target } = suggestion;
  return (
    <div className="mt-2.5 rounded-lg bg-container/60 px-2.5 py-2 text-offwhite">
      <p className="text-[12px]">
        {t('suggestion.free', {
          group: target.groupName ?? target.courseName,
          date: formatSessionDate(target.dateKey, locale),
          start: formatClock(target.start),
          end: formatClock(target.end),
        })}
      </p>
      <div className="mt-2 flex gap-1.5">
        <Button variant="accent" className="min-h-7 px-2" onClick={onSwitch}>
          {t('suggestion.switch')}
        </Button>
        <Button variant="onSurface" className="min-h-7 px-2" onClick={onKeep}>
          {t('suggestion.keep')}
        </Button>
      </div>
    </div>
  );
};
