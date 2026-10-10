import React from 'react';

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const LayerSwitch: React.FC<Props> = ({ label, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full cursor-pointer items-center justify-between gap-3 py-1.5 text-left text-[13px] text-offwhite"
  >
    <span>{label}</span>
    <span
      className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-150 ${checked ? 'bg-accent' : 'bg-border2'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-3 rounded-full bg-white transition-transform duration-150 ${checked ? 'translate-x-3' : 'translate-x-0'}`}
      />
    </span>
  </button>
);
