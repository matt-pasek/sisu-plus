import React from 'react';

interface Props {
  text: string;
  retryLabel: string;
  onRetry: () => void;
}

export const LayerProblem: React.FC<Props> = ({ text, retryLabel, onRetry }) => (
  <p className="flex items-center gap-1.5 pb-1.5 text-[11.5px] text-warn">
    <span>{text}</span>
    <span aria-hidden="true">·</span>
    <button type="button" onClick={onRetry} className="cursor-pointer font-semibold underline-offset-2 hover:underline">
      {retryLabel}
    </button>
  </p>
);
