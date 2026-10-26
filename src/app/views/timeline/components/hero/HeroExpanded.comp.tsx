import React from 'react';
import { Kynnos } from '@usva-ui/react/atmospheres/kynnos';
import { HeroEyebrow } from '@/app/components/ui/HeroEyebrow.comp';
import { HeroFeaturedStat } from '@/app/components/ui/HeroFeaturedStat.comp';
import { HeroPlainStat } from '@/app/components/ui/HeroPlainStat.comp';
import { HeroSection } from '@/app/components/ui/HeroSection.comp';
import {
  HERO_GROUND_LIGHT,
  HERO_GROUND_PARAMS,
  HERO_GROUND_TOKENS,
} from '@/app/views/timeline/constants/heroAtmosphere.const';
import type { HeroCopy } from '@/app/views/timeline/types';
import { AccentPhrase } from './AccentPhrase.comp';
import { HeroFoldToggle } from './HeroFoldToggle.comp';
import { HeroLoadChart } from './HeroLoadChart.comp';

interface Props {
  copy: HeroCopy;
  onToggle: () => void;
  focusRequest: React.MutableRefObject<boolean>;
}

export const HeroExpanded: React.FC<Props> = ({ copy, onToggle, focusRequest }) => {
  const [featured, ...plain] = copy.tiles;

  return (
    <HeroSection
      background={
        <div className="absolute inset-x-0 top-0 h-[33rem]" style={HERO_GROUND_TOKENS}>
          <Kynnos light={HERO_GROUND_LIGHT} params={HERO_GROUND_PARAMS} className="h-full w-full" />
        </div>
      }
    >
      <div className="relative flex flex-col gap-7 px-5 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10">
        <div className="min-w-0">
          <div className="mb-3 pr-12 lg:pr-0">
            <HeroEyebrow lead={copy.eyebrowLabel} items={copy.eyebrowItems} />
          </div>
          <h1 className="max-w-195 text-[34px] leading-[0.98] font-bold tracking-normal text-balance text-offwhite sm:text-[44px] lg:text-[52px]">
            <AccentPhrase text={copy.headline} />
          </h1>
          {copy.hint && <p className="mt-3 max-w-xl text-[15px] text-pretty text-lightGrey">{copy.hint}</p>}
          {featured && (
            <div className="mt-6 flex w-fit flex-wrap items-stretch gap-1.5 backdrop-blur-[2px]">
              <HeroFeaturedStat stat={featured} />
              {plain.map((tile) => (
                <HeroPlainStat key={tile.id} stat={tile} />
              ))}
            </div>
          )}
        </div>
        <HeroLoadChart
          chart={copy.loadChart}
          neededCredits={copy.neededPerPeriod}
          className="hidden lg:mr-12 lg:flex"
        />
      </div>
      <HeroFoldToggle
        folded={false}
        onToggle={onToggle}
        focusRequest={focusRequest}
        className="absolute top-4 right-4 z-10"
      />
    </HeroSection>
  );
};
