import React, { useEffect } from 'react';

interface Props {
  labelId: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const DialogShell: React.FC<Props> = ({ labelId, onClose, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[min(44rem,calc(100dvh-3rem))] w-full ${maxWidth} flex-col overflow-hidden rounded-[14px] bg-container shadow-[0_28px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.10)]`}
      >
        {children}
      </div>
    </div>
  );
};
