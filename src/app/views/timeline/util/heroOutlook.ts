import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import type { GraduationOutlook } from '@/app/views/timeline/types';
import { getPlanSpan, roundCredits } from './heroPace';

interface OutlookArgs {
  sorted: PeriodCreditSummary[];
  baseline: number;
  target: number | null;
  today: string;
}

const findTargetPeriod = (sorted: PeriodCreditSummary[], baseline: number, target: number) =>
  sorted.reduce<{ total: number; reached: PeriodCreditSummary | null }>(
    (acc, summary) => {
      if (acc.reached) return acc;
      const total = acc.total + summary.completedCredits + summary.plannedCredits;
      return { total, reached: total >= target ? summary : null };
    },
    { total: baseline, reached: null },
  );

export const getGraduationOutlook = ({ sorted, baseline, target, today }: OutlookArgs): GraduationOutlook => {
  if (target !== null && baseline >= target) return { kind: 'met' };
  const span = getPlanSpan(sorted);
  if (!span) return { kind: 'empty' };
  if (target === null) return { kind: 'open', endsIn: span.to };

  const { total, reached } = findTargetPeriod(sorted, baseline, target);
  if (!reached) return { kind: 'short', credits: roundCredits(target - total), endsIn: span.to };
  return reached.period.endDate <= today ? { kind: 'met' } : { kind: 'graduating', period: reached.period };
};
