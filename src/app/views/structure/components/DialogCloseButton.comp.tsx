import React from 'react';

interface Props {
  label: string;
  onClose: () => void;
}

export const DialogCloseButton: React.FC<Props> = ({ label, onClose }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClose}
    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
  >
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  </button>
);
