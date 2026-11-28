import { createHmac } from "node:crypto";
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
