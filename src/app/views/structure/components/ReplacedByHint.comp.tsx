import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SwapIcon } from './icons';

interface Props {
  names: string[];
  iconClassName: string;
}

export const ReplacedByHint: React.FC<Props> = ({ names, iconClassName }) => {
  const { t } = useTranslationWithPrefix('views.structure');

  if (names.length === 0) return null;

  return (
    <span className="mt-1 flex items-start gap-1.5 text-[11px] leading-snug text-lightGrey">
      <SwapIcon className={`mt-px size-3 shrink-0 ${iconClassName}`} />
      {t('edit.replacedByLabel', { names: names.join(', ') })}
    </span>
  );
};
