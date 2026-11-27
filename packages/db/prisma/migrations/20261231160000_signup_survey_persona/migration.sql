-- Wea onboarding: who the person is, where their AI brain lives, and what they want help with first.
ALTER TABLE "signup_surveys" ADD COLUMN "role" TEXT;
ALTER TABLE "signup_surveys" ADD COLUMN "roleDetail" TEXT;
ALTER TABLE "signup_surveys" ADD COLUMN "brain" TEXT;
ALTER TABLE "signup_surveys" ADD COLUMN "needs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- The survey now shows without billing too; only accounts created from here on are asked.
INSERT INTO "signup_surveys" ("userId") SELECT "id" FROM "user" ON CONFLICT ("userId") DO NOTHING;
