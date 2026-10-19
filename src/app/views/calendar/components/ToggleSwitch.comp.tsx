import React from 'react';

interface Props {
  checked: boolean;
  disabled?: boolean;
  pending?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<Props> = ({ checked, disabled = false, pending = false, label, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-busy={pending}
    aria-label={label}
    disabled={disabled || pending}
    onClick={() => onChange(!checked)}
    className={`relative mt-0.5 h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen disabled:cursor-not-allowed ${pending ? 'cursor-wait! motion-safe:animate-pulse' : 'disabled:opacity-40'} ${checked ? 'bg-accent' : 'bg-border2'}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 size-3 rounded-full bg-white transition-transform duration-150 ${checked ? 'translate-x-3' : 'translate-x-0'}`}
    />
  </button>
);
