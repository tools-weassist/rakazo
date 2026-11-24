import { Trans } from "@lingui/react/macro";
import { Link } from "react-router-dom";
import { WeaLockup, WeaPilotFooter } from "../components/WeaBrand";
import { WindowChrome } from "../components/WindowChrome";
import {
  WEA_ANDROID_APK_SHA256,
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_ANDROID_VERSION,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_DESKTOP_SETUP_SHA256,
  WEA_DESKTOP_VERSION,
  WEA_SUPPORT_URL,
} from "../lib/brand/wea";

const downloadButtonClass =
  "inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-heading3 text-foreground transition hover:scale-[1.02]";

/** Public Desktop and Android download page. No sign-in required. */
export function DownloadPage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground" data-testid="download-page">
      <div className="app-drag flex items-center gap-2 px-5 py-[18px]">
        <WindowChrome />
      </div>
      <main className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-10 px-6 pb-12 pt-4">
        <div className="flex flex-col items-center text-center">
          <WeaLockup />
          <h1 className="mt-7 text-balance text-display font-medium tracking-tight">
            <Trans>Download Wea</Trans>
          </h1>
          <p className="mt-3 text-body text-muted-foreground">
            <Trans>Install the Windows or Android app, or use Wea in your browser.</Trans>
          </p>
        </div>

        <section className="flex flex-col gap-3" id="windows" aria-labelledby="download-windows">
          <h2 id="download-windows" className="text-heading2 font-medium">
            <Trans>Desktop (Windows)</Trans>
          </h2>
          <p className="text-body text-muted-foreground">
            <Trans>Version {WEA_DESKTOP_VERSION}.</Trans>
          </p>
          <p>
            <a className={downloadButtonClass} href={WEA_DESKTOP_DOWNLOAD_URL}>
              <Trans>Download Wea for Windows</Trans>
            </a>
          </p>
          <p className="text-body-sm text-muted-foreground">
            <Trans>
              This installer is unsigned, so Windows SmartScreen may warn you. Choose More info,
              then Run anyway.
            </Trans>
          </p>
          <p className="text-body-sm text-muted-foreground">
            <Trans>Mac and Linux installers are coming later.</Trans>
          </p>
          <Checksum value={WEA_DESKTOP_SETUP_SHA256} />
        </section>

        <section className="flex flex-col gap-3" id="android" aria-labelledby="download-android">
          <h2 id="download-android" className="text-heading2 font-medium">
            <Trans>Android</Trans>
          </h2>
          <p className="text-body text-muted-foreground">
            <Trans>Version {WEA_ANDROID_VERSION}. Package io.weassist.wea.</Trans>
          </p>
          <p>
            <a className={downloadButtonClass} href={WEA_ANDROID_DOWNLOAD_URL}>
              <Trans>Download the Wea Android app</Trans>
            </a>
          </p>
          <p className="text-body-sm text-muted-foreground">
            <Trans>
              This is a direct APK, not yet on Google Play. You may need to allow installs from
              unknown apps in your phone's settings.
            </Trans>
          </p>
          <Checksum value={WEA_ANDROID_APK_SHA256} />
        </section>

        <p className="text-center text-body-sm text-muted-foreground">
          <Link className="underline underline-offset-2 hover:text-foreground" to="/sign-in">
            <Trans>Sign in</Trans>
          </Link>
          <span className="px-2">·</span>
          <a className="underline underline-offset-2 hover:text-foreground" href={WEA_SUPPORT_URL}>
            <Trans>Support</Trans>
          </a>
        </p>
      </main>
      <WeaPilotFooter />
    </div>
  );
}

function Checksum({ value }: { value: string }) {
  return (
    <p className="text-body-sm text-muted-foreground">
      <span className="me-2">SHA256</span>
      <code className="break-all font-mono text-[0.85em] text-foreground">{value}</code>
    </p>
  );
}
