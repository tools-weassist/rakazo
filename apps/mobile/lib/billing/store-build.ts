/**
 * Google Play builds sell nothing inside the app: Play's Payments policy requires Play Billing for
 * digital subscriptions bought in an app, and Wea bills through Stripe. A Play build is bundled
 * with EXPO_PUBLIC_WEA_STORE=play (scripts/wea-build-apk.sh sets it for app bundles), which hides
 * plans, prices, checkout and every Upgrade button. The web app and sideloaded APKs keep them.
 */
export function inAppPurchasesHidden(store = process.env.EXPO_PUBLIC_WEA_STORE): boolean {
  return store === "play";
}
