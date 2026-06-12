import { motion } from 'motion/react';
import React from 'react';
import { getAccentWash } from '../../util';

interface Props {
  accent: string;
}

export const RegistrationMock: React.FC<Props> = ({ accent }) => (
  <div className="flex flex-col gap-[0.8cqw]">
    {[
      { name: 'Databases II', status: 'Open', color: accent },
      { name: 'Algorithms', status: 'Enrolled', color: '#34c7a9' },
      { name: 'OS Design', status: 'Open', color: accent },
    ].map(({ name, status, color }, i) => (
      <motion.div
        key={name}
        className="flex items-center gap-[1cqw] rounded-[10px] bg-white/4.5 p-[0.8cqw_1.1cqw] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45, delay: i * 0.07 }}
      >
        <span className="min-w-0 flex-1 overflow-hidden text-[clamp(11px,1.18cqw,13px)] text-ellipsis whitespace-nowrap text-offwhite">
          {name}
        </span>
        <span
          className="shrink-0 rounded-full px-[0.9cqw] py-[0.3cqw] font-mono text-[clamp(9px,1cqw,11px)] font-semibold"
          style={{ backgroundColor: getAccentWash(color, 0.16), color }}
        >
          {status}
        </span>
      </motion.div>
    ))}
  </div>
);
