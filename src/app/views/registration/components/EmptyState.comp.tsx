import React from 'react';

export const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-[14px] bg-container px-8 py-11 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
    <div className="mx-auto mb-4 grid size-[46px] place-items-center rounded-[14px] bg-container2 text-lightGrey">
      <span className="size-2 rounded-full bg-current opacity-70" />
    </div>
    <p className="text-[15px] font-semibold text-offwhite">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-lightGrey">{body}</p>
  </div>
);
