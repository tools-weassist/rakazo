import { ORPCError } from "@orpc/server";
import type { Actor, Bot, SignupSurvey } from "@rakazo/contracts";
import { MEMORY_INDEX_PATH, signupSurveyAsksTeamSize } from "@rakazo/contracts";
import { bestEffort } from "@rakazo/logging";
import { ensureFirstBot } from "../account/first-bot.js";
import {
  chooseFocus,
  chooseStarter,
  dismissFocus,
  isStarterOption,
  markAppConnected,
  postStarter,
  promptFocus,
  startOnboarding,
} from "../account/onboarding.js";
import { aboutMeLines, withAboutMe } from "../account/signup-survey-memory.js";
import { createTemplateBot, createTemplateTeam, enqueueBotIntroRun } from "./bots.js";
import type { RouterContext } from "./context.js";

export function onboardingRoutes(ctx: RouterContext) {
  const { deps, onboardingDeps, repos, authed } = ctx;
  const firstBotDeps = {
    prisma: deps.prisma,
    createBot: repos.createBot,
    introduce: (actor: Actor, bot: Bot) => enqueueBotIntroRun(deps, actor, bot),
    promptFocus: (actor: Actor, botId: string) => promptFocus(onboardingDeps, actor, botId),
    recommend: (actor: Actor, botId: string) => postStarter(onboardingDeps, actor, botId),
  };
  async function saveAboutMe(actor: Actor, survey: SignupSurvey): Promise<void> {
    const where = {
      spaceId: actor.spaceId,
      userId: actor.userId,
      scope: "user",
      botId: null,
      path: MEMORY_INDEX_PATH,
    };
    const doc = await deps.prisma.memoryDocument.findFirst({ where });
    const content = withAboutMe(doc?.content ?? "", aboutMeLines(survey));
    if (content === (doc?.content ?? "")) return;
    await deps.memory.commit(
      {
        scope: "user",
        path: MEMORY_INDEX_PATH,
        content,
        ...(doc ? { expectedRevision: doc.revision } : {}),
      },
      {
        operationId: "onboarding.signupSurvey",
        traceId: "onboarding.signupSurvey",
        spaceId: actor.spaceId,
        userId: actor.userId,
        signal: new AbortController().signal,
      },
    );
  }
  return {
    onboarding: {
      signupSurvey: authed.onboarding.signupSurvey.handler(async ({ context, input }) => {
        const answers = {
          reason: input.reason || null,
          use: input.use ?? null,
          teamSize: signupSurveyAsksTeamSize(input.use) ? (input.teamSize ?? null) : null,
          source: input.source || null,
          role: input.role ?? null,
          roleDetail: input.roleDetail ?? null,
          brain: input.brain ?? null,
          needs: [...new Set(input.needs ?? [])],
        };
        const saved = await deps.prisma.signupSurvey.upsert({
          where: { userId: context.actor.userId },
          create: { userId: context.actor.userId, ...answers },
          update: answers,
        });
        deps.analytics?.capture(
          context.actor.userId,
          {
            name: "signup_survey_answered",
            skipped: Object.values(answers).every(
              (answer) => answer === null || (Array.isArray(answer) && !answer.length),
            ),
            ...(answers.use ? { use: answers.use } : {}),
            ...(answers.teamSize ? { teamSize: answers.teamSize } : {}),
            ...(input.role ? { role: input.role } : {}),
            ...(input.brain ? { brain: input.brain } : {}),
          },
          // The first save's time keeps a resubmission a duplicate of the same event.
          { id: context.actor.userId, at: saved.createdAt },
        );
        // Every bot in the Space reads shared memory, so they know who this is from the start.
        await bestEffort("signup survey shared memory", saveAboutMe(context.actor, input));
        return { ok: true as const };
      }),
      firstBot: authed.onboarding.firstBot.handler(async ({ context }) =>
        ensureFirstBot(firstBotDeps, context.actor),
      ),
      start: authed.onboarding.start.handler(async ({ context, input }) => {
        await startOnboarding(onboardingDeps, context.actor, input.botId);
        return { ok: true as const };
      }),
      promptFocus: authed.onboarding.promptFocus.handler(async ({ context, input }) => {
        await promptFocus(onboardingDeps, context.actor, input.botId);
        return { ok: true as const };
      }),
      choose: authed.onboarding.choose.handler(async ({ context, input }) => {
        const { actor } = context;
        if (isStarterOption(input.optionId)) {
          await chooseStarter(onboardingDeps, actor, input.botId, input.optionId, {
            webOrigin: deps.env.webOrigin,
            start: async (pick, version) => {
              if (pick.kind === "team")
                await createTemplateTeam(ctx, actor, { teamId: pick.id, version }, context.signal);
              else
                await createTemplateBot(
                  ctx,
                  actor,
                  { templateId: pick.id, version },
                  context.signal,
                );
            },
          });
          return { ok: true as const };
        }
        await chooseFocus(onboardingDeps, context.actor, input.botId, input.optionId);
        return { ok: true as const };
      }),
      dismissFocus: authed.onboarding.dismissFocus.handler(async ({ context, input }) => {
        await dismissFocus(onboardingDeps, context.actor, input.botId);
        return { ok: true as const };
      }),
      appConnected: authed.onboarding.appConnected.handler(async ({ context, input }) => {
        await markAppConnected(
          onboardingDeps,
          context.actor,
          input.botId,
          input.provider,
          input.connectorId,
          input.threadId,
          input.messageId,
        );
        return { ok: true as const };
      }),
    },
    integrationSetup: {
      get: authed.integrationSetup.get.handler(() => ({
        canConfigure: false,
        needsSetup: false,
        webUrl: new URL("/integrations/setup", deps.env.webOrigin).toString(),
        providers: [],
      })),
      save: authed.integrationSetup.save.handler(() => {
        throw new ORPCError("FORBIDDEN");
      }),
    },
  };
}
