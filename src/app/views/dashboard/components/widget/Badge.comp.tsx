import React, { PropsWithChildren } from 'react';

type BadgeKind = 'accent' | 'live' | 'warn' | 'mut';

interface Props extends PropsWithChildren {
  kind?: BadgeKind;
  dot?: boolean;
}

export const Badge: React.FC<Props> = ({ kind = 'mut', dot, children }) => {
  const styles: Record<BadgeKind, string> = {
    accent: 'bg-accent/13 text-lighterGreen',
    live: 'bg-lighterGreen/12 text-lighterGreen',
    warn: 'bg-warn/13 text-warn',
    mut: 'bg-container2 text-lightGrey',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${styles[kind]}`}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full"
          style={{
            background: 'currentColor',
            ...(kind === 'live'
              ? { animation: 'sisuPulse 2s infinite', boxShadow: '0 0 0 0 rgba(82,201,137,0.6)' }
              : {}),
          }}
        />
      )}
      {children}
    </span>
  );
};
