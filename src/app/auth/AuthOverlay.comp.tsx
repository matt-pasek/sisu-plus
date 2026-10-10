import { useTranslation } from 'react-i18next';

interface Props {
  onContinue: () => void;
}

export const AuthOverlay: React.FC<Props> = ({ onContinue }) => {
  const { t } = useTranslation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sisu-plus-auth-title"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-background/80"
    >
      <div className="max-w-[380px] rounded-2xl border border-border bg-container p-7 text-center font-sans text-offwhite">
        <h2 id="sisu-plus-auth-title" className="mb-2.5 text-xl font-semibold">
          {t('auth.overlay.title')}
        </h2>
        <p className="mb-5 text-sm leading-normal opacity-75">{t('auth.overlay.description')}</p>
        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="cursor-pointer rounded-[10px] bg-accent px-6 py-2.5 text-[15px] font-semibold text-background"
        >
          {t('auth.overlay.continue')}
        </button>
      </div>
    </div>
  );
};
