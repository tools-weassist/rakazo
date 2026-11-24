import { Trans, useLingui } from "@lingui/react/macro";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_ANDROID_VERSION,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DESKTOP_VERSION,
  WEA_DOWNLOAD_PATH,
  WEA_SUPPORT_URL,
} from "../../lib/brand/wea";
import "./landing.css";

const LANDING_TITLE = "Wea, breathe, the busywork is handled";
const DEFAULT_TITLE = "Wea";

const BOTS = [
  { id: "inbox", file: "bot-inbox.svg", name: "Inbox triage" },
  { id: "calendar", file: "bot-calendar.svg", name: "Calendar keeper" },
  { id: "content", file: "bot-content.svg", name: "Content calendar" },
  { id: "follow-up", file: "bot-follow-up.svg", name: "Lead follow-up" },
  { id: "research", file: "bot-research.svg", name: "Topic watch" },
  { id: "books", file: "bot-books.svg", name: "Receipt sorter" },
] as const;

const FEATURES = [
  {
    id: "one-job",
    title: "Each bot has one job",
    body: "Inbox triage, Calendar keeper, Content calendar, Lead follow-up. One clear job per bot keeps the work tidy and easy to check.",
    art: "feature-one-job.svg",
  },
  {
    id: "asks-first",
    title: "Wea asks before it acts",
    body: "Every email, post and change waits for your yes. You stay in charge while the busywork gets done.",
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
    body: "Wea shows you the finished draft or plan. Nothing goes out until you approve it.",
  },
] as const;

const FAQS = [
  {
    q: "What is Wea?",
    a: "Wea is a small team of AI bots that take care of everyday busywork for business owners and virtual assistants. Each bot has one job, and they work together.",
  },
  {
    q: "Does Wea do things without asking?",
    a: "No. Wea shows you what it plans to do and waits for your yes before it sends, posts or changes anything.",
  },
  {
    q: "Who is Wea for?",
    a: "Business owners who want time back, and virtual assistants who manage work for several clients.",
  },
  {
    q: "Where can I use Wea?",
    a: "In your browser, on Windows desktop and on Android. Sign in with the same account on each.",
  },
  {
    q: "What do I need to get started?",
    a: "Create an account, then connect your own AI provider key. Wea works in your browser, on Windows and on Android.",
  },
  {
    q: "How do I get help?",
    a: "Email tools@weassist.io and we will get back to you.",
  },
] as const;

