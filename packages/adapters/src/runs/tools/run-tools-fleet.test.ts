import {
  AlreadyOrganizationMemberError,
  createOrganizationInvitation,
  createSpaceForMember,
  OrganizationAdminRequiredError,
  recordAuditEvent,
  SpaceLimitError,
} from "@rakazo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fleetTools } from "./run-tools-fleet.js";

// Creating a Space needs its tables; what this file checks is what the tool reports about it.
vi.mock("@rakazo/db", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createSpaceForMember: vi.fn(async (_prisma: unknown, input: { name: string }) => ({
    id: "space-2",
    name: input.name,
  })),
  recordAuditEvent: vi.fn(async () => undefined),
  runAsSystem: vi.fn(async (_reason: string, fn: () => unknown) => fn()),
  createOrganizationInvitation: vi.fn(async (_prisma: unknown, input: { email: string }) => ({
    id: "inv-1",
    email: input.email,
    organizationName: "Acme",
    inviterName: "Owner",
    created: true,
    send: false,
  })),
}));

function fakeRun() {
  const publishRosterChange = vi.fn(async () => undefined);
  const ctx = {
    deps: { prisma: {}, events: { publishRosterChange } },
    run: {
      id: "run-1",
      userId: "user-1",
      spaceId: "space-1",
      botId: "bot-1",
      threadId: "thread-1",
    },
    bot: { id: "bot-1", name: "Helper" },
  };
  const call = (args: Record<string, unknown>) =>
    fleetTools.create_space!(
      ctx as never,
      {
        name: "create_space",
        args,
        executionId: "call-1",
        finish: async (result: unknown) => result,
      } as never,
    );
  return { publishRosterChange, call };
}

beforeEach(() => {
  vi.mocked(recordAuditEvent).mockClear();
  vi.mocked(createOrganizationInvitation).mockClear();
});

describe("create_space", () => {
  it("records the creation and tells the member's apps to re-read their Space list", async () => {
    const { publishRosterChange, call } = fakeRun();
    await expect(call({ name: "Support" })).resolves.toEqual({
      ok: true,
      spaceId: "space-2",
      name: "Support",
    });
    expect(recordAuditEvent).toHaveBeenCalledExactlyOnceWith({
      action: "space.created",
      actor: { type: "bot", id: "bot-1", label: "Helper" },
      spaceId: "space-2",
      target: { type: "space", id: "space-2", label: "Support" },
      runId: "run-1",
      threadId: "thread-1",
    });
    expect(publishRosterChange).toHaveBeenCalledExactlyOnceWith({ userIds: ["user-1"] });
  });

  it("records nothing when the Space is refused", async () => {
    const { publishRosterChange, call } = fakeRun();
    vi.mocked(createSpaceForMember).mockRejectedValueOnce(new SpaceLimitError());
    await expect(call({ name: "Support" })).resolves.toHaveProperty("error");
    expect(recordAuditEvent).not.toHaveBeenCalled();
    expect(publishRosterChange).not.toHaveBeenCalled();
  });
});

function fakeInviteRun(
  options: {
    pending?: boolean;
    invitations?: boolean;
    role?: string;
    email?: (input: unknown) => Promise<boolean>;
  } = {},
) {
  const publishOrganizationChange = vi.fn(async () => undefined);
  const prisma = {
    space: { findUniqueOrThrow: vi.fn(async () => ({ organizationId: "org-1" })) },
    member: { findFirst: vi.fn(async () => ({ role: options.role ?? "owner" })) },
    invitation: {
      findFirst: vi.fn(async () => (options.pending ? { id: "inv-0" } : null)),
    },
  };
  const ctx = {
    deps: {
      prisma,
      events: { publishOrganizationChange },
      ...(options.invitations === false
        ? {}
        : {
            invitations: {
              webOrigin: "https://app.example.test",
              recipientKey: (email: string) => `key:${email}`,
              ...(options.email ? { email: options.email } : {}),
            },
          }),
    },
    run: {
      id: "run-1",
      userId: "user-1",
      spaceId: "space-1",
      botId: "bot-1",
      threadId: "thread-1",
    },
    bot: { id: "bot-1", name: "Helper" },
  };
  const call = (args: Record<string, unknown>) =>
    fleetTools.invite_member!(
      ctx as never,
      {
        name: "invite_member",
        args,
        executionId: "call-1",
        finish: async (result: unknown) => result,
      } as never,
    );
  return { publishOrganizationChange, call, prisma };
}

function sentInvitation(created: boolean, send: boolean, id = "inv-1") {
  return async (_prisma: unknown, input: { email: string }) => ({
    id,
    email: input.email,
    organizationName: "Acme",
    inviterName: "Owner",
    created,
    send,
  });
}

