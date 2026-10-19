import React from 'react';
import { useNavigate } from 'react-router';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { todayKey, type Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { WarningIcon } from '@/app/views/calendar/components/icons';
import {
  countdownKey,
  countdownTo,
  formatClock,
  formatSessionDate,
  formatWeekday,
  joinNames,
  sessionRoom,
} from '@/app/views/calendar/util';
import { EmptyWidgetState } from '@/app/views/dashboard/components/widget/EmptyWidgetState.comp';
import { useNextClass } from '@/app/views/dashboard/hooks/useNextClass';
import { clashCourseNames } from '@/app/views/dashboard/util/nextClass';
import { nextClassView } from '@/app/views/dashboard/util/nextClassView';

const MESSAGE_CLASS = 'flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-lightGrey';
const LINK_CLASS = 'cursor-pointer text-xs font-semibold text-lighterGreen underline-offset-2 hover:underline';

export const NextClassContent: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tCalendar, i18n } = useTranslationWithPrefix('views.calendar');
  const navigate = useNavigate();
  const { data, model, now } = useNextClass();
  const locale = i18n.language;
  const view = nextClassView({
    error: data.error,
    updatedAt: data.updatedAt,
    courseCount: data.courses.length,
    model,
  });

  if (view === 'loading') return <InlineLoader />;
  if (view === 'failed') {
    return (
      <div className={MESSAGE_CLASS}>
        <p>{t('widgets.nextClass.failed')}</p>
        <button type="button" onClick={data.refetch} className={LINK_CLASS}>
          {t('widgets.nextClass.retry')}
        </button>
      </div>
    );
  }
  if (view === 'noCourses') {
    return (
      <div className={MESSAGE_CLASS}>
        <p>{t('widgets.nextClass.noCourses')}</p>
        <button type="button" onClick={() => navigate('/student/enrolments')} className={LINK_CLASS}>
          {t('widgets.nextClass.openRegistration')}
        </button>
      </div>
    );
  }
  if (!model) return <EmptyWidgetState label={t('widgets.nextClass.noneLeft')} />;

  const { session, following } = model;
  const today = todayKey(now);
  const countdown = countdownTo(session, now);
  const { key, params } = countdownKey(countdown);
  const when =
    countdown.kind === 'now' ? `${tCalendar('agenda.now')} · ${tCalendar(key, params)}` : tCalendar(key, params);
  const roomLabels = { noRoom: tCalendar('event.noRoom'), unavailable: tCalendar('event.roomUnavailable') };
  const clashNames = clashCourseNames(session.id, data.clashesBySession, data.attended);
  const meta = [
    tCalendar(`kinds.${session.kind}`),
    sessionRoom(session, data.rooms, roomLabels),
    session.dateKey === today ? null : formatSessionDate(session.dateKey, locale),
  ]
    .filter(Boolean)
    .join(' · ');
  const startLabel = (item: Session): string =>
    item.dateKey === today
      ? formatClock(item.start)
      : `${formatWeekday(item.dateKey, locale)} ${formatClock(item.start)}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="sisu-widget-fade-lift">
        <div className="flex items-end gap-3">
          <span className="font-mono text-[36px] leading-none font-bold text-offwhite tabular-nums">
            {formatClock(session.start)}
          </span>
          <span className="pb-0.5 text-sm font-medium text-lightGrey">{when}</span>
        </div>
        <p className="mt-2 truncate text-[15px] font-semibold text-offwhite">{session.courseName}</p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[12.5px] text-[#c0c0da]">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: getModuleColorValueByIndex(session.colorIndex) }}
          />
          <span className="truncate">{meta}</span>
        </p>
        {clashNames.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-warn">
            <WarningIcon className="size-3 shrink-0" />
            <span className="truncate">{tCalendar('agenda.clashWith', { names: joinNames(clashNames, locale) })}</span>
          </p>
        )}
      </section>
      {following.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col pt-3.5">
          <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
            {t('widgets.nextClass.comingUp')}
          </p>
          {/* Rows that do not fit wrap into a second column outside the box, so none is cut in half. */}
          <ul className="mt-1 flex min-h-0 flex-1 flex-col flex-wrap content-start overflow-hidden">
            {following.map((item) => (
              <li
                key={item.id}
                className="grid w-full grid-cols-[8px_auto_minmax(0,1fr)] items-center gap-2.5 border-t border-white/[0.06] py-2 first:border-t-0"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: getModuleColorValueByIndex(item.colorIndex) }}
                />
                <span className="font-mono text-[11.5px] font-semibold whitespace-nowrap text-lightGrey tabular-nums">
                  {startLabel(item)}
                </span>
                <span className="truncate text-[12.5px] font-medium text-offwhite">{item.courseName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
