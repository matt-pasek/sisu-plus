import React from 'react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { LayerSwitch } from './LayerSwitch.comp';

interface Props {
  showCancelled: boolean;
  onShowCancelledChange: (value: boolean) => void;
}

export const LayersPanel: React.FC<Props> = ({ showCancelled, onShowCancelledChange }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <Panel className="shrink-0" header={<PanelEyebrow>{t('sidebar.layers')}</PanelEyebrow>}>
      <div className="px-4 py-2">
        <LayerSwitch label={t('sidebar.cancelled')} checked={showCancelled} onChange={onShowCancelledChange} />
      </div>
    </Panel>
  );
};
