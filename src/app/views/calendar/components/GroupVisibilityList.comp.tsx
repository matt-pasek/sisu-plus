import React, { useEffect, useState } from 'react';
import type { CalendarGroup } from '@/app/api/dataPoints/calendar/types';
import { usePendingVisibility } from '@/app/api/dataPoints/calendar/usePendingVisibility';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { GroupRowModel } from '../types';
import { ChevronRightIcon } from './icons';
import { ToggleSwitch } from './ToggleSwitch.comp';

const UNDO_MS = 8000;

interface Props {
  summary: string;
  defaultOpen: boolean;
  rows: GroupRowModel[];
  groupNames: Map<string, string>;
  onToggle: (group: CalendarGroup, visible: boolean) => void;
  onHideToo: (row: GroupRowModel) => void;
  onPreview: (groupId: string | null) => void;
}

export const GroupVisibilityList: React.FC<Props> = ({
  summary,
  defaultOpen,
  rows,
  groupNames,
  onToggle,
  onHideToo,
  onPreview,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const [open, setOpen] = useState(defaultOpen);
  const pending = usePendingVisibility();
  const [lastChange, setLastChange] = useState<{ group: CalendarGroup; visible: boolean } | null>(null);
  useEffect(() => {
    if (!lastChange) return undefined;
    const timer = window.setTimeout(() => setLastChange(null), UNDO_MS);
    return () => window.clearTimeout(timer);
  }, [lastChange]);
  const toggle = (group: CalendarGroup, visible: boolean) => {
    onToggle(group, visible);
    setLastChange({ group, visible });
  };
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="group/visibility mt-2">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md text-[11.5px] text-lightGrey transition-colors duration-150 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon className="size-3 transition-transform duration-150 group-open/visibility:rotate-90 motion-reduce:transition-none" />
        {summary}
      </summary>
      <p className="mt-1.5 text-[11px] text-lightGrey">{t('groups.visibilityHint')}</p>
      <ul className="mt-1">
        {rows.map((row) => (
          <li
            key={row.group.id}
            className="border-t border-white/[0.06] py-2 first:border-t-0"
            onMouseEnter={() => onPreview(row.group.id)}
            onFocus={() => onPreview(row.group.id)}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-snug font-medium text-offwhite">{row.name}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-[#a3a3c4] tabular-nums">{row.details}</p>
              </div>
              <ToggleSwitch
                checked={row.group.isInCalendar}
                disabled={!row.group.hasEntry}
                pending={pending.has(row.group.id)}
                label={t('groups.showInCalendar')}
                onChange={(visible) => toggle(row.group, visible)}
              />
            </div>
            {!row.group.hasEntry && <p className="mt-1 text-[11px] text-lightGrey">{t('groups.changeInSisu')}</p>}
            <p aria-live="polite" className="text-[11.5px] text-lightGrey empty:hidden">
              {lastChange?.group.id === row.group.id && (
                <span className="mt-1 flex flex-wrap items-center gap-2">
                  {lastChange.visible ? t('groups.nowShown') : t('groups.nowHidden')}
                  <button
                    type="button"
                    onClick={() => {
                      onToggle(lastChange.group, !lastChange.visible);
                      setLastChange(null);
                    }}
                    className="cursor-pointer rounded-sm font-semibold text-offwhite underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen"
                  >
                    {t('groups.undo')}
                  </button>
                </span>
              )}
            </p>
            {row.shownThrough.length > 0 && (
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-blue-300">
                <span>
                  {t('groups.stillShown', { names: row.shownThrough.map((id) => groupNames.get(id) ?? id).join(', ') })}
                </span>
                <button
                  type="button"
                  onClick={() => onHideToo(row)}
                  className="cursor-pointer rounded-sm font-semibold text-offwhite underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen"
                >
                  {t('groups.hideThatToo')}
                </button>
              </p>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
};
