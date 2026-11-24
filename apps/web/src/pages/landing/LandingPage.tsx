import { Trans, useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WindowChrome } from "../../components/WindowChrome";
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DOWNLOAD_PATH,
  WEA_LOCKUP_DARK,
  WEA_LOCKUP_LIGHT,
  WEA_SUPPORT_URL,
} from "../../lib/brand/wea";

const DEFAULT_TITLE = "Wea";
const LANDING_TITLE = "Wea — Breathe, the busywork is handled.";

const primaryCtaClass =
  "inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-heading3 text-background transition hover:opacity-90";
const secondaryCtaClass =
  "inline-flex items-center justify-center rounded-full bg-muted px-5 py-2.5 text-heading3 text-foreground transition hover:opacity-90";
const navLinkClass = "text-body text-muted-foreground hover:text-foreground";
const placeholderClass =
  "rounded-xl border border-dashed border-border bg-muted/40 text-body-sm text-muted-foreground";
const heroTitleClass =
  // off-scale: marketing titles, not the in-app 32px display size
  "text-balance text-[2.5rem] font-medium leading-none tracking-tight sm:text-[3.75rem] sm:leading-none";
const sectionTitleClass =
  // off-scale: marketing titles, not the in-app 32px display size
  "text-[2rem] font-medium leading-tight tracking-tight sm:text-[3rem] sm:leading-none";

const PERSONAS = [
  { id: "business_owner", label: "Business owner" },
  { id: "va", label: "Virtual assistant (VA)" },
  { id: "agency", label: "VA agency or team" },
  { id: "exploring", label: "Just exploring" },
] as const;

const FEATURES = [
  "feature-initiative",
  "feature-computer",
  "feature-show",
  "feature-meetings",
  "feature-team",
  "feature-memory",
] as const;

const GUIDES = ["guide-1", "guide-2", "guide-3"] as const;

const FAQS = ["faq-1", "faq-2", "faq-3", "faq-4"] as const;

