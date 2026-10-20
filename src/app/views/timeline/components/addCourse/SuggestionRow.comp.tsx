import React from 'react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { Button } from '@/app/components/ui/Button.comp';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermTitle } from '@/app/helpers/getSemesterTitle';
import { getCurrentLocale } from '@/app/i18n';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AddRowState } from '@/app/views/timeline/util/addRowState';
import type { CandidatePrerequisites } from '@/app/views/timeline/util/candidatePrerequisites';
import { formatPeriodNameRange } from '@/app/views/timeline/util/periodNameRange';
import type { PeriodFit } from '@/app/views/timeline/util/periodFit';

interface Props {
  name: string;
  code: string | null;
  credits: number | null;
  creditsMax?: number | null;
  fit: PeriodFit | null;
  fitPeriods: StudyPeriodInfo[];
  targetPeriodName: string;
  required: boolean;
  prerequisites?: CandidatePrerequisites;
  state: AddRowState;
  disabled?: boolean;
  note?: string;
  moduleChoice?: React.ReactNode;
  onAdd: () => void;
  onUndo: () => void;
}

export const SuggestionRow: React.FC<Props> = ({
  name,
  code,
  credits,
  creditsMax = null,
  fit,
  fitPeriods,
  targetPeriodName,
  required,
  prerequisites,
  state,
  disabled = false,
  note,
  moduleChoice,
  onAdd,
  onUndo,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const firstPeriod = fitPeriods[0];
  const lastPeriod = fitPeriods[fitPeriods.length - 1];
  const added = state === 'added';
  const label = added
    ? `${t('addCourse.added')} · ${t('addCourse.undo')}`
    : state === 'adding'
      ? t('addCourse.adding')
      : t('addCourse.add');
  const term = firstPeriod ? getTermTitle(firstPeriod) : '';
  const creditsLabel =
    credits != null && creditsMax != null && creditsMax > credits
      ? `${credits}–${formatCredits(creditsMax)}`
      : formatCredits(credits);
  const textItems: { key: string; node: React.ReactNode }[] = [
    ...(code ? [{ key: 'code', node: <span>{code}</span> }] : []),
    ...(credits != null
      ? [{ key: 'credits', node: <span className="font-medium text-[#7ea0ff]">{creditsLabel}</span> }]
      : []),
  ];
  const chipItems: { key: string; node: React.ReactNode }[] = [
    ...(fit && firstPeriod && lastPeriod
      ? [
          {
            key: 'periods',
            node: (
              <StatusChip tone="neutral">
                {t('addCourse.periods', {
                  count: fitPeriods.length,
                  range: formatPeriodNameRange(firstPeriod.name, lastPeriod.name),
                })}
              </StatusChip>
            ),
          },
        ]
      : []),
    ...(fit?.certainty === 'confirmed' && firstPeriod
      ? [
          {
            key: 'timing',
            node: (
              <StatusChip tone="ok">
                {t('addCourse.confirmed', {
                  term: getCurrentLocale() === 'fi' ? term.toLocaleLowerCase('fi') : term,
                })}
              </StatusChip>
            ),
          },
        ]
      : []),
    ...(fit?.certainty === 'likely'
      ? [
          {
            key: 'timing',
            node: <StatusChip tone="info">{t('addCourse.likely', { period: targetPeriodName })}</StatusChip>,
          },
        ]
      : []),
    ...(required ? [{ key: 'required', node: <StatusChip tone="neutral">{t('addCourse.required')}</StatusChip> }] : []),
  ];

  return (
    <li className="rounded-lg border border-border bg-container2/60 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] leading-snug font-semibold text-offwhite">{name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-lightGrey">
            {textItems.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 && <span aria-hidden="true">·</span>}
                {item.node}
              </React.Fragment>
            ))}
            {chipItems.map((item) => (
              <React.Fragment key={item.key}>{item.node}</React.Fragment>
            ))}
          </div>
        </div>
        <Button
          variant={added ? 'accent' : 'primary'}
          className="shrink-0"
          disabled={disabled || state === 'busy' || state === 'adding'}
          onClick={added ? onUndo : onAdd}
        >
          {label}
        </Button>
      </div>
      {note && <p className="mt-1.5 text-xs text-lightGrey">{note}</p>}
      {moduleChoice}
      {prerequisites?.unmet.map((course, index) => (
        <p key={`unmet:${index}:${course}`} className="mt-1.5 text-xs text-warn">
          ⚠ {t('addCourse.unmet', { course })}
        </p>
      ))}
      {prerequisites?.plannedOnly.map(({ label, periodName }, index) => (
        <p key={`planned:${index}:${label}`} className="mt-1.5 text-xs text-lightGrey">
          {t('addCourse.plannedOnly', { course: label, period: periodName })}
        </p>
      ))}
    </li>
  );
};
