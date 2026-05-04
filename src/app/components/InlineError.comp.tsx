import * as React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  endpoint: string;
  error: Error;
}

export const InlineError: React.FC<Props> = ({ endpoint, error }) => {
  const { t } = useTranslationWithPrefix('components.errors');
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
      }}
    >
      <span style={{ color: '#f87171' }}>{t('code')}</span>{' '}
      <span style={{ color: 'var(--text-secondary)' }}>{endpoint}</span> {error.message}
    </div>
  );
};
