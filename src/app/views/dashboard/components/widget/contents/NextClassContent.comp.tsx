import React from 'react';
import { useNavigate } from 'react-router';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { NextClassCard } from '@/app/views/calendar/components/NextClassCard.comp';
import { formatClock, joinNames, sessionRoom } from '@/app/views/calendar/util';
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

  const roomLabels = { noRoom: tCalendar('event.noRoom'), unavailable: tCalendar('event.roomUnavailable') };
  const clashNames = clashCourseNames(model.session.id, data.clashesBySession, data.attended);
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      <NextClassCard
        session={model.session}
        now={now}
        room={sessionRoom(model.session, data.rooms, roomLabels)}
        clashNames={clashNames.length > 0 ? joinNames(clashNames, locale) : null}
        locale={locale}
      />
      {model.laterToday.length > 0 && (
        <div className="flex min-h-0 flex-col gap-1.5">
          <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
            {t('widgets.nextClass.laterToday')}
          </p>
          {model.laterToday.map((session) => (
            <div
              key={session.id}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-lg bg-container2 px-3 py-2"
            >
              <span className="font-mono text-[12px] font-bold text-lightGrey tabular-nums">
                {formatClock(session.start)}
              </span>
              <span className="truncate text-[12px] font-semibold text-offwhite">{session.courseName}</span>
              <span className="text-[11px] text-lightGrey">{tCalendar(`kinds.${session.kind}`)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
