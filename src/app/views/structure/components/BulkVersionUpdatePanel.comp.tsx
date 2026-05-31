import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useBulkVersionUpdates } from '@/app/views/structure/hooks/useBulkVersionUpdates';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { SectionData } from '@/app/views/structure/structureTypes';

interface Props {
  plan: Plan;
  sections: SectionData[];
  onOpen: () => void;
}

export const BulkVersionUpdatePanel: React.FC<Props> = ({ plan, sections, onOpen }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const { updates, isLoading } = useBulkVersionUpdates(plan, sections);

  return (
    <div className="rounded-[10px] border border-border bg-container px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[14px] font-semibold text-offwhite">{t('bulkUpdate.panelTitle')}</h2>
            <span className="rounded-[6px] border border-border2 bg-container2 px-2 py-1 text-[11px] font-semibold text-lighterGreen">
              {isLoading ? t('bulkUpdate.checking') : t('bulkUpdate.counter', { count: updates.length })}
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-[12.5px] leading-[1.55] text-lightGrey">
            {t('bulkUpdate.panelDescription')}
          </p>
        </div>
        <Button variant="accent" disabled={isLoading || updates.length === 0} onClick={onOpen}>
          {t('bulkUpdate.button')}
        </Button>
      </div>
    </div>
  );
};
