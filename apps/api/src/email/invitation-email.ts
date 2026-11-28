import { invitationLinks } from "@rakazo/adapters";
import type { RouterDeps } from "../router.js";

/** Names an invited address in the security log, so its daily limit outlives any deletion. */
export function invitationRecipientKey(deps: RouterDeps) {
  return invitationLinks(deps.env.invitationRecipientKey, deps.env.webOrigin).recipientKey;
}
