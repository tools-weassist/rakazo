import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { WEA_LOCKUP_DARK, WEA_LOCKUP_LIGHT } from "../../lib/brand/wea";

/** Where people reach the Wea team about privacy and account deletion. */
export const WEA_PRIVACY_EMAIL = "tools@weassist.io";
export const PRIVACY_PATH = "/privacy";
export const DELETE_ACCOUNT_PATH = "/delete-account";
/** The public pages served without signing in (Google Play links to both). */
export const LEGAL_PATHS: readonly string[] = [PRIVACY_PATH, DELETE_ACCOUNT_PATH];
// TODO(Eric): confirm this date when the policy text is approved.
const LAST_UPDATED = "November 22, 2026";

export function isLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.includes(pathname.replace(/\/+$/, "") || "/");
}

/** The public legal page for a path: the privacy policy or account deletion. */
export function LegalPage({ pathname }: { pathname: string }) {
  return pathname.replace(/\/+$/, "") === DELETE_ACCOUNT_PATH ? (
    <DeleteAccountPage />
  ) : (
    <PrivacyPolicyPage />
  );
}

function LegalLayout({
  title,
  surface,
  children,
}: {
  title: string;
  surface: string;
  children: ReactNode;
}) {
  const { t } = useLingui();
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | Wea`;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <div className="h-full overflow-y-auto bg-background" data-rakazo-surface={surface}>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10 text-body text-foreground sm:py-14">
        <a href="/" className="self-start">
          <img src={WEA_LOCKUP_LIGHT} alt={t`Wea`} className="h-10 w-auto dark:hidden" />
          <img src={WEA_LOCKUP_DARK} alt={t`Wea`} className="hidden h-10 w-auto dark:block" />
        </a>
        <header className="flex flex-col gap-2">
          <h1 className="text-heading1 tracking-tight">{title}</h1>
          <p className="text-body-sm text-muted-foreground">
            <Trans>Last updated {LAST_UPDATED}</Trans>
          </p>
        </header>
        {children}
        <footer className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-4 text-body-sm text-muted-foreground">
          <a className="underline underline-offset-2 hover:text-foreground" href={PRIVACY_PATH}>
            <Trans>Privacy policy</Trans>
          </a>
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href={DELETE_ACCOUNT_PATH}
          >
            <Trans>Delete your account</Trans>
          </a>
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href={`mailto:${WEA_PRIVACY_EMAIL}`}
          >
            {WEA_PRIVACY_EMAIL}
          </a>
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-heading3">{title}</h2>
      {children}
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1.5 ps-5">{children}</ul>;
}

function Mail() {
  return (
    <a className="text-primary underline underline-offset-2" href={`mailto:${WEA_PRIVACY_EMAIL}`}>
      {WEA_PRIVACY_EMAIL}
    </a>
  );
}

export function PrivacyPolicyPage() {
  const { t } = useLingui();
  return (
    <LegalLayout title={t`Wea privacy policy`} surface="privacy-policy">
      <p>
        <Trans>
          Wea is an app from WeAssist that gives you AI bots to help with everyday work. This policy
          explains what Wea collects when you use the Wea apps for Android, iOS, desktop and the web
          at wea.weassist.io, how we use it, who we share it with and the choices you have.
        </Trans>
      </p>

      <Section title={<Trans>What we collect</Trans>}>
        <List>
          <li>
            <Trans>
              <strong>Account details:</strong> your name, email address and password (stored only
              as a secure hash). If you sign in with Google or Apple, we receive your name and email
              from them.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>What you put into Wea:</strong> your messages to bots and to people in shared
              spaces, the replies your bots write, bot instructions, notes and memories bots keep
              for you, routines, pages, and photos and files you attach or share into Wea.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Voice:</strong> when you start a voice call with a bot, your speech is turned
              into text so the bot can answer, and replies can be read aloud. We use the microphone
              only during a call you start.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Your device calendar:</strong> only if you allow it, bots read and add events
              in the calendars you choose.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Apps you connect:</strong> if you connect apps such as Gmail, Google Calendar,
              Google Drive, Slack, Notion or GitHub, your bots can read and act on data in those
              apps (for example emails, events, files and messages) to do the tasks you ask for. You
              choose which apps to connect and can disconnect them at any time.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Technical data:</strong> your IP address, device type, app version and sign-in
              sessions, used to keep your account secure, prevent abuse and keep Wea working. If you
              turn on notifications, we store a notification token for your device.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Payments:</strong> if you buy a plan on the web, our payment processor
              (Stripe) handles your card. We receive your plan and payment status, not your full
              card number.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Reports:</strong> when you report a bot's message, we keep the report, your
              reason and the message it refers to.
            </Trans>
          </li>
        </List>
        <p>
          <Trans>
            Wea does not show ads and does not use advertising or third-party analytics trackers.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>How we use it</Trans>}>
        <List>
          <li>
            <Trans>
              To run Wea: answering your messages, doing the tasks you ask bots to do and syncing
              your chats across devices.
            </Trans>
          </li>
          <li>
            <Trans>
              To keep Wea safe: securing accounts, preventing spam and abuse, and reviewing reported
              content.
            </Trans>
          </li>
          <li>
            <Trans>
              To contact you about your account, such as sign-in codes, password resets and
              important changes.
            </Trans>
          </li>
          <li>
            <Trans>To bill you if you are on a paid plan.</Trans>
          </li>
        </List>
        <p>
          <Trans>
            We do not sell your personal information, and we do not use your messages or connected
            app data to train AI models.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>AI processing</Trans>}>
        <p>
          <Trans>
            To write a reply, Wea sends the relevant part of your conversation, and any data a bot
            needs for the task, to the AI model provider that powers that bot (for example
            OpenRouter, Anthropic, Google or OpenAI). Voice calls use speech providers to turn
            speech into text and text into speech. Wea asks for your consent before sending your
            data to AI providers, and each provider handles it under its own privacy terms. If you
            connect your own AI account, your data goes to that provider under your agreement with
            them.
          </Trans>
        </p>
        <p>
          <Trans>
            On a voice call in Chrome or Edge without a voice provider connected, the browser sends
            your speech to Google or Microsoft to turn it into text. If you connect your own voice
            provider (for example OpenAI, ElevenLabs or Fish Audio), call audio and text go to that
            provider under its terms.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>Google user data</Trans>}>
        <p>
          <Trans>
            When you connect a Google account, Wea uses Google data only to provide the features you
            ask for, such as reading and drafting email, managing calendar events and finding files.
            Wea's use and transfer of information received from Google APIs adheres to the Google
            API Services User Data Policy, including the Limited Use requirements. We don't use
            Google data for ads, don't sell it, and don't let people read it except with your
            permission, for security, or when the law requires it.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>Who we share it with</Trans>}>
        <List>
          <li>
            <Trans>
              Service providers that run Wea for us: cloud hosting, AI model and speech providers,
              the services that connect your apps (such as Composio or Pipedream), email delivery
              and payment processing. They may use your data only to provide their service to us.
            </Trans>
          </li>
          <li>
            <Trans>
              People you choose to share with, such as members of a shared space or someone you send
              a page link to.
            </Trans>
          </li>
          <li>
            <Trans>Authorities, when the law requires it or to protect people from harm.</Trans>
          </li>
          <li>
            <Trans>
              A buyer or successor, if WeAssist's business is sold or merged, under this policy.
            </Trans>
          </li>
        </List>
      </Section>

      <Section title={<Trans>Security and where data is stored</Trans>}>
        <p>
          <Trans>
            Data is encrypted in transit, and chat content is encrypted at rest. Wea is hosted in
            the United States, and the WeAssist team that supports you works from the United States
            and the Philippines.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>How long we keep it</Trans>}>
        <p>
          <Trans>
            We keep your data while your account is open. When you delete your account, we delete
            your account and its content. Copies in backups are removed on their normal cycle, and
            we keep billing records as long as tax law requires.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>Your choices</Trans>}>
        <List>
          <li>
            <Trans>See and change your name and email in Settings.</Trans>
          </li>
          <li>
            <Trans>
              Disconnect connected apps, and turn off microphone, calendar, camera and notification
              access in your device settings.
            </Trans>
          </li>
          <li>
            <Trans>
              Delete your account in the app or on the web. See{" "}
              <a className="text-primary underline underline-offset-2" href={DELETE_ACCOUNT_PATH}>
                how to delete your Wea account
              </a>
              .
            </Trans>
          </li>
          <li>
            <Trans>
              Ask us for a copy of your data, a correction or deletion by emailing <Mail />.
            </Trans>
          </li>
        </List>
      </Section>

      <Section title={<Trans>Children</Trans>}>
        <p>
          <Trans>
            Wea is for adults. It is not meant for anyone under 18, and we don't knowingly collect
            data from children.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>Changes and contact</Trans>}>
        <p>
          <Trans>
            We will post changes to this policy on this page and tell you in the app or by email
            about important ones. Questions? Email <Mail />.
          </Trans>
        </p>
      </Section>
    </LegalLayout>
  );
}

export function DeleteAccountPage() {
  const { t } = useLingui();
  return (
    <LegalLayout title={t`Delete your Wea account`} surface="delete-account">
      <p>
        <Trans>
          You can delete your Wea account (by WeAssist) and its data at any time. You don't need to
          reinstall the app to do it.
        </Trans>
      </p>

      <Section title={<Trans>In the Wea app (Android and iOS)</Trans>}>
        <ol className="flex list-decimal flex-col gap-1.5 ps-5">
          <li>
            <Trans>Open Wea and go to Settings.</Trans>
          </li>
          <li>
            <Trans>Tap your name at the top to open your profile.</Trans>
          </li>
          <li>
            <Trans>Tap Delete account and confirm.</Trans>
          </li>
        </ol>
      </Section>

      <Section title={<Trans>On the web</Trans>}>
        <ol className="flex list-decimal flex-col gap-1.5 ps-5">
          <li>
            <Trans>
              Sign in at{" "}
              <a className="text-primary underline underline-offset-2" href="/sign-in">
                wea.weassist.io
              </a>
              .
            </Trans>
          </li>
          <li>
            <Trans>Open Settings and find the Account section.</Trans>
          </li>
          <li>
            <Trans>Choose Delete account and confirm.</Trans>
          </li>
        </ol>
      </Section>

      <Section title={<Trans>By email</Trans>}>
        <p>
          <Trans>
            If you can't sign in, email <Mail /> from the address on your account with the subject
            "Delete my Wea account". We will confirm it's you and delete the account within 30 days.
          </Trans>
        </p>
      </Section>

      <Section title={<Trans>What gets deleted</Trans>}>
        <p>
          <Trans>
            Your account, profile, bots, chats and messages, files and pages, memories, routines and
            links to connected apps are deleted, along with spaces only you use. If you own an
            organization that still has other members, remove them or delete the organization first.
          </Trans>
        </p>
        <p>
          <Trans>
            Copies in backups are removed on their normal cycle. We keep billing records as long as
            tax law requires. If you pay for a plan, deleting your account ends it.
          </Trans>
        </p>
      </Section>
    </LegalLayout>
  );
}
