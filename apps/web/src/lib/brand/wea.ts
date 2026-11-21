// Wea branding for the WeAssist internal pilot. Wea is based on Rakazo by elie222 (Apache-2.0);
// see NOTICE. Kept in one module so the pilot's name, logo and support link change in one place.

/** Where "Support" points. A build can override it with VITE_WEA_SUPPORT_URL. */
export const WEA_SUPPORT_URL: string =
  (import.meta.env.VITE_WEA_SUPPORT_URL as string | undefined) || "mailto:tools@weassist.io";

/** The lockup (mark plus wordmark) for light and dark surfaces, served from apps/web/public. */
export const WEA_LOCKUP_LIGHT = "/brand/wea-lockup-light.svg";
export const WEA_LOCKUP_DARK = "/brand/wea-lockup-dark.svg";

/** Wea never asks pilot users to star the upstream GitHub repository. */
export const SHOW_UPSTREAM_STAR_PROMPT = false;
