import React, { useEffect, useId, useRef } from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { CloseIcon } from '@/app/components/ui/icons/CloseIcon.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermTitle } from '@/app/helpers/getSemesterTitle';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  period: PeriodCreditSummary;
  onClose: () => void;
  children: React.ReactNode;
}

export const AddCourseInspector: React.FC<Props> = ({ period, onClose, children }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="grid min-h-0 grid-rows-[minmax(0,1fr)] outline-none"
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        onClose();
      }}
    >
      <Panel
        header={
          <>
            <div className="min-w-0">
              <PanelEyebrow>{t('addCourse.eyebrow')}</PanelEyebrow>
              <p id={titleId} className="truncate text-sm font-semibold text-offwhite">
                {t('addCourse.title', { period: period.period.name, term: getTermTitle(period.period) })}
              </p>
              <p className="truncate text-xs text-lightGrey">
                {t('addCourse.planned', { credits: formatCredits(period.plannedCredits + period.completedCredits) })}
              </p>
            </div>
            <button
              type="button"
              aria-label={t('addCourse.close')}
              onClick={onClose}
              className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
            >
              <CloseIcon />
            </button>
          </>
        }
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">{children}</div>
      </Panel>
    </div>
  );
};
