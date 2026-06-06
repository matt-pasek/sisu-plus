import React from 'react';
import { formatCredits } from '@/app/helpers/formatCredits';

interface Props {
  label: string;
  credits: number;
  variant: 'completed' | 'planned';
}

export const CreditChip: React.FC<Props> = ({ label, credits, variant }) => {
  const variantClass =
    variant === 'completed'
      ? 'bg-lighterGreen/10 text-lighterGreen ring-lighterGreen/10'
      : 'bg-blue-400/10 text-blue-300 ring-blue-400/10';

  return (
    <span
      title={`${label}: ${formatCredits(credits)}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ring-1 ${variantClass}`}
    >
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span>{formatCredits(credits)}</span>
    </span>
  );
};
