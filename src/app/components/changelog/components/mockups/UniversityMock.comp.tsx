import { motion } from 'motion/react';
import React from 'react';
import { CheckMarkIcon } from '../icons';

interface Props {
  accent: string;
  allOtherLabel: string;
}

export const UniversityMock: React.FC<Props> = ({ accent, allOtherLabel }) => (
  <div className="flex flex-col gap-[0.75cqw]">
    {['Aalto University', 'University of Helsinki', 'LUT University', 'University of Jyväskylä'].map((name) => (
      <motion.div
        key={name}
        className="flex items-center gap-[0.9cqw] rounded-[10px] bg-white/4.5 p-[0.7cqw_1.1cqw] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
      >
        <span
          className="grid size-[max(14px,1.5cqw)] shrink-0 place-items-center rounded-sm text-[#06140d] [&_svg]:size-[72%]"
          style={{ backgroundColor: accent }}
        >
          <CheckMarkIcon />
        </span>
        <span className="text-[clamp(11px,1.15cqw,13px)] text-offwhite">{name}</span>
      </motion.div>
    ))}
    <p className="mt-[0.4cqw] pl-[0.3cqw] text-[clamp(10px,1.05cqw,12px)]" style={{ color: accent }}>
      {allOtherLabel}
    </p>
  </div>
);
