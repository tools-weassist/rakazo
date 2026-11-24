import { Trans, useLingui } from "@lingui/react/macro";
import {
  WEA_ANDROID_DOWNLOAD_URL,
  WEA_DESKTOP_DOWNLOAD_URL,
  WEA_LOCKUP_DARK,
  WEA_LOCKUP_LIGHT,
  WEA_SUPPORT_URL,
} from "../lib/brand/wea";

/** The Wea logo with its tagline, swapping art for light and dark surfaces. */
export function WeaLockup() {
  const { t } = useLingui();
  return (
    <div data-rakazo-logo="" className="flex flex-col items-center gap-3">
      <img src={WEA_LOCKUP_LIGHT} alt={t`Wea`} className="h-14 w-auto dark:hidden" />
      <img src={WEA_LOCKUP_DARK} alt={t`Wea`} className="hidden h-14 w-auto dark:block" />
      <p className="text-body-sm text-muted-foreground">
        <Trans>Breathe, the busywork is handled.</Trans>
      </p>
    </div>
  );
}

const footerLinkClass = "underline underline-offset-2 hover:text-foreground";

/** The pilot notice and app download links shown under sign-in. */
export function WeaPilotFooter() {
  return (
    <p className="flex flex-wrap justify-center gap-x-3 px-6 pb-6 text-center text-body-sm text-muted-foreground">
      <span>
        <Trans>Wea is a WeAssist internal pilot</Trans>
      </span>
      <a className={footerLinkClass} href={WEA_DESKTOP_DOWNLOAD_URL}>
        <Trans>Desktop (Windows)</Trans>
      </a>
      <a className={footerLinkClass} href={WEA_ANDROID_DOWNLOAD_URL}>
        <Trans>Android</Trans>
      </a>
      <a className={footerLinkClass} href={WEA_SUPPORT_URL}>
        <Trans>Support</Trans>
      </a>
    </p>
  );
}
