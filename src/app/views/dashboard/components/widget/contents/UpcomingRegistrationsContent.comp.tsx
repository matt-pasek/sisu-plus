import React from 'react';
import type { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';
import { formatCredits } from '@/app/helpers/formatCredits';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  getCourseDisplayName,
  getUpcomingRegistrationItems,
  RegistrationWidgetTone,
} from '@/app/views/dashboard/util/registrationWidgetData';

interface Props {
  courses: RegistrationCourse[];
}

const TONE_STYLES: Record<RegistrationWidgetTone, { border: string; fill: string; text: string; tint: string }> = {
  danger: {
    border: 'rgba(240,107,107,0.28)',
    fill: '#f06b6b',
    text: '#f06b6b',
    tint: 'rgba(240,107,107,0.12)',
  },
  warn: {
    border: 'rgba(240,168,77,0.24)',
    fill: '#f0a84d',
    text: '#f0a84d',
    tint: 'rgba(240,168,77,0.13)',
  },
  info: {
    border: 'rgba(126,160,255,0.22)',
    fill: '#7ea0ff',
    text: '#7ea0ff',
    tint: 'rgba(126,160,255,0.12)',
  },
};

const getPeriodLabel = (course: RegistrationCourse): string =>
  course.plannedPeriods
    .map((period) => period.name)
    .filter(Boolean)
    .join(' · ');

export const UpcomingRegistrationsContent: React.FC<Props> = ({ courses }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const registrations = getUpcomingRegistrationItems(courses).slice(0, 3);

  if (registrations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-lightGrey">
        {t('widgets.registration.noUpcomingRegistrations')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden">
      {registrations.map((item, index) => {
        const tone = TONE_STYLES[item.tone];
        const statusLabel =
          item.status === 'open'
            ? t('widgets.registration.closesIn', { count: item.daysUntil ?? '-' })
            : t('widgets.registration.opensIn', { count: item.daysUntil ?? '-' });
        return (
          <article
            key={`${item.course.courseUnitId}:${item.implementation.id}`}
            className="relative min-h-0 rounded-xl bg-container2 px-3 py-3"
            style={{ boxShadow: `inset 0 0 0 1px ${tone.border}` }}
          >
            <span className="absolute top-3 bottom-3 left-0 w-1 rounded-r-full" style={{ background: tone.fill }} />
            <div className="flex items-start justify-between gap-3 pl-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-offwhite">{getCourseDisplayName(item.course)}</p>
                <p className="mt-1 truncate font-mono text-[10.5px] text-lightGrey">
                  {[item.course.courseCode, getPeriodLabel(item.course)].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-lightGrey">
                {formatCredits(item.course.credits)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3 pl-3">
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: tone.tint, color: tone.text }}
              >
                <span className="size-1.5 rounded-full" style={{ background: 'currentColor' }} />
                {statusLabel}
              </span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background/80">
                <div
                  className="sisu-widget-bar-x h-full rounded-full"
                  style={{
                    animationDelay: `${index * 60}ms`,
                    background: tone.fill,
                    width: `${Math.max(item.progress * 100, item.status === 'open' ? 12 : 0)}%`,
                  }}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
