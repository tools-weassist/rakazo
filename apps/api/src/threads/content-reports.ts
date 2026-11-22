import type { Actor, ContentReportReason } from "@rakazo/contracts";
import { CONTENT_REPORT_KIND } from "@rakazo/contracts";
import { ClientError } from "@rakazo/core";
import type { PrismaClient } from "@rakazo/db";

/** Enough for someone flagging a bad conversation; stops a script from filing hundreds. */
export const CONTENT_REPORTS_PER_HOUR = 20;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Saves a person's report of a bot message as a feedback report for the people who run this
 * server. Only a bot's reply in the chat the person can open can be reported. The report keeps
 * the ids, the reason and the person's note; the message itself stays where it is (encrypted
 * like the rest of the chat), so operators read it there.
 */
export async function reportThreadMessage(
  prisma: Pick<PrismaClient, "message" | "feedbackReport">,
  actor: Pick<Actor, "userId" | "spaceId">,
  threadId: string,
  input: { messageId: string; reason: ContentReportReason; details?: string },
): Promise<{ id: string }> {
  const message = await prisma.message.findFirst({
    where: { id: input.messageId, threadId },
    select: { id: true, role: true, botId: true, runId: true },
  });
  if (message?.role !== "bot" || !message.botId)
    throw new ClientError("NOT_FOUND", "Only a bot's message in this chat can be reported");
  const recent = await prisma.feedbackReport.count({
    where: {
      userId: actor.userId,
      kind: CONTENT_REPORT_KIND,
      createdAt: { gte: new Date(Date.now() - HOUR_MS) },
    },
  });
  if (recent >= CONTENT_REPORTS_PER_HOUR)
    throw new ClientError(
      "TOO_MANY_REQUESTS",
      "Too many reports in the last hour. Try again later.",
    );
  const details = input.details?.trim();
  return prisma.feedbackReport.create({
    data: {
      userId: actor.userId,
      spaceId: actor.spaceId,
      botId: message.botId,
      threadId,
      runId: message.runId,
      messageId: message.id,
      kind: CONTENT_REPORT_KIND,
      description: details ? `${input.reason}: ${details}` : input.reason,
    },
    select: { id: true },
  });
}
