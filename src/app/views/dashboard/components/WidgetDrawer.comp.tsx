import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { DashboardWidgetId, DashboardWidgetLayout } from '@/app/views/dashboard/types';
import { findOpenDashboardSlot, getHiddenWidgets } from '@/app/views/dashboard/util';
import { WidgetIcon } from '@/app/views/dashboard/components/widget/WidgetIcon.comp';
import { EmptyWidgetState } from '@/app/views/dashboard/components/widget/EmptyWidgetState.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { WIDGET_META } from '@/app/views/dashboard/constants/WidgetMeta.const';

const drawerContentVariants = {
  hidden: { opacity: 0, transition: { duration: 0.08 } },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, delay: 0.14, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
};

const widgetListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
};

const widgetItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 420, damping: 38 } },
};

interface Props {
  isEditMode: boolean;
  shouldReduceMotion: boolean | null;
  setIsEditMode: (isEditMode: boolean) => void;
  layout: DashboardWidgetLayout[];
  setLayout: React.Dispatch<React.SetStateAction<DashboardWidgetLayout[]>>;
}

export const WidgetDrawer: React.FC<Props> = ({ isEditMode, shouldReduceMotion, setIsEditMode, layout, setLayout }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);

  const addWidget = (id: DashboardWidgetId) => {
    setLayout((current) => {
      const openSlot = findOpenDashboardSlot(current, id);
      return openSlot ? [...current, openSlot] : current;
    });
  };

  const hiddenWidgets = getHiddenWidgets(layout);

  return (
    <AnimatePresence initial={false}>
      {isEditMode && (
        <motion.aside
          animate={{ x: 0, opacity: 1, width: isLibraryCollapsed ? 40 : 320 }}
          className="fixed top-0 right-0 z-40 flex h-dvh flex-col border-l border-border bg-container shadow-[-18px_0_40px_rgba(0,0,0,0.28)]"
          exit={{ x: 28, opacity: 0 }}
          initial={{ x: 28, opacity: 0, width: isLibraryCollapsed ? 40 : 320 }}
          transition={{
            x: { type: 'spring', duration: 0.34, bounce: 0 },
            opacity: { duration: 0.2 },
            width: shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 },
          }}
        >
          <motion.button
            aria-label={isLibraryCollapsed ? 'Expand widget library' : 'Collapse widget library'}
            className="absolute top-1/2 -left-3 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-container2 text-lightGrey shadow-md hover:bg-offwhite/10 hover:text-offwhite"
            onClick={() => setIsLibraryCollapsed((v) => !v)}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            type="button"
            whileTap={{ scale: 0.88 }}
          >
            <motion.svg
              animate={{ rotate: isLibraryCollapsed ? 180 : 0 }}
              aria-hidden="true"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth={2.5}
              transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 35 }}
              viewBox="0 0 24 24"
            >
              <path d="M9 18l6-6-6-6" />
            </motion.svg>
          </motion.button>

          <div className="flex flex-1 flex-col overflow-hidden">
            <AnimatePresence>
              {!isLibraryCollapsed && (
                <motion.div
                  animate="visible"
                  className="flex flex-1 flex-col gap-5 overflow-hidden px-4 pt-16 pb-5"
                  exit="hidden"
                  initial="hidden"
                  variants={drawerContentVariants}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-offwhite">{t('editor.libraryTitle')}</h2>
                      <p className="mt-1 text-sm text-lightGrey">{t('editor.libraryDescription')}</p>
                    </div>
                    <button
                      aria-label={t('widgets.actions.closeEditor')}
                      className="flex size-10 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                      onClick={() => {
                        setIsEditMode(false);
                        setIsLibraryCollapsed(false);
                      }}
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <motion.div
                    animate="visible"
                    className="flex flex-col gap-2.5 overflow-y-auto pr-1"
                    initial="hidden"
                    variants={widgetListVariants}
                  >
                    {hiddenWidgets.map((widget) => {
                      const openSlot = findOpenDashboardSlot(layout, widget.id);
                      const meta = WIDGET_META[widget.id];
                      const widgetTitle = t(
                        `widgets.titles.${widget.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`,
                      );
                      return (
                        <motion.button
                          key={widget.id}
                          className={`group rounded-xl p-3 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-[background-color,box-shadow] duration-200 ${
                            openSlot
                              ? 'cursor-pointer bg-container2 hover:bg-offwhite/10 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                              : 'cursor-not-allowed bg-container2/50 opacity-50'
                          }`}
                          disabled={!openSlot}
                          onClick={() => addWidget(widget.id)}
                          type="button"
                          variants={widgetItemVariants}
                          whileTap={openSlot ? { scale: 0.97 } : undefined}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <WidgetIcon name={meta.icon} />
                              <div className="min-w-0">
                                <p className="font-mono text-[9px] font-semibold tracking-widest text-lightGrey uppercase">
                                  {t(`widgets.eyebrows.${meta.eyebrowKey}`)}
                                </p>
                                <p className="text-sm leading-snug font-semibold text-offwhite">{widgetTitle}</p>
                              </div>
                            </div>
                            <span className="flex-none rounded-full bg-background px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-lightGrey">
                              {openSlot ? `${widget.size.w}×${widget.size.h}` : t('widgets.actions.noSpace')}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-lightGrey">
                            {t(
                              `widgets.descriptions.${widget.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`,
                            )}
                          </p>
                        </motion.button>
                      );
                    })}
                    {hiddenWidgets.length === 0 && <EmptyWidgetState label={t('editor.emptyLibrary')} />}
                  </motion.div>

                  <div className="mt-auto rounded-xl bg-background/70 p-3 text-xs leading-relaxed text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    {t('editor.footerHint')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
