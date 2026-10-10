import React, { PropsWithChildren } from 'react';

export const PanelEyebrow: React.FC<PropsWithChildren> = ({ children }) => (
  <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">{children}</span>
);
