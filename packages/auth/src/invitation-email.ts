import type { TransactionalEmail, TransactionalEmailProvider } from "@rakazo/adapter-kit";
import type { PrismaClient } from "@rakazo/db";
import { emailLocale } from "./email.js";
import { organizationInvitationEmail } from "./organization-invitation-email.js";

type InvitationEmailDeps = {
  prisma: PrismaClient;
  email?: TransactionalEmailProvider;
  onEmailError?: (error: unknown) => void;
};

/** Whether the email went out; when it did not, the inviter shares the link by hand. */
export async function sendInvitationEmail(
  deps: InvitationEmailDeps,
  inviterId: string,
  to: string,
  build: (locale: string) => Promise<TransactionalEmail>,
): Promise<boolean> {
  if (!deps.email) return false;
  // The invitation is saved by now: whatever stops the email, the inviter still gets the link.
  try {
    // The invitee's own language when they have an account here, else the inviter's.
    const [invitee, inviter] = await Promise.all([
      deps.prisma.user.findFirst({
        where: { email: { equals: to, mode: "insensitive" } },
        select: { locale: true },
      }),
      deps.prisma.user.findUnique({ where: { id: inviterId }, select: { locale: true } }),
    ]);
    await deps.email.send(await build(emailLocale(invitee?.locale ?? inviter?.locale)));
    return true;
  } catch (error) {
    deps.onEmailError?.(error);
    return false;
  }
}

/**
 * invite_member's email sender: the Members screen's path, for the API and the worker alike.
 * Undefined without an email provider, and the owner shares the link by hand.
 */
export function organizationInvitationSender(deps: InvitationEmailDeps) {
  if (!deps.email) return undefined;
  return ({
    inviterId,
    invitation,
    url,
  }: {
    inviterId: string;
    invitation: { email: string; organizationName: string; inviterName: string };
    url: string;
  }) =>
    sendInvitationEmail(deps, inviterId, invitation.email, (locale) =>
      organizationInvitationEmail(invitation.email, { ...invitation, url }, locale),
    );
}
