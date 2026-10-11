import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { PopoverModel } from '../types';
import { ListIcon } from './icons';

const BUTTON_CLASS = 'min-h-8 px-2.5';

interface Props {
  model: PopoverModel;
}

export const PopoverActions: React.FC<Props> = ({ model }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const { status, badge, handlers, groupMenu, groupName, canGoInstead, canSwapWeek } = model;
  const isAlternative = status === 'alternative';
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
      <Button
        variant="onSurface"
        className={BUTTON_CLASS}
        onClick={handlers.onShowAllSessions}
        icon={<ListIcon className="size-3.5" />}
      >
        {t('actions.allSessions')}
      </Button>
      {isAlternative && canGoInstead && (
        <Button variant="accent" className={BUTTON_CLASS} onClick={handlers.onGoInstead}>
          {t('actions.goInstead')}
        </Button>
      )}
      {isAlternative && canSwapWeek && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onSwapWeek}>
          {t('actions.swapWeek')}
        </Button>
      )}
      {isAlternative && groupName && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onMakeUsual}>
          {t('actions.makeUsual', { group: groupName })}
        </Button>
      )}
      {(badge === 'swapped' || badge === 'swapUnavailable') && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onUndoSwap}>
          {t('actions.undoSwap')}
        </Button>
      )}
      {status === 'skipped' && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onUndoSkip}>
          {t('actions.undoSkip')}
        </Button>
      )}
      {groupMenu === 'switch' && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onSwitchGroup}>
          {t('actions.switchGroup')}
        </Button>
      )}
      {groupMenu === 'hide' && (
        <Button variant="onSurface" className={BUTTON_CLASS} onClick={handlers.onHideGroup}>
          {t('actions.hideGroup')}
        </Button>
      )}
    </div>
  );
};
