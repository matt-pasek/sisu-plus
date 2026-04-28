import { ProductPreview } from '@/landing/components/ProductPreview';
import Plasma from '@/landing/components/Plasma';

const roadmap = [
  {
    version: 'v1.0.0',
    title: 'Initial release',
    status: 'Shipping now',
    items: ['Personal dashboard', 'Moodle deadline view', 'Editable study timeline', 'Prerequisite warnings'],
    current: true,
  },
  {
    version: 'Next',
    title: 'More planning help',
    status: 'In progress',
    items: ['Cleaner course details', 'Calendar-first study planning', 'Better empty states', 'More timeline guidance'],
  },
  {
    version: 'Later',
    title: 'Campus expansion',
    status: 'Planned',
    items: ['More Sisu universities', 'Feedback-led improvements', 'Mobile layout polish', 'Faster setup'],
  },
];

const privacyPoints = [
  'Works inside Sisu, right in your browser tab',
  'Reads your courses and schedule the same way you do',
  'Saves your settings on your device, not on our servers',
  'Your data never leaves your computer',
];

const policySections = [
  {
    title: 'Data handled by the extension',
    body: [
      "Sisu+ may access data from the user's active Sisu session, including study plans, courses, credits, enrolments, progress information, and related study planning data available to the logged-in user on supported Sisu domains such as https://sisu.lut.fi and https://sisu.lab.fi.",
      'Sisu+ may temporarily read Sisu authorization headers and required session cookies in order to request Sisu API data on behalf of the logged-in user.',
      'If the user enables Moodle deadline integration, Sisu+ stores the Moodle calendar URL provided by the user and uses it to fetch calendar and deadline data.',
      'Sisu+ stores extension preferences, settings, enabled or disabled state, and Moodle configuration in Chrome storage.',
    ],
  },
  {
    title: 'How data is used',
    body: [
      'The data is used only to provide Sisu+ features inside the browser, including dashboard views, study progress, timeline planning, course information, and optional Moodle deadline display.',
    ],
  },
  {
    title: 'Data sharing',
    body: [
      'Sisu+ does not sell user data.',
      'Sisu+ does not use user data for advertising.',
      "Sisu+ does not send user data to the developer's own servers.",
      "Sisu+ communicates with Sisu and Moodle only as needed to provide the extension's user-facing features.",
    ],
  },
  {
    title: 'Data storage',
    body: [
      "Sisu+ stores settings and temporary session information using Chrome's extension storage APIs. Authentication and session data is used only to access Sisu data for the current browser session.",
    ],
  },
  {
    title: 'Remote code',
    body: ['Sisu+ does not execute remote JavaScript or remote code.'],
  },
  {
    title: 'Contact',
    body: ['For questions about this privacy policy, contact contact@matt-pasek.dev.'],
  },
];

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

