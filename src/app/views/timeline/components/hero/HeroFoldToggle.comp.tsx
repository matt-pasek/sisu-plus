import React, { useEffect, useRef } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  folded: boolean;
  onToggle: () => void;
  /** Set by the previous layout's toggle, so focus follows the swap instead of dropping to the page. */
  focusRequest: React.MutableRefObject<boolean>;
  className?: string;
}

export const HeroFoldToggle: React.FC<Props> = ({ folded, onToggle, focusRequest, className = '' }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = folded ? t('hero.unfold') : t('hero.fold');

  useEffect(() => {
    if (!focusRequest.current) return;
    focusRequest.current = false;
    buttonRef.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        focusRequest.current = true;
        onToggle();
      }}
      aria-expanded={!folded}
      aria-label={label}
      title={label}
      className={`grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/8 bg-background/60 text-lightGrey transition-[background-color,color,scale] duration-150 ease-out hover:bg-offwhite/10 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen/75 active:scale-[0.96] motion-reduce:transition-none ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className={`size-4 ${folded ? '' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </button>
  );
};
