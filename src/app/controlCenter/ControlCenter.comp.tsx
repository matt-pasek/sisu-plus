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
      style={{
        width: '34px',
        height: '19px',
        borderRadius: '10px',
        border: 'none',
        background: checked ? '#00e5a0' : '#21262d',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.15s ease',
        padding: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '17px' : '3px',
          width: '13px',
          height: '13px',
          borderRadius: '50%',
          background: checked ? '#0d1117' : '#484f58',
          transition: 'left 0.15s ease, background 0.15s ease',
          display: 'block',
        }}
      />
    </button>
  );
}

export function ControlCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefs, setPrefs] = useChromeStorage();

  const size = prefs.sisuPlusActive ? 80 : 56;

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-50 overflow-hidden bg-[#0d0d11] text-white shadow-2xl"
      animate={{
        width: isOpen || isHovered ? 320 : size,
        height: isOpen ? 300 : size,
        borderRadius: isOpen ? 12 : size,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ delay: 0.15 }}
            className="absolute right-0 bottom-0 flex h-[300px] w-[320px] flex-col gap-3 p-4 pb-24"
          >
            <span className="text-sm font-semibold tracking-wide text-offwhite/70 uppercase">Sisu+</span>

            <div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-container/70 p-3">
                  <p className="text-sm">Activate SISU+</p>
                  <Toggle checked={prefs.sisuPlusActive} onChange={(val) => setPrefs({ sisuPlusActive: val })} />
                </div>
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="flex flex-col gap-2">
                <p className="text-xs text-offwhite/50 uppercase">Moodle Sync</p>
                <input
                  value={prefs.moodleToken ?? ''}
                  onChange={(val) => setPrefs({ moodleToken: val.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute right-0 bottom-0 z-10 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, transition: { duration: 0.1 } }}
              className="flex flex-col items-end pr-2 font-mono text-xs font-medium whitespace-nowrap text-offwhite/60"
            >
              <span>SISU+ v{import.meta.env.VITE_APP_VERSION} made with love</span>
              <p>
                by:{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="https://matt-pasek.dev"
                  target="_blank"
                >
                  matt-pasek
                </a>{' '}
                |{' '}
                <a
                  className="text-offwhite/75 transition-colors duration-200 hover:text-offwhite"
                  href="mailto:contact@matt-pasek.dev"
                >
                  contact
                </a>
              </p>
            </motion.div>
          ) : isHovered ? (
            <motion.span
              key="tip-text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, transition: { duration: 0.1 } }}
              className="pr-2 text-sm font-medium whitespace-nowrap text-white/60"
            >
              Some nice tip about the app
            </motion.span>
          ) : null}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-20 w-20 cursor-pointer items-center justify-center p-2"
        >
          {prefs.sisuPlusActive ? (
            <CircularText text="SISU PLUS * CONTROLS * " onHover="slowDown" spinDuration={20} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-9">
              <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}
