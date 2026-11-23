import * as z from "zod";

/**
 * Why a person reported a bot's message. Google Play asks AI chat apps to let people flag
 * offensive AI output without leaving the app; reports go to the people who run this server.
 */
export const CONTENT_REPORT_REASONS = ["offensive", "harmful", "other"] as const;
export const ContentReportReasonSchema = z.enum(CONTENT_REPORT_REASONS);
export type ContentReportReason = z.infer<typeof ContentReportReasonSchema>;

/** The feedback report kind a reported bot message is stored under. */
export const CONTENT_REPORT_KIND = "ai_content";
export const CONTENT_REPORT_DETAILS_MAX_LENGTH = 1_000;

/** Only a bot's own reply can be reported: people's messages and streaming placeholders can't. */
export function canReportThreadMessage(message: { id: string; role: string }): boolean {
  return message.role === "bot" && !message.id.startsWith("progress:");
}
