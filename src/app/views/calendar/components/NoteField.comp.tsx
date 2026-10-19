import React, { type PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  id: string;
  label: string;
  error: string | null;
}

export const NoteField: React.FC<Props> = ({ id, label, error, children }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <label htmlFor={id} className="font-mono text-[10px] font-semibold tracking-[0.1em] text-lightGrey uppercase">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-[11.5px] text-warn">
        {error}
      </p>
    )}
  </div>
);
