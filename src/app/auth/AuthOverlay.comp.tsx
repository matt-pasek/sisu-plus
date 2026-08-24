import { useTranslation } from 'react-i18next';

export function AuthOverlay({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sisu-plus-auth-title"
      style={{
        alignItems: 'center',
        background: 'color-mix(in srgb, var(--color-background) 82%, transparent)',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        position: 'fixed',
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          background: 'var(--color-container)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          color: 'var(--color-offwhite)',
          fontFamily: 'var(--font-sans)',
          maxWidth: '380px',
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <h2 id="sisu-plus-auth-title" style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 10px' }}>
          {t('auth.overlay.title')}
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 22px', opacity: 0.75 }}>
          {t('auth.overlay.description')}
        </p>
        <button
          type="button"
          onClick={onContinue}
          autoFocus
          style={{
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '10px',
            color: 'var(--color-background)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            padding: '11px 26px',
          }}
        >
          {t('auth.overlay.continue')}
        </button>
      </div>
    </div>
  );
}