export function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <a href="#roadmap">Roadmap</a>
        </div>
        <a className="landing-nav-cta" {...chromeStoreLinkProps}>
          Add to Chrome
        </a>
      </nav>
      <section className="landing-hero" id="top">
        <div className="landing-aurora">
          <Plasma color="#419648" speed={0.6} direction="forward" scale={1.1} opacity={0.8} mouseInteractive={true} />
        </div>
        <div className="landing-hero-copy">
          <div className="landing-badge">
            <span>New</span>
            <p>v{import.meta.env.VITE_APP_VERSION} just shipped</p>
          </div>
          <h1>
            The Sisu we deserve, <span>finally.</span>
          </h1>
          <p>
            A browser extension that reimagines your Sisu experience. Cleaner dashboard, study timeline, Moodle
            integration, and more. For students, by student.
          </p>
          <div className="landing-actions">
            <a className="landing-primary" {...chromeStoreLinkProps}>
              Add to Chrome - free
            </a>
            <a className="landing-secondary" href="https://github.com/matt-pasek/sisu-plus">
              <GithubIcon />
              Source code
            </a>
            <a className="landing-secondary" href="#features">
              See what changed
            </a>
          </div>
          <p className="landing-mobile-note">Sisu+ experience is not yet optimized for mobile devices.</p>
        </div>
        <div className="landing-preview-wrap">
          <ProductPreview />
        </div>
      </section>

      <section className="landing-section landing-feature-band landing-reveal" id="features">
        <div>
          <p className="landing-kicker">Dashboard and timeline</p>
          <h2>Less digging, more knowing what to do next.</h2>
          <p className="landing-section-copy">
            The first release tackles the stuff that costs you the most time: checking where you stand, keeping up with
            Moodle deadlines, and moving courses around without accidentally breaking your prerequisites.
          </p>
        </div>
        <div className="landing-feature-list">
          <article className="landing-interactive-card">
            <h3>Dashboard that starts useful</h3>
            <p>Credits, grades, study right, active courses, and deadlines are pulled into one quiet overview.</p>
          </article>
          <article className="landing-interactive-card">
            <h3>Timeline you can edit</h3>
            <p>
              Move planned courses between periods, review the changes, then confirm the updated timing back to Sisu.
            </p>
          </article>
          <article className="landing-interactive-card">
            <h3>Warnings when they matter</h3>
            <p>Prerequisite and timing issues stay out of the way until you start changing the plan.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-privacy landing-reveal" id="privacy">
        <div>
          <p className="landing-kicker">Your browser, your data</p>
          <h2>Your data stays on your computer. Full stop.</h2>
          <p className="landing-section-copy">
            Sisu+ works directly inside Sisu — no account, no server, no one storing your study plan somewhere else.
            Everything stays in your browser, exactly where you left it.
          </p>
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
          <p className="landing-kicker">What's coming</p>
          <h2>Fixing the things that actually slow you down.</h2>
          <p className="landing-section-copy">
            The plan is pretty straightforward: fewer clicks to find what you need, clearer course info, and a timeline
            that doesn't make you guess. Supported universities first, then more campuses as requests come in.
          </p>
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
          <p className="landing-kicker">Support the project</p>
          <h2 id="support-heading">Enjoy Sisu+ and want to support development?</h2>
          <p>
            Get me a strawberry-lime energy drink on Ko-fi and I will deliver new features even quicker! It helps cover
            the small costs and late-night polish passes that keep Sisu+ moving.
          </p>
        </div>
        <a
          className="landing-support-card"
          href="https://ko-fi.com/mattpasek"
          target="_blank"
          rel="noreferrer"
          aria-label="Support Sisu+ development on Ko-fi"
        >
          <span className="landing-support-icon">
            <EnergyDrinkIcon />
          </span>
          <span>
            <strong>Feed me with batteries</strong>
            <small>(Ko-fi opens in a new tab)</small>
          </span>
        </a>
      </section>

      <section className="landing-universities landing-reveal" id="install">
        <div className="landing-university-heading">
          <p className="landing-kicker">Where it works</p>
          <h2>Your university, your Sisu+.</h2>
        </div>

        <div className="landing-university-panel">
          <div className="landing-university-left">
            <div className="landing-live-label">
              <span />
              Live universities
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
            <h3>Want it at your university?</h3>
            <p>
              Sisu+ is built to support Finnish universities running Sisu. If your university is not listed, send me the
              Sisu URL and I can check support.
            </p>
            <div className="landing-request-steps">
              <div>
                <span>1</span>
                <p>
                  <strong>Email me</strong> with your university name and Sisu URL
                </p>
              </div>
              <div>
                <span>2</span>
                <p>We collaborate to make sure everything works</p>
              </div>
              <div>
                <span>3</span>
                <p>Your campus gets the same cleaner dashboard and timeline</p>
              </div>
            </div>
            <a href="mailto:contact@matt-pasek.dev?subject=Sisu%2B university support">
              <MailIcon />
              Email me to add your university
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-left">
          <Logo />
          <p>
            &copy; {new Date().getFullYear()} Mateusz Pasek. All rights reserved.
            <br />
            <span>Not affiliated with any supported university or Funidata Oy.</span>
          </p>
        </div>
        <div className="landing-footer-links">
          <a href="/privacy">Privacy policy</a>
          <a href="https://github.com/matt-pasek/sisu-plus">Source code</a>
          <a href="https://ko-fi.com/mattpasek" target="_blank" rel="noreferrer">
            Support development
          </a>
          <a href="mailto:contact@matt-pasek.dev">Contact</a>
          <a href="https://github.com/matt-pasek">
            <GithubIcon />
            My GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}

export function PrivacyPolicyPage() {
  return (
    <main className="landing-page privacy-page">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-nav-links">
          <a href="/">Home</a>
          <a href="/#features">Features</a>
          <a href="/#install">Install</a>
        </div>
        <a className="landing-nav-cta" href="/">
          Back to Sisu+
        </a>
      </nav>

      <section className="privacy-document">
        <p className="landing-kicker">Privacy policy</p>
        <h1>Privacy Policy for Sisu+</h1>
        <p className="privacy-effective-date">Effective date: April 26, 2026</p>
        <p className="privacy-intro">
          Sisu+ is a browser extension that improves the Sisu student planning experience.
        </p>

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

      <footer className="landing-footer">
        <div className="landing-footer-left">
          <Logo />
          <p>
            &copy; {new Date().getFullYear()} Mateusz Pasek. All rights reserved.
            <br />
            <span>Not affiliated with any supported university or Funidata Oy.</span>
          </p>
        </div>
        <div className="landing-footer-links">
          <a href="/">Home</a>
          <a href="https://github.com/matt-pasek/sisu-plus">Source code</a>
          <a href="mailto:contact@matt-pasek.dev">Contact</a>
        </div>
      </footer>
    </main>
  );
}
