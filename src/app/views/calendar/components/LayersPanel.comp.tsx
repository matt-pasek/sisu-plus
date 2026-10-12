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
        <LayerSwitch
          label={t('sidebar.cancelled')}
          checked={layers.showCancelled}
          onChange={(value) => layers.onChange({ calendarShowCancelled: value })}
        />
      </div>
    </Panel>
  );
};