/** Public marketing page at `/` for signed-out browser visitors. */
export function LandingPage() {
  const { t } = useLingui();
  const [persona, setPersona] = useState<(typeof PERSONAS)[number]["id"]>("business_owner");

  useEffect(() => {
    const previous = document.title;
    document.title = LANDING_TITLE;
    return () => {
      document.title = previous || DEFAULT_TITLE;
    };
  }, []);

  return (
    <div
      className="min-h-full bg-background text-foreground"
      data-testid="landing-page"
    >
      <div className="app-drag flex items-center gap-2 px-5 pt-[18px]">
        <WindowChrome />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="shrink-0" aria-label={t`Wea`}>
          <img src={WEA_LOCKUP_LIGHT} alt="" className="h-8 w-auto dark:hidden" />
          <img src={WEA_LOCKUP_DARK} alt="" className="hidden h-8 w-auto dark:block" />
        </Link>
        <nav aria-label={t`Landing`} className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link className={`${navLinkClass} hidden sm:inline`} to={WEA_DOWNLOAD_PATH}>
            <Trans>Download</Trans>
          </Link>
          <Link className={navLinkClass} to="/sign-in">
            <Trans>Sign in</Trans>
          </Link>
          <Link className={primaryCtaClass} to="/sign-up">
            <Trans>Get started</Trans>
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-10 text-center sm:pt-16">
          <h1 className={heroTitleClass}>
            <Trans>Meet Wea</Trans>
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-body-lg text-muted-foreground sm:text-heading3">
            <Trans>Breathe, the busywork is handled.</Trans>
          </p>
          <p className="mt-2 text-body-sm text-muted-foreground">
            <Trans>Hero subhead (placeholder)</Trans>
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link className={primaryCtaClass} to="/sign-up">
              <Trans>Get started</Trans>
            </Link>
            <Link className={secondaryCtaClass} to="/sign-in">
              <Trans>Sign in</Trans>
            </Link>
          </div>
          <div
            className={`${placeholderClass} mt-12 flex min-h-64 w-full max-w-3xl items-center justify-center p-8`}
            data-testid="landing-hero-preview"
          >
            <Trans>Product preview (placeholder)</Trans>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-2 sm:items-center">
          <h2 className={sectionTitleClass}>
            <Trans>Intro headline (placeholder)</Trans>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            <Trans>Intro body (placeholder)</Trans>
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10" aria-label={t`Media`}>
          <div
            className={`${placeholderClass} flex min-h-56 items-center justify-center p-8 sm:min-h-80`}
            data-testid="landing-media"
          >
            <Trans>Media / video (placeholder)</Trans>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="landing-features">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="landing-features" className={sectionTitleClass}>
              <Trans>Features headline (placeholder)</Trans>
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              <Trans>Features subhead (placeholder)</Trans>
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((id, index) => (
              <article key={id} className="rounded-2xl bg-muted/60 p-6" data-testid={id}>
                <h3 className="text-heading3 font-medium">
                  <Trans>Feature {index + 1} (placeholder)</Trans>
                </h3>
                <p className="mt-2 text-body text-muted-foreground">
                  <Trans>Feature description (placeholder)</Trans>
                </p>
                <div className={`${placeholderClass} mt-6 flex min-h-36 items-center justify-center`}>
                  <Trans>Feature art (placeholder)</Trans>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="landing-jobs">
          <h2 id="landing-jobs" className={sectionTitleClass}>
            <Trans>Jobs headline (placeholder)</Trans>
          </h2>
          <div className="mt-8 flex flex-wrap gap-2" role="list">
            {PERSONAS.map((item) => {
              const selected = item.id === persona;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  aria-pressed={selected}
                  className={`rounded-full px-4 py-2 text-body transition ${
                    selected ? "bg-foreground text-background" : "bg-muted text-foreground"
                  }`}
                  onClick={() => setPersona(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
            <Trans>Persona description (placeholder)</Trans>
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 text-center" aria-labelledby="landing-pricing">
          <h2 id="landing-pricing" className={sectionTitleClass}>
            <Trans>Pricing (placeholder)</Trans>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground">
            <Trans>Plans will be listed here when billing is public.</Trans>
          </p>
        </section>

        <section
          className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-2 sm:items-center"
          aria-labelledby="landing-download"
        >
          <div>
            <h2 id="landing-download" className={sectionTitleClass}>
              <Trans>Download Wea</Trans>
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              <Trans>Windows and Android apps, or use Wea in your browser.</Trans>
            </p>
            <p className="mt-3 text-body-sm text-muted-foreground">
              <Link className="underline underline-offset-2 hover:text-foreground" to={WEA_DOWNLOAD_PATH}>
                <Trans>Install tips and checksums</Trans>
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a className={secondaryCtaClass} href={WEA_DESKTOP_DOWNLOAD_URL}>
              <Trans>Desktop (Windows)</Trans>
            </a>
            <a className={secondaryCtaClass} href={WEA_ANDROID_DOWNLOAD_URL}>
              <Trans>Android</Trans>
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="landing-guides">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="landing-guides" className={sectionTitleClass}>
              <Trans>Guides (placeholder)</Trans>
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              <Trans>Guide list (placeholder)</Trans>
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {GUIDES.map((id, index) => (
              <article key={id} className="rounded-2xl bg-muted/60 p-6 text-left" data-testid={id}>
                <div className={`${placeholderClass} mb-5 min-h-28`} />
                <h3 className="text-heading3 font-medium">
                  <Trans>Guide {index + 1} (placeholder)</Trans>
                </h3>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          aria-labelledby="landing-faq"
        >
          <h2 id="landing-faq" className={sectionTitleClass}>
            <Trans>FAQs</Trans>
          </h2>
          <div className="divide-y divide-border">
            {FAQS.map((id, index) => (
              <details key={id} className="py-4" data-testid={id}>
                <summary className="cursor-pointer text-heading3 font-medium">
                  <Trans>Question {index + 1} (placeholder)</Trans>
                </summary>
                <p className="mt-3 text-body text-muted-foreground">
                  <Trans>Answer (placeholder)</Trans>
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
          <h2 className={sectionTitleClass}>
            <Trans>Closing headline (placeholder)</Trans>
          </h2>
          <p className="mt-4 text-body-lg text-muted-foreground">
            <Trans>Closing subhead (placeholder)</Trans>
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link className={primaryCtaClass} to="/sign-up">
              <Trans>Get started</Trans>
            </Link>
            <Link className={secondaryCtaClass} to="/sign-in">
              <Trans>Sign in</Trans>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-body-sm text-muted-foreground">
        <p>
          <Trans>Wea</Trans>
        </p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link className="underline underline-offset-2 hover:text-foreground" to={WEA_DOWNLOAD_PATH}>
            <Trans>Download</Trans>
          </Link>
          <Link className="underline underline-offset-2 hover:text-foreground" to="/sign-in">
            <Trans>Sign in</Trans>
          </Link>
          <a className="underline underline-offset-2 hover:text-foreground" href={WEA_SUPPORT_URL}>
            <Trans>Support</Trans>
          </a>
        </p>
      </footer>
    </div>
  );
}
