import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { LOAD_LEVEL_CLASS } from '../constants/loadLevel.const';
import type { LoadLevel } from '../types';

const LEVELS: LoadLevel[] = [0, 1, 2, 3, 4];
const SWATCH = 'relative inline-block size-[11px] rounded-[3px]';

export const YearLegend: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <div className="flex flex-wrap items-center gap-3.5 px-[18px] pt-1.5 pb-3.5 text-[11px] text-lightGrey">
      <span className="inline-flex items-center gap-[3px]">
        {t('year.less')}
        {LEVELS.map((level) => (
          <span key={level} className={`${SWATCH} ${LOAD_LEVEL_CLASS[level]}`} />
        ))}
        {t('year.more')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`${SWATCH} ${LOAD_LEVEL_CLASS[0]}`}>
          <span className="absolute inset-[30%] rotate-45 bg-offwhite" />
        </span>
        {t('year.exam')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`${SWATCH} ${LOAD_LEVEL_CLASS[0]} shadow-[inset_0_0_0_1.5px_rgba(240,168,77,0.9)]`} />
        {t('year.clash')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className={`${SWATCH} ${LOAD_LEVEL_CLASS[0]} bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_4px)]`}
        />
        {t('year.holiday')}
      </span>
    </div>
  );
};
