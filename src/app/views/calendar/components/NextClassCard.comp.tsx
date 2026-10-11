import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { countdownTo, formatClock, formatSessionDate } from '../util';
import { WarningIcon } from './icons';

interface Props {
  session: Session;
  now: Date;
  room: string;
  clashNames: string | null;
  locale: string;
}

export const NextClassCard: React.FC<Props> = ({ session, now, room, clashNames, locale }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const color = getModuleColorValueByIndex(session.colorIndex);
  const countdown = countdownTo(session, now);
  const when =
    countdown.kind === 'now'
      ? t('agenda.now', { time: formatClock(countdown.until) })
      : countdown.kind === 'soon'
        ? countdown.minutes < 60
          ? t('agenda.inMinutes', { minutes: countdown.minutes })
          : t('agenda.inHours', { hours: Math.floor(countdown.minutes / 60), minutes: countdown.minutes % 60 })
        : formatSessionDate(session.dateKey, locale);
  return (
    <div
      className="relative rounded-xl bg-container2 px-3.5 py-3"
      style={{ backgroundImage: `linear-gradient(${color}21, ${color}21)`, boxShadow: `inset 0 0 0 1px ${color}38` }}
    >
      <p className="font-mono text-[11px] tabular-nums" style={{ color }}>
        {t('agenda.next')} · {formatClock(session.start)}–{formatClock(session.end)}
      </p>
      <p className="mt-1 mb-0.5 pr-24 text-[15px] leading-snug font-semibold text-offwhite">{session.courseName}</p>
      <p className="text-[12.5px] text-[#c0c0da]">
        {t(`kinds.${session.kind}`)} · {room}
      </p>
      <p className="absolute top-3 right-3.5 max-w-24 text-right font-mono text-xs font-semibold text-offwhite">
        {when}
      </p>
      {clashNames && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-warn">
          <WarningIcon className="size-3 shrink-0" />
          {t('agenda.clashWith', { names: clashNames })}
        </p>
      )}
    </div>
  );
};
