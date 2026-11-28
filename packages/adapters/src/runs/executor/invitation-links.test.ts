import { DEV_AUTH_SECRET_PLACEHOLDER } from "@rakazo/core/node/secrets-guard";
import { describe, expect, it } from "vitest";
import {
  invitationLinks,
  invitationLinksFromEnv,
  invitationRecipientSecret,
} from "./invitation-links.js";

const SECRET = " a-production-auth-secret-of-32-chars ";

function apiKey(authSecret: string, email: string): string {
  // What apps/api builds from env.authSecret, which resolveAuthSecret hands over untrimmed.
  return invitationLinks(
    invitationRecipientSecret(authSecret),
    "https://app.example.com",
  ).recipientKey(email);
}

describe("invitationLinksFromEnv", () => {
  it("keys an address exactly as the API does, from the untrimmed secret", () => {
    const links = invitationLinksFromEnv({
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: SECRET,
      WEB_ORIGIN: "https://app.example.com/",
    });
    expect(links?.webOrigin).toBe("https://app.example.com");
    expect(links?.recipientKey("ana@example.com")).toBe(apiKey(SECRET, "ana@example.com"));
  });

  it("uses the API's development fallback secret and default origin", () => {
    const links = invitationLinksFromEnv({ NODE_ENV: "development" });
    expect(links?.webOrigin).toBe("http://127.0.0.1:5173");
    expect(links?.recipientKey("ana@example.com")).toBe(
      apiKey(DEV_AUTH_SECRET_PLACEHOLDER, "ana@example.com"),
    );
  });

  it("offers no invites where the API would refuse to start", () => {
    expect(invitationLinksFromEnv({ NODE_ENV: "production" })).toBeUndefined();
    expect(
      invitationLinksFromEnv({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: DEV_AUTH_SECRET_PLACEHOLDER,
      }),
    ).toBeUndefined();
    expect(
      invitationLinksFromEnv({
        NODE_ENV: "production",
        BETTER_AUTH_SECRET: SECRET,
        WEB_ORIGIN: "ftp://app.example.com",
      }),
    ).toBeUndefined();
  });
});
