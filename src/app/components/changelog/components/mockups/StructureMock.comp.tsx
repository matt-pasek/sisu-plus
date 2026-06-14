import { motion } from 'motion/react';
import React from 'react';

interface Props {
  accent: string;
}

export const StructureMock: React.FC<Props> = ({ accent }) => (
  <div className="flex flex-col gap-[1cqw]">
    {[
      ['Core', '78%'],
      ['Major', '62%'],
      ['Electives', '46%'],
      ['Language', '88%'],
    ].map(([label, width]) => (
      <div className="flex items-center gap-[1cqw]" key={label}>
        <span className="w-[8.5cqw] shrink-0 text-[clamp(11px,1.15cqw,13px)] text-[rgba(243,243,255,0.64)]">
          {label}
        </span>
        <div className="h-[max(7px,0.9cqw)] flex-1 overflow-hidden rounded-full bg-white/8">
          <motion.i
            className="block h-full rounded-full"
            style={{ backgroundColor: accent }}
            initial={{ width: 0 }}
            animate={{ width }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7, delay: 0.1 }}
          />
        </div>
      </div>
    ))}
  </div>
);
