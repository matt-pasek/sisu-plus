import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';

interface TimelineWarningChipProps {
  warnings: TimelineValidationWarning[];
  onDismiss?: (warningId: string) => void;
}

const WarningIcon: React.FC = () => (
  <svg aria-hidden="true" className="size-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path
      clipRule="evenodd"
      d="M8.485 2.495a1.75 1.75 0 0 1 3.03 0l6.28 10.875A1.75 1.75 0 0 1 16.28 16H3.72a1.75 1.75 0 0 1-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      fillRule="evenodd"
    />
  </svg>
);

export const TimelineWarningChip: React.FC<TimelineWarningChipProps> = ({ warnings, onDismiss }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const tooltipId = useId();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const primaryWarning = warnings[0];
  if (primaryWarning == null) return null;

  const warningMessage = warnings.map((warning) => warning.message).join(' ');
  const warningLabel =
    warnings.length > 1
      ? t('course.warningCount', { count: warnings.length })
      : t(primaryWarning.type === 'prerequisite' ? 'course.prerequisiteWarning' : 'course.periodWarning');
  const canDismissPrerequisite = primaryWarning.type === 'prerequisite' && onDismiss != null;
  const hideTooltip = () => setTooltipVisible(false);
  const showTooltip = () => setTooltipVisible(true);

  return (
    <span
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hideTooltip();
      }}
      onFocus={showTooltip}
      onPointerEnter={showTooltip}
      onPointerLeave={hideTooltip}
    >
      <button
        aria-describedby={tooltipId}
        aria-expanded={tooltipVisible}
        aria-label={`${warningLabel}: ${warningMessage}`}
        className="flex min-h-5 max-w-20 items-center gap-1 rounded-md border border-amber-300/35 bg-amber-300/10 px-1.5 text-[10px] leading-none font-semibold text-amber-100 transition-[background-color,border-color,transform] duration-150 hover:border-amber-200/60 hover:bg-amber-300/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200/70 active:scale-[0.96]"
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <WarningIcon />
        <span className="truncate">{warningLabel}</span>
      </button>
      <AnimatePresence initial={false}>
        {tooltipVisible && (
          <motion.span
            key="warning-tooltip"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            className="absolute right-0 bottom-full z-50 mb-2 w-72 rounded-lg border border-amber-300/35 bg-[#2b2619] p-3 text-left text-amber-50 shadow-[0_14px_34px_rgba(0,0,0,0.38)]"
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 3, filter: 'blur(2px)' }}
            id={tooltipId}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 3, filter: 'blur(2px)' }}
            role="tooltip"
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-200">
                <WarningIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs leading-snug font-semibold text-amber-50">{warningMessage}</span>
                {canDismissPrerequisite && (
                  <button
                    className="mt-2 rounded-md border border-amber-200/30 bg-amber-200/10 px-2 py-1 text-[11px] leading-none font-semibold text-amber-50 transition-[background-color,border-color,transform] duration-150 hover:border-amber-100/50 hover:bg-amber-200/20 active:scale-[0.96]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDismiss(primaryWarning.id);
                      hideTooltip();
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    type="button"
                  >
                    {t('course.dismissPrerequisite')}
                  </button>
                )}
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
