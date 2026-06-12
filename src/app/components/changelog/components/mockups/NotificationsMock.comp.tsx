import { motion } from 'motion/react';
import React from 'react';

interface Props {
  accent: string;
}

export const NotificationsMock: React.FC<Props> = ({ accent }) => (
  <div className="flex flex-col gap-[0.8cqw]">
    {[
      { label: 'Registration opens', sub: 'Databases IIL — in 2 days', dot: accent },
      { label: 'Deadline reminder', sub: 'Course withdrawal — tomorrow', dot: '#f0a84e' },
      { label: 'Plan updated', sub: 'New version available for CS101', dot: '#5b8df6' },
    ].map(({ label, sub, dot }, i) => (
      <motion.div
        key={label}
        className="flex items-start gap-[0.9cqw] rounded-[10px] bg-white/4.5 p-[0.9cqw_1.1cqw] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay: i * 0.08 }}
      >
        <span
          className="mt-[0.35cqw] size-[max(7px,0.8cqw)] shrink-0 rounded-full"
          style={{ backgroundColor: dot, boxShadow: `0 0 8px ${dot}` }}
        />
        <div className="flex min-w-0 flex-col gap-[0.2cqw]">
          <span className="text-[clamp(11px,1.18cqw,13px)] font-medium text-offwhite">{label}</span>
          <span className="text-[clamp(10px,1.05cqw,12px)] text-[rgba(243,243,255,0.5)]">{sub}</span>
        </div>
      </motion.div>
    ))}
  </div>
);
