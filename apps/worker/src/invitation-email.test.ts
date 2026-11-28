import { describe, expect, it, vi } from "vitest";
import { invitationEmailProvider } from "./invitation-email.js";

describe("invitationEmailProvider", () => {
  it("builds a sender from the API's mail settings, without the product mail switch", () => {
    const onIncomplete = vi.fn();
    const email = invitationEmailProvider(
      {
        EMAIL_PROVIDER: "resend",
        EMAIL_API_KEY: "fake-key",
        EMAIL_FROM: "Wea <no-reply@example.test>",
      },
      onIncomplete,
    );
    expect(email).toBeDefined();
    expect(onIncomplete).not.toHaveBeenCalled();
  });

  it("has no sender when mail is not configured", () => {
    const onIncomplete = vi.fn();
    expect(invitationEmailProvider({}, onIncomplete)).toBeUndefined();
    expect(invitationEmailProvider({ EMAIL_PROVIDER: "none" }, onIncomplete)).toBeUndefined();
    expect(onIncomplete).not.toHaveBeenCalled();
  });

  it.each([
    ["Resend without a key", { EMAIL_PROVIDER: "resend", EMAIL_FROM: "no-reply@example.test" }],
    ["Resend without a sender", { EMAIL_PROVIDER: "resend", EMAIL_API_KEY: "fake-key" }],
    ["SMTP without a sender", { SMTP_URL: "smtps://user:fake@smtp.example.test:465" }],
    ["an unknown provider", { EMAIL_PROVIDER: "postmark" }],
  ])("has no sender, and does not throw, for %s", (_name, env) => {
    const onIncomplete = vi.fn();
    expect(invitationEmailProvider(env, onIncomplete)).toBeUndefined();
    expect(onIncomplete).toHaveBeenCalledOnce();
    expect(onIncomplete).toHaveBeenCalledWith();
  });
});
