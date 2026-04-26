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
  'Runs as a browser extension on top of Sisu.',
  'Reads the same student pages and APIs you already use.',
  'Keeps settings in your browser storage.',
  'Does not run a separate student-data backend.',
];

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
        <a className="landing-nav-cta" href="#install">
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
            <p>v1.0.0 just shipped</p>
          </div>
          <h1>
            The Sisu we deserve, <span>finally.</span>
          </h1>
          <p>
            A browser extension that reimagines your Sisu experience. Cleaner dashboard, study timeline, Moodle
            integration, and more. For students, by student.
          </p>
          <div className="landing-actions">
            <a className="landing-primary" href="#install">
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
            The first release focuses on the student workflow that needs the most context: checking progress, keeping up
            with Moodle, and moving courses through a plan without losing track of prerequisites.
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
          <h2>No separate student-data service hiding behind it.</h2>
          <p className="landing-section-copy">
            Sisu+ is just an extension layered on top of the pages you already open. It improves the interface locally,
            stores preferences in the browser, and does not upload your study plan to a separate Sisu+ backend.
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
          <h2>Built around actual student friction.</h2>
          <p className="landing-section-copy">
            The roadmap stays customer-facing: more clarity, less clicking, faster planning, and support for more
            students when the core LUT experience is stable.
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
                <div>
                  <h3>LUT University</h3>
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
            <span>Not affiliated with LUT University or Funidata Oy.</span>
          </p>
        </div>
        <div className="landing-footer-links">
          <a href="https://github.com/matt-pasek/sisu-plus">Source code</a>
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
