import { motion } from 'motion/react';
import React from 'react';

interface Props {
  accent: string;
}

export const DashboardMock: React.FC<Props> = ({ accent }) => (
  <div className="grid grid-cols-2 gap-[0.8cqw]">
    {[
      { label: 'Credits', value: '142', sub: '/ 180', color: accent },
      { label: 'This period', value: '12', sub: 'credits', color: '#34c7a9' },
      { label: 'Enrolments', value: '3', sub: 'open', color: '#f0a84e' },
      { label: 'Next exam', value: '4d', sub: 'away', color: '#5b8df6' },
    ].map(({ label, value, sub, color }, i) => (
      <motion.div
        key={label}
        className="rounded-xl bg-white/4.5 p-[1.1cqw] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay: i * 0.06 }}
      >
        <div className="font-mono text-[clamp(9px,0.95cqw,11px)] font-semibold tracking-[0.07em] text-[rgba(243,243,255,0.45)] uppercase">
          {label}
        </div>
        <div className="mt-[0.4cqw] flex items-baseline gap-[0.4cqw]">
          <span className="text-[clamp(18px,2.2cqw,26px)] leading-none font-bold" style={{ color }}>
            {value}
          </span>
          <span className="text-[clamp(10px,1.05cqw,12px)] text-[rgba(243,243,255,0.4)]">{sub}</span>
        </div>
      </motion.div>
    ))}
  </div>
);
