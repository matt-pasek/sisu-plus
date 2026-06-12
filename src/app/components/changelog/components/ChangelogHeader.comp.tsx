import React from 'react';
import { CloseIcon } from './icons';

interface Props {
  closeLabel: string;
  version: string;
  whatsNewLabel: string;
  onClose: () => void;
}

export const ChangelogHeader: React.FC<Props> = ({ closeLabel, version, whatsNewLabel, onClose }) => (
  <header className="absolute top-0 right-0 left-0 z-7 flex h-[min(8.5cqw,64px)] items-center justify-between px-[2.5cqw]">
    <span className="inline-flex items-center gap-[1cqw] font-mono text-[clamp(10px,1.25cqw,13px)] font-semibold tracking-[0.12em] whitespace-nowrap text-[rgba(243,243,255,0.76)] uppercase">
      <strong className="grid size-[max(20px,2.4cqw)] place-items-center rounded-[7px] bg-linear-[155deg,var(--color-lighterGreen),var(--color-accent)] font-sans text-[clamp(10px,1.15cqw,13px)] font-extrabold tracking-normal text-[#06180f]">
        S+
      </strong>
      {whatsNewLabel} &middot; {version}
    </span>
    <button
      type="button"
      className="grid size-[max(30px,3.4cqw)] cursor-pointer place-items-center rounded-[10px] border-0 bg-white/8 text-[rgba(243,243,255,0.9)] hover:bg-white/18 hover:text-white [&_svg]:size-[42%]"
      aria-label={closeLabel}
      onClick={onClose}
    >
      <CloseIcon />
    </button>
  </header>
);
