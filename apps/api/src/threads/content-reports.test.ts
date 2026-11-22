import { CONTENT_REPORT_KIND } from "@rakazo/contracts";
import { describe, expect, it, vi } from "vitest";
import { CONTENT_REPORTS_PER_HOUR, reportThreadMessage } from "./content-reports.js";

const actor = { userId: "user-1", spaceId: "space-1" };

function fakePrisma(
  message: { id: string; role: string; botId: string | null; runId: string | null } | null,
  recent = 0,
) {
  const create = vi.fn(async () => ({ id: "report-1" }));
  const findFirst = vi.fn(async () => message);
  const count = vi.fn(async () => recent);
  const prisma = { message: { findFirst }, feedbackReport: { count, create } };
  return { prisma: prisma as never, create, findFirst, count };
}

describe("reportThreadMessage", () => {
  it("stores a bot message report with the reason and note", async () => {
    const { prisma, create, findFirst } = fakePrisma({
      id: "msg-1",
      role: "bot",
      botId: "bot-1",
      runId: "run-1",
    });
    await expect(
      reportThreadMessage(prisma, actor, "thread-1", {
        messageId: "msg-1",
        reason: "offensive",
        details: "  rude reply  ",
      }),
    ).resolves.toEqual({ id: "report-1" });
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "msg-1", threadId: "thread-1" } }),
    );
    expect(create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        spaceId: "space-1",
        botId: "bot-1",
        threadId: "thread-1",
        runId: "run-1",
        messageId: "msg-1",
        kind: CONTENT_REPORT_KIND,
        description: "offensive: rude reply",
      },
      select: { id: true },
    });
  });

  it("keeps a message without a run and stores only the reason when there is no note", async () => {
    const { prisma, create } = fakePrisma({
      id: "msg-2",
      role: "bot",
      botId: "bot-1",
      runId: null,
    });
    await reportThreadMessage(prisma, actor, "thread-1", { messageId: "msg-2", reason: "harmful" });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ runId: null, description: "harmful" }),
      }),
    );
  });

  it("refuses people's messages and messages outside the chat", async () => {
    for (const message of [{ id: "msg-3", role: "user", botId: null, runId: null }, null]) {
      const { prisma, create } = fakePrisma(message);
      await expect(
        reportThreadMessage(prisma, actor, "thread-1", { messageId: "msg-3", reason: "other" }),
      ).rejects.toMatchObject({ kind: "NOT_FOUND" });
      expect(create).not.toHaveBeenCalled();
    }
  });

  it("limits how many reports one person files in an hour", async () => {
    const { prisma, create } = fakePrisma(
      { id: "msg-1", role: "bot", botId: "bot-1", runId: "run-1" },
      CONTENT_REPORTS_PER_HOUR,
    );
    await expect(
      reportThreadMessage(prisma, actor, "thread-1", { messageId: "msg-1", reason: "other" }),
    ).rejects.toMatchObject({ kind: "TOO_MANY_REQUESTS" });
    expect(create).not.toHaveBeenCalled();
  });
});
