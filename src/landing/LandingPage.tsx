import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import i18n, { getCurrentLocale } from '@/app/i18n';
import type { LandingPolicySection, LandingRoadmapColumn } from '@/app/locales/en/landing/landing.translation.en';
import { LOCALES, Locale } from '@/app/locales/locale';
import { HeroShowcase } from '@/landing/components/HeroShowcase';
import Plasma from '@/landing/components/Plasma';

const chromeStoreUrl = import.meta.env.VITE_CHROME_WEB_STORE_URL?.trim();
const chromeStoreLinkProps = chromeStoreUrl
  ? {
      href: chromeStoreUrl,
      target: '_blank',
      rel: 'noreferrer',
    }
  : {
      href: '#install',
    };

function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold text-offwhite">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-lighterGreen font-bold text-background">S+</span>
      <span>
        Sisu<span className="text-lighterGreen">+</span>
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-lighterGreen"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42 0L3.29 9.123a1 1 0 0 1 1.42-1.408l4.09 4.123 6.49-6.542a1 1 0 0 1 1.414-.006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function EnergyDrinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3h8" />
      <path d="M9 3 8 7h8l-1-4" />
      <path d="M8 7h8l-1 14H9L8 7Z" />
      <path d="M11.5 11 10 15h3l-1 3 3-5h-3l1-2Z" />
    </svg>
  );
}

function LanguageToggle() {
  const activeLocale = getCurrentLocale();

  function setLocale(locale: Locale) {
    localStorage.setItem('i18nextLng', locale);
    void i18n.changeLanguage(locale);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-container2 p-1 text-xs font-semibold">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          className={`min-h-7 rounded-full px-2.5 transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
            activeLocale === locale ? 'bg-lighterGreen text-background' : 'text-lightGrey hover:text-offwhite'
          }`}
          onClick={() => setLocale(locale)}
          type="button"
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function HeroSocialProof() {
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
}

function Footer({ full = true }: { full?: boolean }) {
  const { t } = useTranslationWithPrefix('landing');

  return (
    <footer className="landing-footer">
      <div className="landing-footer-left">
        <Logo />
        <p>
          &copy; {new Date().getFullYear()} Mateusz Pasek. {t('footer.copyright')}
          <br />
          <span>{t('footer.affiliation')}</span>
        </p>
      </div>
      <div className="landing-footer-links">
        {full && <a href="/privacy">{t('footer.privacyPolicy')}</a>}
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
}

export function LandingPage() {
  const { t } = useTranslationWithPrefix('landing');
  const roadmap = t('roadmap.columns', { returnObjects: true }) as LandingRoadmapColumn[];
  const privacyPoints = t('privacy.points', { returnObjects: true }) as string[];
  const featureCards = t('features.cards', { returnObjects: true }) as { title: string; body: string }[];

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-links">
          <a href="#features">{t('nav.features')}</a>
          <a href="#privacy">{t('nav.privacy')}</a>
          <a href="#roadmap">{t('nav.roadmap')}</a>
        </div>
        <div className="flex items-center gap-3">
          <a className="landing-nav-cta" {...chromeStoreLinkProps}>
            {t('nav.addToChrome')}
          </a>
          <LanguageToggle />
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
            <p>{t('hero.shipped', { version: import.meta.env.VITE_APP_VERSION })}</p>
          </div>
          <h1>
            {t('hero.titleStart')} <span>{t('hero.titleAccent')}</span>
          </h1>
          <p>{t('hero.body')}</p>
          <div className="landing-actions">
            <a className="landing-primary" {...chromeStoreLinkProps}>
              {t('hero.addToChromeFree')}
            </a>
            <a className="landing-secondary" href="https://github.com/matt-pasek/sisu-plus">
              <GithubIcon />
              {t('hero.sourceCode')}
            </a>
            <a className="landing-secondary" href="#features">
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
        <div className="landing-feature-list">
          {featureCards.map((card) => (
            <article className="landing-interactive-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
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
          {roadmap.map((column) => (
            <article
              className={column.current ? 'is-current landing-roadmap-card' : 'landing-roadmap-card'}
              key={column.version}
            >
              <div className="landing-roadmap-version">{column.version}</div>
              <h3>{column.title}</h3>
              <span>{column.status}</span>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
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
            <EnergyDrinkIcon />
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

        <div className="landing-university-panel">
          <div className="landing-university-left">
            <div className="landing-live-label">
              <span />
              {t('universities.live')}
            </div>
            <div className="landing-live-universities">
              <div className="landing-live-university-chip">
                <span>LUT</span>
                <div>
                  <h3>LUT University</h3>
                  <p>sisu.lut.fi</p>
                </div>
                <CheckIcon />
              </div>
              <div className="landing-live-university-chip">
                <span>LAB</span>
                <div>
                  <h3>LAB University of Applied Sciences</h3>
                  <p>sisu.lab.fi</p>
                </div>
                <CheckIcon />
              </div>
            </div>
          </div>

          <div className="landing-request-card">
            <h3>{t('universities.requestTitle')}</h3>
            <p>{t('universities.requestBody')}</p>
            <div className="landing-request-steps">
              <div>
                <span>1</span>
                <p>
                  <strong>{t('universities.emailStrong')}</strong> {t('universities.emailRest')}
                </p>
              </div>
              <div>
                <span>2</span>
                <p>{t('universities.steps.1')}</p>
              </div>
              <div>
                <span>3</span>
                <p>{t('universities.steps.2')}</p>
              </div>
            </div>
            <a href="mailto:contact@matt-pasek.dev?subject=Sisu%2B university support">
              <MailIcon />
              {t('universities.action')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export function PrivacyPolicyPage() {
  const { t } = useTranslationWithPrefix('landing');
  const policySections = t('policy.sections', { returnObjects: true }) as LandingPolicySection[];

  return (
    <main className="landing-page privacy-page">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-links">
          <a href="/">{t('nav.home')}</a>
          <a href="/#features">{t('nav.features')}</a>
          <a href="/#install">{t('nav.install')}</a>
        </div>
        <LanguageToggle />
        <a className="landing-nav-cta" href="/">
          {t('nav.backToSisu')}
        </a>
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

      <Footer full={false} />
    </main>
  );
}
