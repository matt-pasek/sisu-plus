import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { LandingRoadmapColumn } from '@/app/locales/en/landing/landing.translation.en';
import { getRoutePath, LandingRoute } from '@/landing/landingSeo';
import { HeroShowcase } from '@/landing/components/HeroShowcase';
import Plasma from '@/landing/components/Plasma';
import packageJson from '../../../package.json';
import { GithubIcon } from '@/landing/components/icons/GithubIcon';
import { FeatureCarousel, LandingFeatureCard } from '@/landing/components/FeatureCarousel';
import { CheckIcon } from '@/landing/components/icons/CheckIcon';
import { SupportIcon } from '@/landing/components/icons/SupportIcon';
import { SisuPlusLogo } from '@/shared/SisuPlusLogo';
import { HeroSocialProof } from '@/landing/components/HeroSocialProof';
import { LanguageToggle } from '@/landing/components/LanguageToggle';
import { Footer } from '@/landing/components/Footer';
import { getInstallLinkProps } from '@/landing/util/getInstallLinkProps';

const appVersion = import.meta.env?.VITE_APP_VERSION ?? packageJson.version;

export function LandingPage({ route }: { route: LandingRoute }) {
  const { t } = useTranslationWithPrefix('landing');
  const roadmap = t('roadmap.columns', { returnObjects: true }) as LandingRoadmapColumn[];
  const privacyPoints = t('privacy.points', { returnObjects: true }) as string[];
  const featureCards = t('features.cards', { returnObjects: true }) as LandingFeatureCard[];
  const homePath = getRoutePath(route.locale, 'home');
  const installLinkProps = getInstallLinkProps();

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <SisuPlusLogo />
        <div className="landing-nav-links">
          <a href={`${homePath}#features`}>{t('nav.features')}</a>
          <a href={`${homePath}#privacy`}>{t('nav.privacy')}</a>
          <a href={`${homePath}#roadmap`}>{t('nav.roadmap')}</a>
        </div>
        <div className="flex items-center gap-3">
          <a className="landing-nav-cta" {...installLinkProps}>
            {t('nav.addToChrome')}
          </a>
          <LanguageToggle route={route} />
        </div>
      </nav>
      <section className="landing-hero" id="top">
        <div className="landing-aurora">
          <Plasma
            center={[1, 0.75]}
            color="#419648"
            rotation={1.5}
            speed={0.6}
            direction="forward"
            scale={1.38}
            opacity={0.78}
            mouseInteractive={true}
          />
        </div>
        <div className="landing-hero-copy">
          <div className="landing-badge">
            <span>{t('hero.badge')}</span>
            <p>{t('hero.shipped', { version: appVersion })}</p>
          </div>
          <h1>
            {t('hero.titleStart')} <span>{t('hero.titleAccent')}</span>
          </h1>
          <p>{t('hero.body')}</p>
          <div className="landing-actions">
            <a className="landing-primary" {...installLinkProps}>
              {t('hero.addToChromeFree')}
            </a>
            <a className="landing-secondary" href="https://github.com/matt-pasek/sisu-plus">
              <GithubIcon />
              {t('hero.sourceCode')}
            </a>
            <a className="landing-secondary" href={`${homePath}#features`}>
              {t('hero.seeChanged')}
            </a>
          </div>
          <HeroSocialProof />
          <p className="landing-mobile-note">{t('hero.mobileNote')}</p>
        </div>
        <div className="landing-preview-wrap">
          <HeroShowcase />
        </div>
      </section>

      <section className="landing-section landing-feature-band landing-reveal" id="features">
        <div>
          <p className="landing-kicker">{t('features.kicker')}</p>
          <h2>{t('features.title')}</h2>
          <p className="landing-section-copy">{t('features.body')}</p>
        </div>
        <FeatureCarousel cards={featureCards} />
      </section>

      <section className="landing-section landing-privacy landing-reveal" id="privacy">
        <div>
          <p className="landing-kicker">{t('privacy.kicker')}</p>
          <h2>{t('privacy.title')}</h2>
          <p className="landing-section-copy">{t('privacy.body')}</p>
        </div>
        <div className="landing-privacy-panel">
          {privacyPoints.map((point) => (
            <div key={point} className="landing-privacy-row">
              <CheckIcon />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-reveal" id="roadmap">
        <div className="landing-section-heading">
          <p className="landing-kicker">{t('roadmap.kicker')}</p>
          <h2>{t('roadmap.title')}</h2>
          <p className="landing-section-copy">{t('roadmap.body')}</p>
        </div>
        <div className="landing-roadmap-grid">
          <div className="landing-roadmap-rail" aria-hidden="true">
            {roadmap.map((column) => (
              <span className={`landing-roadmap-node is-${column.tone}`} key={column.version} />
            ))}
          </div>
          <div className="landing-roadmap-cards">
            {roadmap.map((column) => (
              <article className={`landing-roadmap-card is-${column.tone}`} key={column.version}>
                <div className="landing-roadmap-card-top">
                  <div className="landing-roadmap-version">{column.version}</div>
                  <span className="landing-roadmap-status">{column.status}</span>
                </div>
                <h3>{column.title}</h3>
                {column.body && <p className="landing-roadmap-card-body">{column.body}</p>}
                <ul>
                  {column.items.map((item) => (
                    <li className={item.featured ? 'is-featured' : undefined} key={item.label}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-support landing-reveal" aria-labelledby="support-heading">
        <div className="landing-support-copy">
          <p className="landing-kicker">{t('support.kicker')}</p>
          <h2 id="support-heading">{t('support.title')}</h2>
          <p>{t('support.body')}</p>
        </div>
        <a
          className="landing-support-card"
          href="https://ko-fi.com/mattpasek"
          target="_blank"
          rel="noreferrer"
          aria-label={t('support.aria')}
        >
          <span className="landing-support-icon">
            <SupportIcon />
          </span>
          <span>
            <strong>{t('support.action')}</strong>
            <small>{t('support.hint')}</small>
          </span>
        </a>
      </section>

      <section className="landing-universities landing-reveal" id="install">
        <div className="landing-university-heading">
          <p className="landing-kicker">{t('universities.kicker')}</p>
          <h2>{t('universities.title')}</h2>
        </div>

        <div className="landing-install-banner">
          <div className="landing-install-banner-top">
            <div className="landing-install-copy">
              <p className="landing-kicker">{t('universities.installTitle')}</p>
              <p className="landing-install-body">{t('universities.installBody')}</p>
              <div className="landing-install-steps" aria-label="Setup steps">
                {(t('universities.steps', { returnObjects: true }) as string[]).flatMap((step, i) => [
                  <span key={step} className="landing-install-step">
                    <span className="landing-install-step-num">{i + 1}</span>
                    {step}
                  </span>,
                  ...(i < 2
                    ? [
                        <span key={`arrow-${i}`} className="landing-install-step-arrow" aria-hidden="true">
                          →
                        </span>,
                      ]
                    : []),
                ])}
              </div>
            </div>
            <a className="landing-primary" {...installLinkProps}>
              {t('nav.addToChrome')}
            </a>
          </div>
          <div className="landing-install-sep" />
          <div className="landing-install-confirmed">
            <span className="landing-install-confirmed-label">{t('universities.confirmed')}</span>
            <div className="landing-install-chips">
              {['Aalto', 'Helsinki', 'TUNI', 'JYU', 'LUT', 'LAB'].map((uni) => (
                <span key={uni} className="landing-install-chip">
                  <CheckIcon />
                  {uni}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer route={route} />
    </main>
  );
}
