import * as React from 'react';

interface Props {
  endpoint: string;
  error: Error;
}

export const InlineError: React.FC<Props> = ({ endpoint, error }) => {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
      }}
    >
      <span style={{ color: '#f87171' }}>ERR</span> <span style={{ color: 'var(--text-secondary)' }}>{endpoint}</span>{' '}
      {error.message}
    </div>
  );
};
