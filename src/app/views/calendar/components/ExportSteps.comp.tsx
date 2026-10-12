import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { ChevronRightIcon } from './icons';

const STEPS = {
  google: ['step1', 'step2', 'step3'],
  apple: ['step1', 'step2'],
  outlook: ['step1', 'step2'],
} as const;
const APPS = ['google', 'apple', 'outlook'] as const;

export const ExportSteps: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div className="flex flex-col">
      {APPS.map((app) => (
        <details key={app} className="group border-t border-border py-2 first:border-t-0">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-medium text-offwhite [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon className="size-3 text-lightGrey transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none" />
            {t(`exportPanel.${app}.name`)}
          </summary>
          <ol className="mt-1.5 list-decimal pl-8 text-[12.5px] leading-relaxed text-lightGrey">
            {STEPS[app].map((step) => (
              <li key={step}>{t(`exportPanel.${app}.${step}`)}</li>
            ))}
          </ol>
        </details>
      ))}
    </div>
  );
};
