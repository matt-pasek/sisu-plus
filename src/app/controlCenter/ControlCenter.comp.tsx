import { useState } from 'react';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import CircularText from '@/app/components/CircularText.comp';
import { motion, AnimatePresence } from 'motion/react';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-white/5 p-0 transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.96] ${
        checked ? 'bg-accent/90 shadow-[0_0_18px_rgba(65,150,72,0.28)]' : 'bg-border2'
      }`}
      type="button"
    >
      <span
        className={`absolute top-1 block size-5 rounded-full transition-[left,background-color,box-shadow] duration-200 ${
          checked ? 'left-6 bg-background shadow-[0_2px_8px_rgba(0,0,0,0.35)]' : 'left-1 bg-lightGrey/70'
        }`}
      />
    </button>
  );
}

function SparkleIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function isValidMoodleUrl(value: string): boolean {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.hostname.includes('moodle') && url.pathname.includes('calendar');
  } catch {
    return false;
  }
}

interface ControlTip {
  title: string;
  body: string;
  accentClass: string;
}

function getControlTip(isActive: boolean, pathname: string): ControlTip {
  if (!isActive) {
    return {
      title: 'Ready when you are',
      body: 'SISU+ stays dormant while paused, letting you interact with the native Sisu interface as usual.',
      accentClass: 'text-warn bg-warn/15 shadow-[inset_0_0_0_1px_rgba(246,185,86,0.18)]',
    };
  }

  if (pathname.startsWith('/student/plan')) {
    return {
      title: 'Planning made easy',
      body: 'SISU+ keeps track of prerequisites and planned teaching periods.',
      accentClass: 'text-blue-300 bg-blue-400/15 shadow-[inset_0_0_0_1px_rgba(102,142,255,0.18)]',
    };
  }

  return {
    title: 'Make it your own',
    body: 'Dashboard widgets can be resized from their edges in edit mode.',
    accentClass: 'text-accent bg-accent/15 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]',
  };
}

export function ControlCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefs, setPrefs] = useChromeStorage();
  const isActive = prefs.sisuPlusActive;
  const moodleToken = prefs.moodleToken ?? '';
  const validMoodleUrl = isValidMoodleUrl(moodleToken);
  const size = isActive ? 80 : 52;
  const openWidth = isActive ? 360 : 340;
  const openHeight = isActive ? 390 : 326;
  const hoverWidth = isActive ? 382 : 318;
  const controlTip = getControlTip(isActive, window.location.pathname);

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-30 overflow-hidden bg-background text-offwhite shadow-[0_24px_60px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.08)]"
      style={{ fontFamily: 'var(--font-sans)', colorScheme: 'dark' }}
      animate={{
        width: isOpen ? openWidth : isHovered ? hoverWidth : size,
        height: isOpen ? openHeight : size,
        borderRadius: isOpen ? 22 : isHovered ? 28 : size,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.48 }}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 6, filter: 'blur(4px)', transition: { duration: 0.16 } }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className={`absolute inset-0 flex flex-col p-5 ${isActive ? 'gap-4 pb-20' : 'gap-3 pb-18'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-sm font-semibold tracking-wide text-offwhite/80 uppercase">SISU+</span>
                <p className="mt-1 text-xs leading-relaxed text-lightGrey">
                  {isActive
                    ? 'A quiet layer for planning, deadlines, and study pace.'
                    : 'Paused. Native Sisu is visible behind this control.'}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isActive ? 'bg-accent/15 text-accent' : 'bg-warn/15 text-warn'
                }`}
              >
                {isActive ? 'Active' : 'Paused'}
              </span>
            </div>

            <div className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-offwhite">Activate SISU+</p>
                  <p className="mt-0.5 text-xs text-lightGrey">
                    {isActive ? 'Replace the native student pages.' : 'Switch back to the enhanced dashboard.'}
                  </p>
                </div>
                <Toggle checked={prefs.sisuPlusActive} onChange={(val) => setPrefs({ sisuPlusActive: val })} />
              </div>
            </div>

            {!isActive && (
              <div className="rounded-2xl bg-warn/10 p-3 text-xs leading-relaxed text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.16)]">
                Paused mode keeps this control isolated while Sisu handles the page.
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs font-semibold tracking-wide text-lightGrey uppercase"
                  htmlFor="sisu-plus-moodle-url"
                >
                  Moodle Sync
                </label>
                <span className={`text-[11px] font-medium ${validMoodleUrl ? 'text-accent' : 'text-danger'}`}>
                  {validMoodleUrl ? 'Calendar URL' : 'Check URL'}
                </span>
              </div>
              <div
                className={`rounded-2xl bg-container2 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[box-shadow] duration-200 ${
                  validMoodleUrl
                    ? 'focus-within:shadow-[inset_0_0_0_1px_rgba(65,150,72,0.65)]'
                    : 'shadow-[inset_0_0_0_1px_rgba(240,107,107,0.45)]'
                }`}
              >
                <input
                  id="sisu-plus-moodle-url"
                  value={moodleToken}
                  onChange={(event) => setPrefs({ moodleToken: event.target.value })}
                  placeholder="https://moodle.lut.fi/calendar/export_execute.php?..."
                  spellCheck={false}
                  className="block h-10 w-full border-0 bg-transparent p-0 font-mono text-sm text-offwhite outline-none placeholder:text-lightGrey/55"
                />
              </div>
              <p className="text-xs leading-relaxed text-lightGrey">
                {isActive
                  ? 'Paste Moodle’s exported calendar link once. SISU+ uses it only for deadline widgets.'
                  : 'This stays saved while SISU+ is paused.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute right-0 bottom-0 z-10 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close-text"
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(4px)', transition: { duration: 0.12 } }}
              className="flex flex-col items-end pr-3 font-mono text-xs font-medium whitespace-nowrap text-lightGrey"
            >
              <span>SISU+ v{import.meta.env.VITE_APP_VERSION} made with love</span>
              <p>
                by{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="https://matt-pasek.dev"
                  target="_blank"
                >
                  matt-pasek
                </a>{' '}
                ·{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="mailto:contact@matt-pasek.dev"
                >
                  contact
                </a>
              </p>
            </motion.div>
          ) : isHovered ? (
            <motion.div
              key="tip-text"
              initial={{ opacity: 0, x: 18, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                x: 10,
                scale: 0.98,
                filter: 'blur(4px)',
                transition: { duration: 0.12 },
              }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className={`mr-1 text-left backdrop-blur-md ${
                isActive
                  ? 'w-[276px] rounded-3xl p-3 shadow-[0_14px_38px_rgba(0,0,0,0.32),inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                  : 'w-[242px] rounded-2xl bg-background/92 py-2 pr-1 pl-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.24),0_0_0_1px_rgba(13,13,17,0.12),inset_0_0_0_1px_rgba(255,255,255,0.07)]'
              }`}
            >
              <div className={`flex ${isActive ? 'gap-3' : 'gap-2.5'}`}>
                <span
                  className={`flex shrink-0 items-center justify-center ${isActive ? 'size-9 rounded-2xl' : 'size-7 rounded-xl'} ${controlTip.accentClass}`}
                >
                  <SparkleIcon className={isActive ? 'size-5' : 'size-3.5'} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-wide text-offwhite/80 uppercase">
                    {controlTip.title}
                  </p>
                  <p className="text-xs leading-relaxed text-pretty text-lightGrey">{controlTip.body}</p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          aria-label={isOpen ? 'Close SISU+ controls' : 'Open SISU+ controls'}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex cursor-pointer items-center justify-center rounded-full text-offwhite transition-[transform,opacity] duration-200 active:scale-[0.96] ${
            isActive ? 'h-20 w-20 p-2' : 'h-[52px] w-[52px] p-1'
          }`}
          type="button"
        >
          {isActive ? (
            <CircularText text="SISU PLUS * CONTROLS * " onHover="slowDown" spinDuration={20} />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-full bg-container2 text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.22)]">
              <SparkleIcon className="size-6" />
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
