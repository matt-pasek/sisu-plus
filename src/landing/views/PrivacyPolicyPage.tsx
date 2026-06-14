import { getRoutePath, LandingRoute } from '@/landing/landingSeo';
import { LandingPolicySection } from '@/app/locales/en/landing/landing.translation.en';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SisuPlusLogo } from '@/shared/SisuPlusLogo';
import { LanguageToggle } from '@/landing/components/LanguageToggle';
import { Footer } from '@/landing/components/Footer';
import { getInstallLinkProps } from '@/landing/util/getInstallLinkProps';
import React from 'react';

interface Props {
  route: LandingRoute;
}

export const PrivacyPolicyPage: React.FC<Props> = ({ route }) => {
  const { t } = useTranslationWithPrefix('landing');
  const policySections = t('policy.sections', { returnObjects: true }) as LandingPolicySection[];
  const homePath = getRoutePath(route.locale, 'home');
  const installLinkProps = getInstallLinkProps();

  return (
    <main className="landing-page privacy-page">
      <nav className="landing-nav">
        <SisuPlusLogo />
        <div className="landing-nav-links">
          <a href={homePath}>{t('nav.home')}</a>
          <a href={`${homePath}#features`}>{t('nav.features')}</a>
        </div>
        <div className="flex items-center gap-3">
          <a className="landing-nav-cta" {...installLinkProps}>
            {t('nav.addToChrome')}
          </a>
          <LanguageToggle route={route} />
        </div>
      </nav>

      <section className="privacy-document">
        <p className="landing-kicker">{t('policy.kicker')}</p>
        <h1>{t('policy.title')}</h1>
        <p className="privacy-effective-date">{t('policy.effectiveDate')}</p>
        <p className="privacy-intro">{t('policy.intro')}</p>

        <div className="privacy-section-list">
          {policySections.map((section) => (
            <section key={section.title} className="privacy-policy-section">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </section>

      <Footer full={false} route={route} />
    </main>
  );
};
