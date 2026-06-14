import { getRoutePath, LandingRoute } from '@/landing/landingSeo';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SisuPlusLogo } from '@/shared/SisuPlusLogo';
import React from 'react';
import { GithubIcon } from '@/landing/components/icons/GithubIcon';

interface Props {
  full?: boolean;
  route: LandingRoute;
}

export const Footer: React.FC<Props> = ({ full = true, route }) => {
  const { t } = useTranslationWithPrefix('landing');

  return (
    <footer className="landing-footer">
      <div className="landing-footer-left">
        <SisuPlusLogo />
        <p>
          &copy; {new Date().getFullYear()} Mateusz Pasek. {t('footer.copyright')}
          <br />
          <span>{t('footer.affiliation')}</span>
        </p>
      </div>
      <div className="landing-footer-links">
        {full && <a href={getRoutePath(route.locale, 'privacy')}>{t('footer.privacyPolicy')}</a>}
        <a href="https://github.com/matt-pasek/sisu-plus">{t('footer.sourceCode')}</a>
        {full && (
          <a href="https://ko-fi.com/mattpasek" target="_blank" rel="noreferrer">
            {t('footer.supportDevelopment')}
          </a>
        )}
        <a href="mailto:contact@matt-pasek.dev">{t('footer.contact')}</a>
        {full && (
          <a href="https://github.com/matt-pasek">
            <GithubIcon />
            {t('footer.myGithub')}
          </a>
        )}
      </div>
    </footer>
  );
};
