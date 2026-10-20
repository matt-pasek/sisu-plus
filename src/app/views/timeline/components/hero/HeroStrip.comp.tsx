import React from 'react';
import { HeroSection } from '@/app/components/ui/HeroSection.comp';
import type { HeroCopy } from '@/app/views/timeline/types';
import { AccentPhrase } from './AccentPhrase.comp';
import { HeroFoldToggle } from './HeroFoldToggle.comp';

interface Props {
  copy: HeroCopy;
  onToggle: () => void;
  focusRequest: React.MutableRefObject<boolean>;
}

export const HeroStrip: React.FC<Props> = ({ copy, onToggle, focusRequest }) => {
  const { projection } = copy;

  return (
    <HeroSection>
      <div className="relative flex h-14 items-center gap-4 pr-2 pl-5">
        <p className="min-w-0 truncate text-[15px] font-semibold text-offwhite">
          <AccentPhrase text={copy.headline} />
        </p>
        <ul className="flex min-w-0 shrink-0 items-center gap-4 text-[13px] text-lightGrey max-sm:hidden">
          <li className="font-mono font-semibold text-offwhite tabular-nums">
            {projection.value}
            {projection.target !== null && <span className="text-lightGrey"> / {projection.target}</span>}
            <span className="sr-only"> {projection.label}</span>
          </li>
          {copy.periodsLeft && <li className="whitespace-nowrap">{copy.periodsLeft}</li>}
          {copy.issues && <li className="whitespace-nowrap">{copy.issues}</li>}
        </ul>
        <HeroFoldToggle folded onToggle={onToggle} focusRequest={focusRequest} className="ml-auto" />
      </div>
    </HeroSection>
  );
};
