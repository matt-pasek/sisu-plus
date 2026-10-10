import React from 'react';
import { NavLink } from 'react-router';
import { Button } from '@/app/components/ui/Button.comp';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  status: 'loading' | 'error' | 'emptyTerm';
  onRetry: () => void;
}

export const CalendarState: React.FC<Props> = ({ status, onRetry }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  if (status === 'loading') {
    return (
      <div role="status" aria-label={t('states.loading')} className="flex flex-1 items-center justify-center">
        <InlineLoader />
      </div>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-lightGrey">
      <p>{t(status === 'error' ? 'states.error' : 'states.emptyTerm')}</p>
      {status === 'error' ? (
        <Button onClick={onRetry}>{t('states.retry')}</Button>
      ) : (
        <NavLink to="/student/enrolments" className="font-medium text-lighterGreen hover:underline">
          {t('actions.openRegistration')}
        </NavLink>
      )}
    </div>
  );
};
