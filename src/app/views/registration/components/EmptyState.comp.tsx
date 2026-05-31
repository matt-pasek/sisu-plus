import React from 'react';

export const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-lg bg-container px-5 py-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
    <p className="text-sm font-semibold text-offwhite">{title}</p>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-lightGrey">{body}</p>
  </div>
);
