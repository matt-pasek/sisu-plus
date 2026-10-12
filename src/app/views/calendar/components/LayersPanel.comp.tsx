import React from 'react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { LayerControls } from '../types';
import { LayerProblem } from './LayerProblem.comp';
import { LayerSwitch } from './LayerSwitch.comp';

interface Props {
  layers: LayerControls;
}

export const LayersPanel: React.FC<Props> = ({ layers }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <Panel className="shrink-0" header={<PanelEyebrow>{t('sidebar.layers')}</PanelEyebrow>}>
      <div className="px-4 py-2">
        <LayerSwitch
          label={t('notes.layer')}
          checked={layers.showNotes}
          onChange={(value) => layers.onChange({ calendarShowNotes: value })}
        />
        {layers.notesFailed && (
          <LayerProblem text={t('notes.unavailable')} retryLabel={t('notes.retry')} onRetry={layers.onRetryNotes} />
        )}
        {layers.deadlineStatus === 'missingToken' ? (
          <div className="flex flex-col gap-1 py-1.5">
            <button
              type="button"
              onClick={layers.onConnectMoodle}
              className="w-fit cursor-pointer text-[13px] font-medium text-lighterGreen underline-offset-2 hover:underline"
            >
              {t('deadlines.connect')}
            </button>
            <p className="text-[11.5px] leading-snug text-lightGrey">{t('deadlines.connectHint')}</p>
          </div>
        ) : (
          <>
            <LayerSwitch
              label={t('deadlines.layer')}
              checked={layers.showDeadlines}
              onChange={(value) => layers.onChange({ calendarShowDeadlines: value })}
            />
            {layers.deadlineStatus === 'failed' && (
              <LayerProblem
                text={t('deadlines.unavailable')}
                retryLabel={t('deadlines.retry')}
                onRetry={layers.onRetryDeadlines}
              />
            )}
          </>
        )}
        <LayerSwitch
          label={t('sidebar.cancelled')}
          checked={layers.showCancelled}
          onChange={(value) => layers.onChange({ calendarShowCancelled: value })}
        />
      </div>
    </Panel>
  );
};
