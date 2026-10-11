import React from 'react';
import { NavLink } from 'react-router';
import { getTimelineCourses } from '@/app/api/dataPoints/getTimelineCourses';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { DateRange } from '@/app/schedule';
import { plannedCourseCount } from '../util';

interface Props {
  term: DateRange;
}

export const TermCard: React.FC<Props> = ({ term }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const { timelineCourses } = getTimelineCourses();
  const planned = plannedCourseCount(timelineCourses, term);
  const termName = term.startKey.slice(5, 7) === '01' ? t('year.spring') : t('year.autumn');
  return (
    <div className="border-border px-[18px] py-3 md:border-l">
      <PanelEyebrow>{t('year.nextTerm')}</PanelEyebrow>
      <p className="mt-1.5 text-[12.5px] leading-normal text-lightGrey">
        {t('year.emptyTerm', { term: termName })} {planned > 0 && t('year.planned', { count: planned })}{' '}
        <NavLink to="/student/enrolments" className="font-medium text-lighterGreen hover:underline">
          {t('actions.openRegistration')}
        </NavLink>
      </p>
    </div>
  );
};
