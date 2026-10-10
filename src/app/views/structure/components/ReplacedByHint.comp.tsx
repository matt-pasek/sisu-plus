import React from 'react';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getSubstituteIds } from '@/app/views/structure/util/editing/structurePlanDraft';
import { SwapIcon } from './icons';

interface Props {
  plan: Plan;
  courseUnitId: string;
  courseNames: Map<string, string>;
  iconClassName: string;
}

export const ReplacedByHint: React.FC<Props> = ({ plan, courseUnitId, courseNames, iconClassName }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const names = getSubstituteIds(plan, courseUnitId).map((id) => courseNames.get(id) ?? id);

  if (names.length === 0) return null;

  return (
    <span className="mt-1 flex items-start gap-1.5 text-[11px] leading-snug text-lightGrey">
      <SwapIcon className={`mt-px size-3 shrink-0 ${iconClassName}`} />
      {t('edit.replacedByLabel', { names: names.join(', ') })}
    </span>
  );
};
