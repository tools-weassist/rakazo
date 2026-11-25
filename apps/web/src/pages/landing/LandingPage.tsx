import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_ANDROID_VERSION,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DESKTOP_VERSION,
  WEA_DOWNLOAD_PATH,
  WEA_SUPPORT_URL,
} from "../../lib/brand/wea";
import { BreathLine } from "./BreathLine";
import { ConnectSections } from "./ConnectSections";
import { DevicesShowcase } from "./DevicesShowcase";
import { TeamPicker } from "./TeamPicker";
import "./landing.css";
import "./motion/wea-motion.css";

const LANDING_TITLE = "Wea, breathe, the busywork is handled";
const DEFAULT_TITLE = "Wea";
const HERO_CHAT_ARIA =
  "The Wea app. Each bot drafts its work, waits for your yes, then marks it done. Inbox and admin triage sends three replies, Calendar keeper moves a call to Thursday, and Morning briefing shares your day.";

const FEATURES = [
  {
    id: "one-job",
    title: "Each bot has one job",
    body: "Inbox and admin triage, Calendar keeper, Content calendar, Lead follow-up. One clear job per bot keeps the work tidy and easy to check.",
    art: "feature-one-job.svg",
  },
  {
    id: "asks-first",
    title: "Wea asks before it acts",
    body: "Bots draft the work and ask before they send or change something, unless you choose to let some actions through. You stay in charge while the busywork gets done.",
    art: "feature-asks-first.svg",
  },
  {
    id: "handoff",
    title: "Bots hand off to each other",
    body: "When a task needs another skill, one bot passes it to the next and keeps you in the loop.",
    art: "feature-handoff.svg",
  },
  {
    id: "learns",
    title: "It learns how you work",
    body: "Tell Wea something once, like how you file receipts, and it remembers and can suggest a monthly reminder.",
    art: "feature-learns.svg",
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Pick your bots",
    body: "Choose the jobs you want off your plate, like your inbox, calendar or posts.",
  },
  {
    n: "2",
    title: "Hand off the busywork",
    body: "Tell Wea what you need in plain words. Your bots split the work and get going.",
  },
  {
    n: "3",
    title: "Review and say yes",
    body: "Wea shows you the finished draft or plan. Bots draft the work and ask before they send or change something, unless you choose to let some actions through.",
  },
] as const;

const FAQS = [
  {
    q: "What is Wea?",
    a: "Wea gives you teams of AI bots that take care of everyday busywork for business owners, outsourced professionals or virtual assistants. Each bot has one job, and they work together.",
  },
  {
    q: "Does Wea do things without asking?",
    a: "Bots draft the work and ask before they send or change something, unless you choose to let some actions through.",
  },
  {
    q: "Who is Wea for?",
    a: "Business owners who want time back, and outsourced professionals or virtual assistants who manage work for several clients.",
  },
  {
    q: "Where can I use Wea?",
    a: "On web, desktop and phone. Open Wea in a modern browser on your computer or your phone and sign in with the same account.",
  },
  {
    q: "What do I need to get started?",
    a: "Create an account, then connect your own AI provider. Sign in with ChatGPT, GitHub Copilot or SuperGrok, or paste an API key. Wea works in your browser, on Windows and on Android.",
  },
  {
    q: "How do I get help?",
    a: "Email tools@weassist.io and we will get back to you.",
  },
] as const;

type HeroSecondary = {
  href: string;
  label: "Download for Windows" | "Download for Android" | "Sign in";
};

