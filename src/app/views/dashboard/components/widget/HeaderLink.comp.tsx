import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  onClick: () => void;
}
export const HeaderLink: React.FC<Props> = ({ children, onClick }) => (
  <button
    className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    type="button"
  >
    <span>{children}</span>
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  </button>
);