type HeroSecondary = { href: string; label: "Download for Windows" | "Download for Android" | "Sign in" };

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

  useEffect(() => {
    const previous = document.title;
    document.title = LANDING_TITLE;
    return () => {
      document.title = previous || DEFAULT_TITLE;
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
    <div className="wea-landing" data-testid="landing-page" data-theme="light">
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
            <p className="wea-pill wea-hero-copy">
              <i aria-hidden="true" />
              <Trans>Wea for web, Windows and Android</Trans>
            </p>
            <h1 className="wea-hero-copy">
              <Trans>Breathe, the busywork is handled.</Trans>
            </h1>
            <p className="wea-lead wea-hero-copy">
              <Trans>
                Wea is a small team of AI bots for business owners and virtual assistants. They
                draft, schedule and follow up, then wait for your yes.
              </Trans>
            </p>
            <div className="wea-ctas wea-hero-copy">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
              <HeroSecondaryLink link={heroSecondary} />
            </div>
            <p className="wea-micro wea-hero-copy">
              <Trans>
                Also on the web and Android. See <a href="#download">Download</a> for install tips.
              </Trans>
            </p>
            <div className="wea-hero-visual">
              <picture>
                <source media="(max-width: 760px)" srcSet="/landing/wea-hero-app-mobile.svg" />
                <img
                  src="/landing/wea-hero-app.svg"
                  alt={t`The Wea app. Inbox triage drafts three replies and asks before sending, then Calendar keeper asks you to approve a Thursday slot.`}
                />
              </picture>
            </div>
          </div>
        </section>

        <section className="wea-sec">
          <div className="wea-wrap">
            <Reveal className="wea-split">
              <h2>
                <Trans>Work with Wea like a small, calm team</Trans>
              </h2>
              <div>
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
            </Reveal>
            <ul className="wea-bots" aria-label={t`Wea's starter bots`}>
              {BOTS.map((bot) => (
                <li key={bot.id}>
                  <img src={`/landing/bots/${bot.file}`} alt="" width={72} height={72} />
                  {bot.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="wea-sec" id="features" style={{ paddingTop: 0 }}>
          <div className="wea-wrap">
            <Reveal className="wea-center">
              <h2>
                <Trans>Help that lets you breathe</Trans>
              </h2>
              <p className="wea-lead">
                <Trans>
                  Give each bot its own job, and add another when the work grows. You keep the final
                  say on everything.
                </Trans>
              </p>
            </Reveal>
            <div className="wea-grid2">
              {FEATURES.map((feature) => (
                <article className="wea-card" key={feature.id} data-testid={`feature-${feature.id}`}>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <img src={`/landing/${feature.art}`} alt="" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wea-sec wea-dark" id="how">
          <div className="wea-wrap">
            <Reveal className="wea-center">
              <h2>
                <Trans>Three steps to a lighter day</Trans>
              </h2>
              <p className="wea-lead">
                <Trans>Start with one bot. Add more when you are ready.</Trans>
              </p>
            </Reveal>
            <div className="wea-steps">
              {STEPS.map((step) => (
                <article className="wea-step" key={step.n}>
                  <div className="wea-step-n" aria-hidden="true">
                    {step.n}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
            <div className="wea-ctas">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
            </div>
          </div>
        </section>

        <section className="wea-sec" aria-labelledby="landing-audience">
          <div className="wea-wrap">
            <Reveal className="wea-center">
              <h2 id="landing-audience">
                <Trans>Made for the people who keep things moving</Trans>
              </h2>
            </Reveal>
            <div className="wea-aud">
              <article className="wea-card">
                <h3>
                  <Trans>For business owners</Trans>
                </h3>
                <p>
                  <Trans>
                    Spend your day on clients and growth. Wea clears the small stuff and keeps your
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
              <article className="wea-card">
                <h3>
                  <Trans>For virtual assistants</Trans>
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
              <div>
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
              <div className="wea-plat-rows">
                <div className="wea-plat">
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
                <div className="wea-plat">
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
                <div className="wea-plat">
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
            <div className="wea-devices">
              <img
                src="/landing/wea-devices.svg"
                alt={t`Wea on the web, on a Windows desktop and on an Android phone.`}
              />
            </div>
          </div>
        </section>

        <section className="wea-sec wea-faq" id="faq">
          <div className="wea-wrap wea-split">
            <h2>
              <Trans>Questions</Trans>
            </h2>
            <div className="wea-faq-list">
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
          <div className="wea-wrap">
            <h2>
              <Trans>Take a breath. Wea has the list.</Trans>
            </h2>
            <p className="wea-lead">
              <Trans>Start with one bot today and add more when you are ready.</Trans>
            </p>
            <div className="wea-ctas">
              <Link className="wea-btn wea-btn-primary" to="/sign-up">
                <Trans>Get started</Trans>
              </Link>
              <Link className="wea-btn wea-btn-ghost" to="/sign-in">
                <Trans>Sign in</Trans>
              </Link>
            </div>
          </div>
          <div className="wea-breath" aria-hidden="true">
            <img src="/landing/breath-line.svg" alt="" />
          </div>
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
            <span>
              <Trans>Wea is a WeAssist internal pilot</Trans>
            </span>
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

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;
    el.classList.add("is-pending");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.remove("is-pending");
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`wea-reveal${className ? ` ${className}` : ""}`}>
      {children}
    </div>
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 18h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