/** Public marketing page at `/` for signed-out browser visitors. */
export function LandingPage() {
  const { t } = useLingui();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSecondary, setHeroSecondary] = useState<HeroSecondary>({
    href: "#download",
    label: "Download for Windows",
  });
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = LANDING_TITLE;
    return () => {
      document.title = previous || DEFAULT_TITLE;
    };
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || import.meta.env.MODE === "test") return;
    let stop = () => {};
    let cancelled = false;
    void import("./motion/init-landing-motion").then((mod) => {
      if (cancelled) return;
      stop = mod.initLandingMotion(root);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      setHeroSecondary({ href: WEA_ANDROID_DOWNLOAD_URL, label: "Download for Android" });
    } else if (/Windows/i.test(ua)) {
      setHeroSecondary({ href: WEA_DESKTOP_DOWNLOAD_URL, label: "Download for Windows" });
    } else {
      setHeroSecondary({ href: "/sign-in", label: "Sign in" });
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = [...menuRef.current.querySelectorAll<HTMLElement>("a, button")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="wea-landing" ref={pageRef} data-testid="landing-page" data-theme="light">
      <a className="wea-skip" href="#main">
        <Trans>Skip to content</Trans>
      </a>
      <header className="wea-nav">
        <div className="wea-wrap wea-nav-inner">
          <a className="wea-logo" href="#top" aria-label={t`Wea`}>
            <img src="/landing/wea-lockup-light.svg" alt="" />
          </a>
          <nav aria-label={t`Main`}>
            <ul className="wea-nav-links">
              <li>
                <a href="#bots">
                  <Trans>Bots</Trans>
                </a>
              </li>
              <li>
                <a href="#features">
                  <Trans>Features</Trans>
                </a>
              </li>
              <li>
                <a href="#how">
                  <Trans>How it works</Trans>
                </a>
              </li>
              <li>
                <a href="#download">
                  <Trans>Download</Trans>
                </a>
              </li>
              <li>
                <a href="#faq">
                  <Trans>FAQ</Trans>
                </a>
              </li>
            </ul>
          </nav>
          <div className="wea-nav-right">
            <Link className="wea-signin" to="/sign-in">
              <Trans>Sign in</Trans>
            </Link>
            <Link className="wea-btn wea-btn-primary wea-btn-sm" to="/sign-up">
              <Trans>Get started</Trans>
            </Link>
          </div>
          <button
            ref={menuBtnRef}
            className="wea-menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t`Close menu` : t`Open menu`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
        <div
          ref={menuRef}
          id={menuId}
          className={`wea-menu${menuOpen ? " is-open" : ""}`}
          hidden={!menuOpen}
        >
          <a href="#bots" onClick={closeMenu}>
            <Trans>Bots</Trans>
          </a>
          <a href="#features" onClick={closeMenu}>
            <Trans>Features</Trans>
          </a>
          <a href="#how" onClick={closeMenu}>
            <Trans>How it works</Trans>
          </a>
          <a href="#download" onClick={closeMenu}>
            <Trans>Download</Trans>
          </a>
          <a href="#faq" onClick={closeMenu}>
            <Trans>FAQ</Trans>
          </a>
          <Link to="/sign-in" onClick={closeMenu}>
            <Trans>Sign in</Trans>
          </Link>
          <Link className="wea-btn wea-btn-primary" to="/sign-up" onClick={closeMenu}>
            <Trans>Get started</Trans>
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="wea-hero" id="top">
          <div className="wea-wrap">
            <p className="wea-pill" data-hero-in="">
              <i aria-hidden="true" />
              <Trans>Wea for web, Windows and Android</Trans>
            </p>
            <h1 data-hero-in="">
              <Trans>Breathe, the busywork is handled.</Trans>
            </h1>
            <p className="wea-lead" data-hero-in="">
              <Trans>
                Wea gives business owners, outsourced professionals or virtual assistants teams of
                AI{"\u00A0"}bots. They draft, schedule and follow up, then wait for your yes.
              </Trans>
            </p>
            <div className="wea-ctas" data-hero-in="">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
              <HeroSecondaryLink link={heroSecondary} />
            </div>
            <p className="wea-micro" data-hero-in="">
              <Trans>
                Also on the web and Android. See <a href="#download">Download</a> for install tips.
              </Trans>
            </p>
            <div className="wea-hero-visual" data-hero-in="">
              <div
                data-wea-chat=""
                data-mark="/landing/wea-mark-light.svg"
                aria-label={HERO_CHAT_ARIA}
              >
                <picture>
                  <source media="(max-width: 760px)" srcSet="/landing/wea-hero-app-mobile.svg" />
                  <img
                    src="/landing/wea-hero-app.svg"
                    alt={t`The Wea app. Inbox and admin triage drafts three replies and asks before sending, then Calendar keeper asks you to approve a Thursday slot.`}
                  />
                </picture>
              </div>
            </div>
          </div>
        </section>

        <TeamPicker />

        <section className="wea-sec">
          <div className="wea-wrap">
            <div className="wea-split" data-reveal-group="">
              <h2 data-reveal="">
                <Trans>Work with Wea like a calm, capable team</Trans>
              </h2>
              <div data-reveal="">
                <p>
                  <Trans>
                    Hand Wea the jobs that eat your day: replies, scheduling, posts and follow ups.
                  </Trans>
                </p>
                <p>
                  <Trans>
                    Each bot takes its part, checks in when it needs you, and comes back with
                    finished work.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="wea-sec" id="features" style={{ paddingTop: 0 }}>
          <div className="wea-wrap">
            <div className="wea-center" data-reveal="">
              <h2>
                <Trans>Help that lets you breathe</Trans>
              </h2>
              <p className="wea-lead">
                <Trans>
                  Give each bot its own job, and add another when the work grows. You keep the final
                  say on everything.
                </Trans>
              </p>
            </div>
            <div className="wea-grid2" data-reveal-group="">
              {FEATURES.map((feature) => (
                <article
                  className="wea-card"
                  key={feature.id}
                  data-testid={`feature-${feature.id}`}
                  data-reveal="scale"
                >
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <div className="wm-img">
                    <img src={`/landing/${feature.art}`} alt="" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wea-sec wea-dark" id="how">
          <div className="wea-wrap">
            <div className="wea-center" data-reveal="">
              <h2>
                <Trans>Three steps to a lighter day</Trans>
              </h2>
              <p className="wea-lead">
                <Trans>Start with one bot. Add more when you are ready.</Trans>
              </p>
            </div>
            <div className="wea-steps" data-reveal-group="">
              {STEPS.map((step) => (
                <article className="wea-step" key={step.n} data-reveal="">
                  <div className="wea-step-n" aria-hidden="true">
                    {step.n}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
            <div className="wea-ctas" data-reveal="">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
            </div>
          </div>
        </section>

        <section className="wea-sec" aria-labelledby="landing-audience">
          <div className="wea-wrap">
            <div className="wea-center" data-reveal="">
              <h2 id="landing-audience">
                <Trans>Made for the people who keep things moving</Trans>
              </h2>
            </div>
            <div className="wea-aud" data-reveal-group="">
              <article className="wea-card" data-reveal="scale">
                <h3>
                  <Trans>For business owners</Trans>
                </h3>
                <p>
                  <Trans>
                    Spend your day on clients and growth. Wea clears the busywork and keeps your
                    list moving.
                  </Trans>
                </p>
                <ul>
                  <AudienceItem>
                    <Trans>Replies drafted in your tone</Trans>
                  </AudienceItem>
                  <AudienceItem>
                    <Trans>Calls and reminders kept on track</Trans>
                  </AudienceItem>
                  <AudienceItem>
                    <Trans>Posts ready for your review</Trans>
                  </AudienceItem>
                </ul>
              </article>
              <article className="wea-card" data-reveal="scale">
                <h3>
                  <Trans>For outsourced professionals or virtual assistants</Trans>
                </h3>
                <p>
                  <Trans>
                    Handle more client work with less juggling. Wea drafts, tracks and reminds, and
                    you give the final yes.
                  </Trans>
                </p>
                <ul>
                  <AudienceItem>
                    <Trans>A bot for each repeat task</Trans>
                  </AudienceItem>
                  <AudienceItem>
                    <Trans>Follow ups that never slip</Trans>
                  </AudienceItem>
                  <AudienceItem>
                    <Trans>Every action checked by you first</Trans>
                  </AudienceItem>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="wea-sec" id="download" style={{ paddingTop: 0 }}>
          <div className="wea-wrap">
            <div className="wea-split">
              <div data-reveal="">
                <h2>
                  <Trans>Wea goes where you work</Trans>
                </h2>
                <p className="wea-lead" style={{ marginTop: 18 }}>
                  <Trans>
                    Use it in your browser, on your Windows desktop and on your Android phone. Sign
                    in with the same account on each.
                  </Trans>
                </p>
              </div>
              <div className="wea-plat-rows" data-reveal-group="">
                <div className="wea-plat" data-reveal="">
                  <div className="wea-plat-ic" aria-hidden="true">
                    <GlobeIcon />
                  </div>
                  <div>
                    <b>
                      <Trans>Web</Trans>
                    </b>
                    <span>
                      <Trans>Works in any modern browser</Trans>
                    </span>
                  </div>
                  <Link className="wea-btn wea-btn-primary wea-btn-sm" to="/sign-up">
                    <Trans>Get started</Trans>
                  </Link>
                </div>
                <div className="wea-plat" data-reveal="">
                  <div className="wea-plat-ic" aria-hidden="true">
                    <MonitorIcon />
                  </div>
                  <div>
                    <b>
                      <Trans>Windows</Trans>
                    </b>
                    <span>
                      <Trans>
                        Desktop app, version {WEA_DESKTOP_VERSION}, about 136 MB. Not in the
                        Microsoft Store.
                      </Trans>
                    </span>
                  </div>
                  <a className="wea-btn wea-btn-ghost wea-btn-sm" href={WEA_DESKTOP_DOWNLOAD_URL}>
                    <DownloadIcon />
                    <Trans>Download for Windows</Trans>
                  </a>
                </div>
                <div className="wea-plat" data-reveal="">
                  <div className="wea-plat-ic" aria-hidden="true">
                    <PhoneIcon />
                  </div>
                  <div>
                    <b>
                      <Trans>Android</Trans>
                    </b>
                    <span>
                      <Trans>Phone app, version {WEA_ANDROID_VERSION}, direct APK.</Trans>
                    </span>
                  </div>
                  <a className="wea-btn wea-btn-ghost wea-btn-sm" href={WEA_ANDROID_DOWNLOAD_URL}>
                    <DownloadIcon />
                    <Trans>Download for Android</Trans>
                  </a>
                </div>
              </div>
            </div>
            <p className="wea-tips">
              <Link to={WEA_DOWNLOAD_PATH}>
                <Trans>Install tips and checksums</Trans>
              </Link>
            </p>
            <DevicesShowcase />
          </div>
        </section>

        <ConnectSections />

        <section className="wea-sec wea-faq" id="faq">
          <div className="wea-wrap wea-split" data-reveal-group="">
            <h2 data-reveal="">
              <Trans>Questions</Trans>
            </h2>
            <div className="wea-faq-list" data-reveal="">
              {FAQS.map((item, index) => (
                <details key={item.q} open={index === 0}>
                  <summary>{item.q}</summary>
                  {item.q === "How do I get help?" ? (
                    <p>
                      <Trans>
                        Email <a href={WEA_SUPPORT_URL}>tools@weassist.io</a> and we will get back
                        to you.
                      </Trans>
                    </p>
                  ) : (
                    <p>{item.a}</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="wea-final">
          <div className="wea-wrap" data-reveal-group="">
            <div className="wm-trio" data-reveal="" aria-hidden="true">
              <span data-wea-bot="inbox-admin-triage" data-size="56" />
              <span data-wea-bot="morning-briefing" data-size="64" />
              <span data-wea-bot="calendar-keeper" data-size="56" />
            </div>
            <h2 data-reveal="">
              <Trans>Take a breath. Wea has the list.</Trans>
            </h2>
            <p className="wea-lead" data-reveal="">
              <Trans>Start with one bot today and add more when you are ready.</Trans>
            </p>
            <div className="wea-ctas" data-reveal="">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
              <Link className="wea-btn wea-btn-ghost" to="/sign-in">
                <Trans>Sign in</Trans>
              </Link>
            </div>
          </div>
          <BreathLine />
        </section>
      </main>

      <footer className="wea-footer">
        <div className="wea-wrap">
          <div className="wea-footer-cols">
            <div className="wea-footer-brand">
              <a className="wea-logo" href="#top" aria-label={t`Wea`}>
                <img src="/landing/wea-lockup-light.svg" alt="" />
              </a>
              <p className="wea-footer-tag">
                <Trans>Breathe, the busywork is handled.</Trans>
              </p>
            </div>
            <div>
              <h3>
                <Trans>Product</Trans>
              </h3>
              <ul>
                <li>
                  <a href="#bots">
                    <Trans>Bots</Trans>
                  </a>
                </li>
                <li>
                  <a href="#features">
                    <Trans>Features</Trans>
                  </a>
                </li>
                <li>
                  <a href="#how">
                    <Trans>How it works</Trans>
                  </a>
                </li>
                <li>
                  <a href="#faq">
                    <Trans>FAQ</Trans>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3>
                <Trans>Download</Trans>
              </h3>
              <ul>
                <li>
                  <Link to="/sign-up">
                    <Trans>Web app</Trans>
                  </Link>
                </li>
                <li>
                  <a href={WEA_DESKTOP_DOWNLOAD_URL}>
                    <Trans>Windows</Trans>
                  </a>
                </li>
                <li>
                  <a href={WEA_ANDROID_DOWNLOAD_URL}>
                    <Trans>Android</Trans>
                  </a>
                </li>
                <li>
                  <Link to={WEA_DOWNLOAD_PATH}>
                    <Trans>Install tips</Trans>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="wea-footer-pilot">
            <a href={WEA_DESKTOP_DOWNLOAD_URL}>
              <Trans>Desktop (Windows)</Trans>
            </a>
            <a href={WEA_ANDROID_DOWNLOAD_URL}>
              <Trans>Android</Trans>
            </a>
            <a href={WEA_SUPPORT_URL}>
              <Trans>Support</Trans>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroSecondaryLink({ link }: { link: HeroSecondary }) {
  const inner = (
    <>
      {link.label !== "Sign in" ? <DownloadIcon /> : null}
      {link.label}
    </>
  );
  if (link.href.startsWith("/")) {
    return (
      <Link className="wea-btn wea-btn-ghost" to={link.href}>
        {inner}
      </Link>
    );
  }
  return (
    <a className="wea-btn wea-btn-ghost" href={link.href}>
      {inner}
    </a>
  );
}

function AudienceItem({ children }: { children: ReactNode }) {
  return (
    <li>
      <CheckIcon />
      {children}
    </li>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 4h18v12H3zM9 20h6M12 16v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 18h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
