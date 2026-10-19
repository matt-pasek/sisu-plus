import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { ArrowRightIcon, CrossIcon } from './icons';

interface Props {
  question: string;
  onPick: () => void;
  onDismiss: () => void;
}

export const AlternativesPrompt: React.FC<Props> = ({ question, onPick, onDismiss }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div className="mt-1 ml-6 flex items-start gap-1">
      <button
        type="button"
        onClick={onPick}
        className="group/prompt flex min-w-0 flex-1 cursor-pointer items-start gap-1.5 rounded-md py-0.5 text-left text-[12px] leading-snug font-medium text-lighterGreen transition-colors duration-150 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen"
      >
        <span className="min-w-0">{question}</span>
        <ArrowRightIcon className="mt-0.5 size-3 shrink-0 transition-transform duration-150 group-hover/prompt:translate-x-0.5 motion-reduce:transition-none" />
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('prompt.notNow')}
        title={t('prompt.notNow')}
        className="relative shrink-0 cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-1.5 after:content-[''] hover:text-offwhite focus-visible:outline-2 focus-visible:outline-lighterGreen"
      >
        <CrossIcon className="size-3" />
      </button>
    </div>
  );
};
