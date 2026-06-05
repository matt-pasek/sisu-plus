import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

export const HeroSocialProof = () => {
  const { t } = useTranslationWithPrefix('landing');
  const avatars = ['AK', 'MV', 'JS'];

  return (
    <div className="landing-hero-social" aria-label={t('hero.activeUsers')}>
      <div className="landing-social-avatars" aria-hidden="true">
        {avatars.map((avatar) => (
          <span key={avatar}>{avatar}</span>
        ))}
        <span>+</span>
      </div>
      <p>{t('hero.activeUsers')}</p>
    </div>
  );
};
