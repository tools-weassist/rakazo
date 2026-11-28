import { createHmac } from "node:crypto";
import { resolveAuthSecret } from "@rakazo/core/node/secrets-guard";
import type { ExecutorDeps } from "./executor-deps.js";

/** The server key that names invited addresses in the security log, from the auth secret. */
export function invitationRecipientSecret(authSecret: string): string {
  return createHmac("sha256", authSecret).update("organization-invitation-recipient").digest("hex");
}

/**
 * What organization invites need: the web origin their links open, and an invited address as
 * the security log names it, so its daily limit outlives any deletion.
 */
export function invitationLinks(
  recipientSecret: string,
  webOrigin: string,
): NonNullable<ExecutorDeps["invitations"]> {
  return {
    webOrigin,
    recipientKey: (email) => createHmac("sha256", recipientSecret).update(email).digest("hex"),
  };
}

/**
 * invite_member links for a process without the API's env (the worker), keyed exactly as the API
 * keys them: the auth secret through resolveAuthSecret (same variable, same development fallback)
 * and WEB_ORIGIN with the API's default and trailing-slash rule, so an address has one daily
 * limit whichever process invites. Where the API would refuse to start, there are no invites.
 */
export function invitationLinksFromEnv(env: NodeJS.ProcessEnv): ExecutorDeps["invitations"] {
  let authSecret: string;
  try {
    authSecret = resolveAuthSecret(env);
  } catch {
    return undefined;
  }
  const webOrigin = (env.WEB_ORIGIN?.trim() || "http://127.0.0.1:5173").replace(/\/+$/, "");
  try {
    if (!["http:", "https:"].includes(new URL(webOrigin).protocol)) return undefined;
  } catch {
    return undefined;
  }
  return invitationLinks(invitationRecipientSecret(authSecret), webOrigin);
}
