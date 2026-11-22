# Wea (WeAssist internal pilot)

Wea is based on [Rakazo](https://github.com/elie222/rakazo) by elie222, Apache-2.0. `LICENSE` and
the upstream `NOTICE` text are unchanged; the Wea attribution is appended to `NOTICE`.

Tagline: Breathe, the busywork is handled.

## What this fork changes

- Web app name, page title, PWA manifest name and sign-in heading read "Wea".
- Favicons, app icons and the sign-in logo use the Wea brand pack (concept C "Breathe").
- Web color tokens: primary buttons, hover, focus ring and links use the Wea teal
  (light `#067A8F` / hover `#05616F`, accent `#0698B2`; dark `#07C2E4` / hover `#38D3EE`
  with Ink Navy `#142134` text). Light links use `#05616F` to keep WCAG AA on cards.
- Sign-in shows the tagline and "Wea is a WeAssist internal pilot" with a Support link.
- The account menu adds **Support** (default `mailto:tools@weassist.io`, override at build
  time with `VITE_WEA_SUPPORT_URL`) and the pilot notice.
- The "Star on GitHub" prompt for the upstream repository is turned off.

Brand constants live in `apps/web/src/lib/brand/wea.ts` and `apps/web/src/components/WeaBrand.tsx`.

## Telemetry

Upstream ships analytics and error reporting off by default (`ANALYTICS_PROVIDER=none`, empty
`PUBLIC_POSTHOG_KEY`, `SENTRY_DSN`, `CRISP_WEBSITE_ID`); keep them empty. Turborepo prints an
anonymous telemetry notice during `pnpm dev`; run `pnpm exec turbo telemetry disable` or set
`TURBO_TELEMETRY_DISABLED=1` on machines that run the dev stack.

## Android app (Expo, `apps/mobile`)

- App name Wea, Android package and iOS bundle id `io.weassist.wea`, Wea icon, adaptive and
  monochrome icons, splash and notification icon made from `apps/web/public/favicon.svg`.
- Permission prompts and the main sign-in and welcome screens say Wea.
- A release build opens to `https://wea.weassist.io` (`WEA_API` in `lib/api/server-config.ts`);
  the server screen can still point the app elsewhere. `EXPO_PUBLIC_API_URL` overrides it.
- Nothing points at upstream services: no Expo owner, no EAS project id, OTA updates off.
  Error reporting only starts if the server hands out a Sentry DSN, and Wea's does not.
- Push notifications are off until a Wea Firebase project and EAS project exist; the app
  skips push registration without them.
- `apps/mobile/scripts/wea-build-apk.sh` builds a release-signed APK on a local machine.
  `WEA_OUTPUT=aab` builds the Google Play app bundle instead (`bundleRelease`), with
  `EXPO_PUBLIC_WEA_STORE=play` so the Play build shows no plans, prices or checkout.
  The keystore is never committed. Keep it: every update must be signed with the same key.

## Not yet rebranded

Remaining "Rakazo" strings in other screens, the desktop (Electron) and mobile (Expo) apps,
emails, bot system prompts and docs links to rakazo.com, and the mobile app store links. These
are follow-ups before any client sees Wea.
