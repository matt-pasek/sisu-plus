import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Transition } from 'motion/react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  pendingChangesCount: number;
  validationIssueCount: number;
  confirmDisabled: boolean;
  confirmPending: boolean;
  resetDisabled: boolean;
  onConfirm: () => void;
  onReset: () => void;
}

const TIMELINE_EASE = [0.22, 1, 0.36, 1] as const;

export const TimelineHeaderActions: React.FC<Props> = ({
  pendingChangesCount,
  validationIssueCount,
  confirmDisabled,
  confirmPending,
  resetDisabled,
  onConfirm,
  onReset,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const chipTransition: Transition = { duration: shouldReduceMotion ? 0.01 : 0.18, ease: TIMELINE_EASE };
  const chipMotion = {
    animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -3, filter: 'blur(2px)' },
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -3, filter: 'blur(2px)' },
    transition: chipTransition,
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <AnimatePresence initial={false}>
        {pendingChangesCount > 0 && (
          <motion.div
            key="pending-changes"
            {...chipMotion}
            className="flex min-h-8 items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 text-xs font-semibold whitespace-nowrap text-accent tabular-nums"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            {t('toolbar.unsaved', { count: pendingChangesCount })}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {validationIssueCount > 0 && (
          <motion.div
            key="validation-issues"
            {...chipMotion}
            className="flex min-h-8 items-center gap-2 rounded-lg border border-warn/25 bg-warn/10 px-3 text-xs font-semibold whitespace-nowrap text-warn tabular-nums"
          >
            <span className="size-1.5 rounded-full bg-warn" />
            {t('toolbar.issue', { count: validationIssueCount })}
          </motion.div>
        )}
      </AnimatePresence>
      <Button disabled={confirmDisabled || confirmPending} variant="accent" onClick={onConfirm}>
        {confirmPending ? t('actions.confirming') : t('actions.confirm')}
      </Button>
      <Button
        ariaLabel={t('actions.reset')}
        className="min-w-10 px-2.5"
        disabled={resetDisabled || confirmPending}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
            <path
              fillRule="evenodd"
              d="M4.755 10.059a.75.75 0 0 1 .986.394 6.75 6.75 0 1 0 2.017-2.694h2.492a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 8.509v-4.5a.75.75 0 0 1 1.5 0v2.52a8.25 8.25 0 1 1-2.139 3.924.75.75 0 0 1 .394-.394Z"
              clipRule="evenodd"
            />
          </svg>
        }
        onClick={onReset}
        title={t('actions.reset')}
      />
    </div>
  );
};
