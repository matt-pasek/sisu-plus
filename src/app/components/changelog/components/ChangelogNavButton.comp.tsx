import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface Props {
  direction: 'previous' | 'next';
  label: string;
  onClick: () => void;
}

export const ChangelogNavButton: React.FC<Props> = ({ direction, label, onClick }) => (
  <button
    type="button"
    className={`absolute top-1/2 z-6 grid size-[max(28px,3cqw)] -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-white/8 text-[rgba(243,243,255,0.65)] transition-colors hover:bg-white/18 hover:text-white [&_svg]:size-[42%] ${
      direction === 'previous' ? 'left-[1.4cqw]' : 'right-[1.4cqw]'
    }`}
    aria-label={label}
    onClick={onClick}
  >
    {direction === 'previous' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
  </button>
);
