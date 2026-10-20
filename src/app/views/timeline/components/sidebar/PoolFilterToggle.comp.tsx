import React from 'react';

interface Props {
  pressed: boolean;
  label: string;
  description: string;
  onChange: (pressed: boolean) => void;
}

export const PoolFilterToggle: React.FC<Props> = ({ pressed, label, description, onChange }) => (
  <button
    type="button"
    aria-pressed={pressed}
    aria-label={description}
    title={description}
    onClick={() => onChange(!pressed)}
    className={`relative flex h-7 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-[background-color,color,scale] duration-150 ease-out before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96] motion-reduce:transition-none ${
      pressed
        ? 'bg-lighterGreen/15 text-lighterGreen'
        : 'bg-container2 text-lightGrey hover:bg-offwhite/10 hover:text-offwhite'
    }`}
  >
    <span
      aria-hidden="true"
      className={`grid size-3.5 place-items-center rounded-[4px] transition-[background-color,box-shadow] duration-150 ${
        pressed ? 'bg-lighterGreen text-background' : 'opacity-60 shadow-[inset_0_0_0_1.5px_currentColor]'
      }`}
    >
      {pressed && (
        <svg className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    {label}
  </button>
);
