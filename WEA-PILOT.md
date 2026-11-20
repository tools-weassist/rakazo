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

## Not yet rebranded

Remaining "Rakazo" strings in other screens, the desktop (Electron) and mobile (Expo) apps,
emails, bot system prompts and docs links to rakazo.com, and the mobile app store links. These
are follow-ups before any client sees Wea.
