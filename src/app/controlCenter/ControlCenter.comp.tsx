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
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [prefs, setPrefs] = useChromeStorage();

  return (
    <motion.div
      className="fixed right-4 bottom-4 z-50 overflow-hidden bg-[#0B0519] text-white shadow-2xl"
      animate={{
        width: isOpen || isHovered ? 320 : 80,
        height: isOpen ? 300 : 80,
        borderRadius: isOpen ? 12 : 80,
      }}
      transition={{ type: 'spring', bounce: 0.1, duration: 0.6 }}
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
                <p className="font-mono text-xs text-offwhite/20">Coming soon</p>
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
          <CircularText text="SISU PLUS * CONTROLS * " onHover="slowDown" spinDuration={20} />
        </button>
      </div>
    </motion.div>
  );
}
