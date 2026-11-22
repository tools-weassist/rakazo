-- Additive: people can report a bot's message from the chat. The previous release only counts and
-- inserts rows with a runId, so a nullable runId and a new nullable column don't affect it.
ALTER TABLE "feedback_reports" ALTER COLUMN "runId" DROP NOT NULL;
ALTER TABLE "feedback_reports" ADD COLUMN "messageId" TEXT;
