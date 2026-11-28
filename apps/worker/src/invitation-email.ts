import type { TransactionalEmailProvider } from "@rakazo/adapter-kit";
import { configuredEmailProvider } from "@rakazo/adapters";

/**
 * The account mail provider for organization invites only, read from the same settings the API
 * reads (EMAIL_PROVIDER, EMAIL_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, SMTP_URL), so a bot's
 * approved invite is emailed whichever process runs it. Lifecycle mail stays behind
 * WELCOME_EMAIL_ENABLED. Missing or incomplete settings give no provider rather than an error:
 * the owner gets the link, and incomplete mail settings never stop the worker.
 */
export function invitationEmailProvider(
  env: NodeJS.ProcessEnv,
  onIncomplete?: () => void,
): TransactionalEmailProvider | undefined {
  try {
    return configuredEmailProvider({
      provider: env.EMAIL_PROVIDER?.trim() || undefined,
      apiKey: env.EMAIL_API_KEY?.trim() || undefined,
      from: env.EMAIL_FROM?.trim() || undefined,
      replyTo: env.EMAIL_REPLY_TO?.trim() || undefined,
      smtpUrl: env.SMTP_URL?.trim() || undefined,
    });
  } catch {
    // The error can quote the settings (an SMTP URL holds a password), so it is not passed on.
    onIncomplete?.();
    return undefined;
  }
}
