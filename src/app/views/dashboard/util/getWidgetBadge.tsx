import type { DashboardCompletedCourse, DashboardWidgetId } from '@/app/views/dashboard/types';
import React from 'react';
import { HeaderLink } from '@/app/views/dashboard/components/widget/HeaderLink.comp';
import { getOpenRegistrationCount } from '@/app/views/dashboard/util/registrationWidgetData';
import { Badge } from '@/app/views/dashboard/components/widget/Badge.comp';
import { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';
import { getCurrentSemester } from '@/app/views/dashboard/util';
import { TFunction } from 'i18next';
import { NavigateFunction } from 'react-router';

export interface WidgetBadgeContext {
  t: TFunction;
  navigate: NavigateFunction;
  selectedPlanId: string | undefined;
  missingToken: boolean | undefined;
  registrationCourses: RegistrationCourse[];
  completedCourses: DashboardCompletedCourse[] | undefined;
}

export const getWidgetBadge = (id: DashboardWidgetId, ctx: WidgetBadgeContext): React.ReactNode => {
  const { t, navigate, selectedPlanId, missingToken, registrationCourses, completedCourses } = ctx;

  if (id === 'next-exam') {
    return (
      <HeaderLink onClick={() => navigate('/student/enrolments')}>{t('widgets.actions.openRegistration')}</HeaderLink>
    );
  }
  if (id === 'upcoming-registrations') {
    const openCount = getOpenRegistrationCount(registrationCourses);
    if (openCount > 0) {
      return (
        <Badge kind="warn" dot>
          {t('widgets.registration.openNowCount', { count: openCount })}
        </Badge>
      );
    }
    return (
      <HeaderLink onClick={() => navigate('/student/enrolments')}>{t('widgets.actions.openRegistration')}</HeaderLink>
    );
  }
  if (id === 'timeline-peek') {
    return (
      <HeaderLink onClick={() => navigate(selectedPlanId ? `/student/plan/${selectedPlanId}/timing` : '/student/plan')}>
        {t('widgets.actions.openTimeline')}
      </HeaderLink>
    );
  }
  if (id === 'moodle-deadlines' && !missingToken) {
    return (
      <Badge kind="live" dot>
        LIVE
      </Badge>
    );
  }
  if (id === 'active-courses') {
    return (
      <Badge kind="accent" dot>
        {getCurrentSemester(t)}
      </Badge>
    );
  }
  if (id === 'recent-achievements' && completedCourses && completedCourses.length > 0) {
    return <Badge kind="accent">{completedCourses.length} passed</Badge>;
  }
  return null;
};