describe("invite_member", () => {
  it("creates the invite without email when this server sends none, and returns the link", async () => {
    const { publishOrganizationChange, call } = fakeInviteRun();
    await expect(call({ email: " Ana@Example.com " })).resolves.toEqual({
      ok: true,
      email: "ana@example.com",
      url: "https://app.example.test/join/inv-1",
      emailed: false,
      note: "No email was sent. Give this link to the person you invited.",
    });
    expect(createOrganizationInvitation).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        userId: "user-1",
        email: "ana@example.com",
        sendsEmail: false,
      }),
    );
    expect(recordAuditEvent).toHaveBeenCalledExactlyOnceWith({
      action: "organization.invitation.created",
      actor: { type: "bot", id: "bot-1", label: "Helper" },
      organizationId: "org-1",
      target: { type: "invitation", id: "inv-1" },
      runId: "run-1",
      threadId: "thread-1",
    });
    expect(publishOrganizationChange).toHaveBeenCalledExactlyOnceWith("org-1");
  });

  it("emails the invite through the Members screen's path when this server sends email", async () => {
    const email = vi.fn(async (_input: unknown) => true);
    vi.mocked(createOrganizationInvitation).mockImplementationOnce(sentInvitation(true, true));
    const { call } = fakeInviteRun({ email });
    await expect(call({ email: "ana@example.com" })).resolves.toMatchObject({
      ok: true,
      url: "https://app.example.test/join/inv-1",
      emailed: true,
      note: "The invite was emailed to ana@example.com. You can also send them this link.",
    });
    expect(createOrganizationInvitation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sendsEmail: true }),
    );
    expect(email).toHaveBeenCalledExactlyOnceWith({
      inviterId: "user-1",
      invitation: expect.objectContaining({ email: "ana@example.com", organizationName: "Acme" }),
      url: "https://app.example.test/join/inv-1",
    });
  });

  it("returns the link without emailing once the address hit its daily limit", async () => {
    const email = vi.fn(async (_input: unknown) => true);
    vi.mocked(createOrganizationInvitation).mockImplementationOnce(
      sentInvitation(false, false, "inv-0"),
    );
    const { call } = fakeInviteRun({ email, pending: true });
    await expect(call({ email: "ana@example.com" })).resolves.toEqual({
      ok: true,
      email: "ana@example.com",
      url: "https://app.example.test/join/inv-0",
      emailed: false,
      note: "No email was sent. Give this link to the person you invited.",
    });
    expect(email).not.toHaveBeenCalled();
    expect(recordAuditEvent).not.toHaveBeenCalled();
  });

  it("still returns the link when the email did not go out", async () => {
    vi.mocked(createOrganizationInvitation).mockImplementationOnce(sentInvitation(true, true));
    const { call } = fakeInviteRun({ email: async () => false });
    await expect(call({ email: "ana@example.com" })).resolves.toMatchObject({
      ok: true,
      url: "https://app.example.test/join/inv-1",
      emailed: false,
    });
  });

  it.each([[""], ["not-an-email"], ["a@"], [undefined]])(
    "refuses %j and creates nothing",
    async (email) => {
      const { call } = fakeInviteRun();
      await expect(call({ email })).resolves.toEqual({
        error: "That is not a valid email address.",
      });
      expect(createOrganizationInvitation).not.toHaveBeenCalled();
      expect(recordAuditEvent).not.toHaveBeenCalled();
    },
  );

  it("tells a member who is not an owner or admin that they cannot invite", async () => {
    const { publishOrganizationChange, call, prisma } = fakeInviteRun({
      role: "member",
      pending: true,
    });
    vi.mocked(createOrganizationInvitation).mockRejectedValueOnce(
      new OrganizationAdminRequiredError(),
    );
    await expect(call({ email: "ana@example.com" })).resolves.toEqual({
      error: "Only the organization's owner or an admin can invite people.",
    });
    // A member never learns whether an invite is pending.
    expect(prisma.invitation.findFirst).not.toHaveBeenCalled();
    expect(recordAuditEvent).not.toHaveBeenCalled();
    expect(publishOrganizationChange).not.toHaveBeenCalled();
  });

  it("says when the address is already a member", async () => {
    const { call } = fakeInviteRun();
    vi.mocked(createOrganizationInvitation).mockRejectedValueOnce(
      new AlreadyOrganizationMemberError(),
    );
    await expect(call({ email: "ana@example.com" })).resolves.toEqual({
      error: "ana@example.com is already a member of this organization.",
    });
    expect(recordAuditEvent).not.toHaveBeenCalled();
  });

  it("warns that a replaced pending invite's old link no longer works", async () => {
    const { call } = fakeInviteRun({ pending: true });
    await expect(call({ email: "ana@example.com" })).resolves.toEqual({
      ok: true,
      email: "ana@example.com",
      url: "https://app.example.test/join/inv-1",
      emailed: false,
      note: "No email was sent. Give this link to the person you invited. The earlier invite link for this address no longer works.",
      replacedPending: true,
    });
  });

  it("refuses when this server cannot make invite links", async () => {
    const { call } = fakeInviteRun({ invitations: false });
    await expect(call({ email: "ana@example.com" })).resolves.toHaveProperty("error");
    expect(createOrganizationInvitation).not.toHaveBeenCalled();
  });
});
