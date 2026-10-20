import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  column: number;
  row: number;
  periodName: string;
  revealed: boolean;
  onOpen: (trigger: HTMLElement) => void;
}

export const AddCourseSlot: React.FC<Props> = ({ column, row, periodName, revealed, onOpen }) => {
  const { t } = useTranslationWithPrefix('views.timeline');

  return (
    <button
      type="button"
      aria-label={t('addCourse.slot', { period: periodName })}
      onClick={(event) => onOpen(event.currentTarget)}
      className={`z-10 flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-lighterGreen/45 bg-lighterGreen/5 px-3 text-xs font-medium text-lighterGreen transition-opacity duration-150 hover:bg-lighterGreen/10 hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100 ${
        revealed ? 'opacity-100' : 'opacity-40'
      }`}
      style={{ gridColumn: column, gridRow: row }}
    >
      <span aria-hidden="true" className="truncate">
        + {t('addCourse.eyebrow')}
      </span>
    </button>
  );
};
