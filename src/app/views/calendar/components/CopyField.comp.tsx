import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { CopyIcon } from './icons';

interface Props {
  label: string;
  value: string;
}

export const CopyField: React.FC<Props> = ({ label, value }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');

  useEffect(() => {
    if (state !== 'copied') return undefined;
    const timer = window.setTimeout(() => setState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      inputRef.current?.select();
      setState('manual');
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-[10px] font-semibold tracking-[0.1em] text-lightGrey uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={id}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-[11.5px] text-offwhite outline-none focus-visible:border-lighterGreen"
        />
        <button
          type="button"
          onClick={() => void copy()}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-offwhite/8"
        >
          <CopyIcon className="size-3.5" />
          {state === 'copied' ? t('exportPanel.copied') : t('exportPanel.copy')}
        </button>
      </div>
      {state === 'manual' && <p className="text-[11.5px] text-lightGrey">{t('exportPanel.copyFallback')}</p>}
    </div>
  );
};
