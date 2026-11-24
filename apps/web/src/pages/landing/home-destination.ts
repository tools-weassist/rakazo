/** Where a signed-out native client should go instead of the public landing page. */
export type SignedOutHome = "/sign-in" | "/sign-up";

/**
 * Desktop (and any other native shell) loads wea.weassist.io at `/`. Those clients
 * should keep the existing auth redirect so the app does not open on a marketing page.
 * Signed-out browser visitors stay on `/` and see the landing page (`null`).
 */
export function signedOutHomeDestination(options: {
  isNativeClient: boolean;
  hasSignedInBefore: boolean;
}): SignedOutHome | null {
  if (!options.isNativeClient) return null;
  return options.hasSignedInBefore ? "/sign-in" : "/sign-up";
}
