import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Transition } from 'motion/react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColor } from '@/app/theme/moduleColors';

interface Props {
  moduleIds: string[];
  moduleNames: string[];
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  onConfirm?: () => void;
  onReset?: () => void;
  pendingChangesCount?: number;
  resetDisabled?: boolean;
  validationIssueCount?: number;
}

const TIMELINE_EASE = [0.22, 1, 0.36, 1] as const;

export const TimelineToolbar: React.FC<Props> = ({
  moduleIds,
  moduleNames,
  confirmDisabled = true,
  confirmPending = false,
  onConfirm,
  onReset,
  pendingChangesCount = 0,
  resetDisabled = true,
  validationIssueCount = 0,
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
    <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-solid border-border bg-container px-6 shadow-[0_1px_0_rgba(255,255,255,0.03)]">
      <div className="ml-2 flex min-w-0 items-center gap-5">
        {moduleNames.slice(0, 6).map((name, index) => (
          <div
            key={name}
            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-lightGrey transition-opacity duration-200"
          >
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: getModuleColor(moduleIds[index]) }}
            />
            <span className="max-w-fit truncate">{name}</span>
          </div>
        ))}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <AnimatePresence initial={false}>
          {pendingChangesCount > 0 && (
            <motion.div
              key="pending-changes"
              {...chipMotion}
              className="flex min-h-8 items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 text-xs font-semibold text-accent tabular-nums"
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
              className="flex min-h-8 items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 text-xs font-semibold text-amber-100 tabular-nums"
            >
              <span className="size-1.5 rounded-full bg-amber-300" />
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
    </header>
  );
};
