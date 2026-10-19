import React from 'react';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SessionChip } from '../types';
import { WarningIcon } from './icons';

interface Props {
  chip: SessionChip;
}

export const SessionChipBadge: React.FC<Props> = ({ chip }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  switch (chip.type) {
    case 'clash':
      return (
        <StatusChip tone="warn" icon={<WarningIcon className="size-2.5" />}>
          {t('sessions.chips.clash')}
        </StatusChip>
      );
    case 'partialClash':
      return (
        <StatusChip tone="warn" icon={<WarningIcon className="size-2.5" />}>
          {t('sessions.chips.partialClash', { minutes: chip.minutes })}
        </StatusChip>
      );
    case 'roomChanged':
      return <StatusChip tone="info">{t('sessions.chips.roomChanged')}</StatusChip>;
    case 'cancelled':
      return <StatusChip tone="neutral">{t('sessions.chips.cancelled')}</StatusChip>;
    case 'swapped':
      return <StatusChip tone="info">{t('sessions.chips.swapped')}</StatusChip>;
    case 'skipping':
      return <StatusChip tone="neutral">{t('sessions.chips.skipping')}</StatusChip>;
    case 'swapUnavailable':
      return <StatusChip tone="warn">{t('sessions.chips.swapUnavailable')}</StatusChip>;
  }
};
