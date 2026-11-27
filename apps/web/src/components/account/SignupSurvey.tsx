import { Trans, useLingui } from "@lingui/react/macro";
import type { SignupSurvey as SignupSurveyAnswers, SignupSurveyRole } from "@rakazo/contracts";
import {
  SIGNUP_SURVEY_MAX_NEEDS,
  SIGNUP_SURVEY_NEEDS,
  SIGNUP_SURVEY_ROLE_DETAILS,
} from "@rakazo/contracts";
import { bestEffort } from "@rakazo/logging/best-effort";
import { ArrowDown, ArrowRight, Check, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { rpc } from "../../lib/query/rpc";
import { WeaBotFace, weaBotLook } from "../wea-bot/wea-bot";

type Brain = NonNullable<SignupSurveyAnswers["brain"]>;
type Screen = "hello" | "name" | "role" | "detail" | "needs" | "brain" | "source";

/** Where each question sits on the progress bar. */
const PROGRESS: Partial<Record<Screen, number>> = {
  role: 1,
  detail: 2,
  needs: 3,
  brain: 4,
  source: 5,
};
const QUESTION_COUNT = 5;

/** The bot each need would add, shown on its tile. */
const NEED_BOTS: Record<string, string> = {
  email: "inbox-admin-triage",
  delegate: "delegation-coach",
  sops: "sop-builder",
  marketing: "content-calendar-planner",
  money: "ar-follow-up",
  reports: "weekly-ops-report",
  eod: "results-eod-report",
  client_inbox: "inbox-triage",
  handoffs: "night-shift-handoff",
  find_clients: "va-client-finder",
  get_paid: "get-paid-back-office",
  ai_skills: "ai-upskill-coach",
  coverage: "agency-ops-manager",
  onboarding_vas: "va-onboarding-kit",
  client_reports: "results-eod-report",
  billing: "get-paid-back-office",
  research: "topic-watch",
  everything: "morning-briefing",
};

/** Saved in English, as the old free-text answer was, so every language reads the same. */
const SOURCES = [
  "Facebook",
  "YouTube",
  "A friend or colleague",
  "Google or another search",
  "An event or webinar",
] as const;
const OTHER_SOURCE = "Somewhere else";

/** The screens in order; the follow-up and needs belong to a role, so they wait for one. */
function screensFor(role: SignupSurveyRole | null): Screen[] {
  const order: Screen[] = ["hello", "name", "role"];
  if (role && SIGNUP_SURVEY_ROLE_DETAILS[role].length) order.push("detail");
  if (role) order.push("needs");
  order.push("brain", "source");
  return order;
}

function isListedSource(source: string): boolean {
  return (SOURCES as readonly string[]).includes(source);
}

/**
 * Chief's onboarding: a hello, the person's name, then one question per screen. Every question can
 * be skipped, and the answers pick a starter bot. The name only personalizes the questions; it is
 * never saved. Coming back from a later step passes the earlier answers in `initial` and opens the
 * last question.
 */
export function SignupSurvey({
  initial,
  name,
  onNameChange,
  onDone,
}: {
  initial?: SignupSurveyAnswers;
  name: string;
  onNameChange: (name: string) => void;
  onDone: (answers: SignupSurveyAnswers) => void;
}) {
  const { t } = useLingui();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);
  const [screen, setScreen] = useState<Screen>(initial ? "source" : "hello");
  const [role, setRole] = useState<SignupSurveyRole | null>(initial?.role ?? null);
  const [roleDetail, setRoleDetail] = useState<string | null>(initial?.roleDetail ?? null);
  const [brain, setBrain] = useState<Brain | null>(initial?.brain ?? null);
  const [needs, setNeeds] = useState<string[]>(initial?.needs ?? []);
  const initialSource = initial?.source ?? "";
  const [sourceChoice, setSourceChoice] = useState<string | null>(
    initialSource ? (isListedSource(initialSource) ? initialSource : OTHER_SOURCE) : null,
  );
  const [otherSource, setOtherSource] = useState(
    initialSource && !isListedSource(initialSource) && initialSource !== OTHER_SOURCE
      ? initialSource
      : "",
  );
  const first = name.trim().split(/\s+/)[0] ?? "";

  const roles: { value: SignupSurveyRole; label: string; icon: string; tone: string }[] = [
    { value: "business_owner", label: t`I'm a business owner`, icon: "💼", tone: "blue" },
    {
      value: "va",
      label: t`I'm a virtual assistant or outsourced professional`,
      icon: "🧑‍💻",
      tone: "green",
    },
    { value: "agency", label: t`I run a VA agency or team`, icon: "🏢", tone: "violet" },
    { value: "exploring", label: t`Just exploring`, icon: "🧭", tone: "yellow" },
  ];
  const followUps: Record<SignupSurveyRole, string> = first
    ? {
        business_owner: t`${first}, do you work with a VA or outsourced professional today?`,
        va: t`${first}, who do you work for right now?`,
        agency: t`${first}, how many VAs are on your team?`,
        exploring: "",
      }
    : {
        business_owner: t`Do you work with a VA or outsourced professional today?`,
        va: t`Who do you work for right now?`,
        agency: t`How many VAs are on your team?`,
        exploring: "",
      };
  const detailLabels: Record<string, string> = {
    has_va: t`Yes, one or more`,
    hiring: t`I'm planning to hire one`,
    solo: t`No, it's just me`,
    one_client: t`One client`,
    many_clients: t`Several clients`,
    seeking: t`I'm looking for clients`,
    "1-5": t`1 to 5`,
    "6-20": t`6 to 20`,
    "20+": t`More than 20`,
  };
  const brains: { value: Brain; title: string; hint: string; icon: string; tone: string }[] = [
    { value: "drive", title: t`Google Drive`, hint: t`Docs and folders`, icon: "📁", tone: "blue" },
    { value: "notion", title: t`Notion`, hint: t`Wikis and pages`, icon: "📓", tone: "gray" },
    { value: "github", title: t`GitHub`, hint: t`Markdown in a repo`, icon: "🐙", tone: "violet" },
    {
      value: "assistant",
      title: t`Another AI assistant`,
      hint: t`ChatGPT, Claude, Grok Bot`,
      icon: "💬",
      tone: "green",
    },
    {
      value: "other",
      title: t`Somewhere else`,
      hint: t`Obsidian, notes, files`,
      icon: "🗂️",
      tone: "yellow",
    },
    {
      value: "none",
      title: t`Not yet`,
      hint: t`Chief can set one up with you`,
      icon: "🌱",
      tone: "cyan",
    },
    {
      value: "unsure",
      title: t`What's an AI brain?`,
      hint: t`Tap to see`,
      icon: "❔",
      tone: "orange",
    },
  ];
  const needLabels: Record<string, string> = {
    email: t`Email and calendar`,
    delegate: t`Handing work to my VA`,
    sops: t`Writing SOPs`,
    marketing: t`Marketing and content`,
    money: t`Invoices and money`,
    reports: t`Weekly reports on my business`,
    eod: t`Client reports (EOD)`,
    client_inbox: t`Client inbox and calendar`,
    handoffs: t`Handoffs across time zones`,
    find_clients: t`Finding clients`,
    get_paid: t`Getting paid and tracking hours`,
    ai_skills: t`Learning AI skills`,
    coverage: t`Client coverage and hours`,
    onboarding_vas: t`Onboarding new VAs`,
    client_reports: t`Client reports`,
    billing: t`Billing`,
    research: t`Research and writing`,
    everything: t`A bit of everything`,
  };
  const sources: { value: string; label: string; icon: string }[] = [
    { value: SOURCES[0], label: t`Facebook`, icon: "📘" },
    { value: SOURCES[1], label: t`YouTube`, icon: "▶️" },
    { value: SOURCES[2], label: t`A friend or colleague`, icon: "🤝" },
    { value: SOURCES[3], label: t`Google or another search`, icon: "🔎" },
    { value: SOURCES[4], label: t`An event or webinar`, icon: "🎤" },
    { value: OTHER_SOURCE, label: t`Somewhere else`, icon: "✨" },
  ];

  function submit(answers: SignupSurveyAnswers) {
    if (submitted.current) return;
    submitted.current = true;
    // Answers are optional, so a slow or failed save never holds up onboarding.
    void bestEffort("save signup survey", rpc.onboarding.signupSurvey(answers));
    onDone(answers);
  }

  function answers(source: string): SignupSurveyAnswers {
    return {
      ...(role ? { role } : {}),
      ...(role && roleDetail ? { roleDetail } : {}),
      ...(brain ? { brain } : {}),
      ...(role && needs.length ? { needs } : {}),
      ...(source.trim() ? { source: source.trim() } : {}),
    };
  }

  /** The screen after this one for `forRole`, or the answers are sent after the last. */
  function advance(forRole = role) {
    const order = screensFor(forRole);
    const next = order[order.indexOf(screen) + 1];
    if (next) setScreen(next);
    else submit(answers(""));
  }

  function back() {
    const order = screensFor(role);
    const previous = order[order.indexOf(screen) - 1];
    if (previous) setScreen(previous);
  }

  function chooseRole(next: SignupSurveyRole | null) {
    if (next !== role) {
      setRole(next);
      // A follow-up or need belongs to the role that offered it.
      setRoleDetail(null);
      setNeeds([]);
    }
    advance(next);
  }

  function chooseSource(value: string) {
    setSourceChoice(value);
    if (value !== OTHER_SOURCE) submit(answers(value));
  }

  useEffect(() => {
    (screen === "name" ? nameRef : headingRef).current?.focus();
  }, [screen]);

  const progress = PROGRESS[screen];
  const top = (onSkip: () => void) => (
    <div className="wo-top">
      <button type="button" className="wo-quiet" aria-label={t`Back`} onClick={back}>
        <ChevronLeft size={22} aria-hidden />
      </button>
      {progress ? (
        <div
          className="wo-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTION_COUNT}
          aria-valuenow={progress}
          aria-label={t`Question ${progress} of ${QUESTION_COUNT}`}
        >
          <i style={{ width: `${(progress / QUESTION_COUNT) * 100}%` }} />
        </div>
      ) : null}
      <button type="button" className="wo-quiet" onClick={onSkip}>
        <Trans>Skip</Trans>
      </button>
    </div>
  );
  const heading = (text: string, sub?: string) => (
    <>
      <h1 ref={headingRef} tabIndex={-1} className="wo-question">
        {text}
      </h1>
      {sub ? <p className="wo-sub">{sub}</p> : null}
    </>
  );

  return (
    <div key={screen} className="wo-enter flex min-h-[560px] flex-col">
      {screen === "hello" ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="wo-halo">
              <WeaBotFace kind="chief" size={120} greet />
            </div>
            <h1 ref={headingRef} tabIndex={-1} className="wo-question wo-question-xl mt-7">
              <Trans>
                Hi, I'm <span className="wo-teal">Chief</span>
              </Trans>
            </h1>
            <p className="wo-sub max-w-[300px]">
              <Trans>
                I build your team of AI assistants and keep them on track. You stay in charge.
              </Trans>
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <button
              type="button"
              className="wo-go"
              aria-label={t`Continue`}
              onClick={() => advance()}
            >
              <ArrowDown size={22} aria-hidden />
            </button>
            <button type="button" className="wo-link" onClick={() => submit({})}>
              <Trans>Skip for now</Trans>
            </button>
          </div>
        </>
      ) : null}

      {screen === "name" ? (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="wo-question">
            <Trans>
              Hi, I'm <span className="wo-teal">Chief</span>
            </Trans>
          </h1>
          <p className="wo-sub">
            <Trans>
              Your chats are private. Nothing is sent or shared without your yes. What should I call
              you?
            </Trans>
          </p>
          <form
            className="relative my-auto py-16"
            onSubmit={(event) => {
              event.preventDefault();
              advance();
            }}
          >
            <div className="relative">
              <span className="wo-peek" aria-hidden>
                <WeaBotFace kind="chief" size={56} className="translate-y-2.5" />
              </span>
              <div className="wo-field">
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  aria-label={t`Your first name`}
                  placeholder={t`Your first name`}
                  autoComplete="given-name"
                  maxLength={40}
                />
                <button type="submit" className="wo-go" aria-label={t`Continue`}>
                  <ArrowRight size={18} aria-hidden />
                </button>
              </div>
            </div>
          </form>
          <div className="mt-auto flex justify-center">
            <button type="button" className="wo-quiet" onClick={back}>
              <Trans>Back</Trans>
            </button>
          </div>
        </>
      ) : null}

      {screen === "role" ? (
        <section aria-label={t`Your role`}>
          {top(() => chooseRole(null))}
          {heading(
            first ? t`${first}, which best describes you?` : t`Which best describes you?`,
            t`So I can pick the right bots for you.`,
          )}
          <div className="wo-stack">
            {roles.map((option) => (
              <button
                key={option.value}
                type="button"
                className="wo-option"
                aria-pressed={role === option.value}
                onClick={() => chooseRole(option.value)}
              >
                <span className={`wo-icon wo-tone-${option.tone}`} aria-hidden>
                  {option.icon}
                </span>
                <span>{option.label}</span>
                <span className="wo-check" aria-hidden>
                  <Check size={13} strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {screen === "detail" && role ? (
        <section aria-label={t`About your work`} className="flex flex-1 flex-col">
          {top(() => {
            setRoleDetail(null);
            advance();
          })}
          {heading(followUps[role], t`This helps me size your team.`)}
          <div className="wo-pills">
            {SIGNUP_SURVEY_ROLE_DETAILS[role].map((value) => (
              <button
                key={value}
                type="button"
                className="wo-pill"
                aria-pressed={roleDetail === value}
                onClick={() => setRoleDetail(value)}
              >
                {detailLabels[value]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="wo-cta mt-auto"
            disabled={!roleDetail}
            onClick={() => advance()}
          >
            <Trans>Continue</Trans>
          </button>
        </section>
      ) : null}

      {screen === "needs" && role ? (
        <section aria-label={t`What you need help with`}>
          {top(() => {
            setNeeds([]);
            advance();
          })}
          {heading(
            first ? t`${first}, build your team` : t`Build your team`,
            t`Pick up to 2 things you want help with first.`,
          )}
          <div className="wo-tiles">
            {SIGNUP_SURVEY_NEEDS[role].map((value) => {
              const bot = NEED_BOTS[value] ?? "morning-briefing";
              const picked = needs.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  className={`wo-tile wo-tone-${weaBotLook(bot)?.token ?? "mist"}`}
                  aria-pressed={picked}
                  onClick={() =>
                    setNeeds((current) =>
                      picked
                        ? current.filter((need) => need !== value)
                        : [...current, value].slice(-SIGNUP_SURVEY_MAX_NEEDS),
                    )
                  }
                >
                  <span className="wo-tick" aria-hidden>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <WeaBotFace kind={bot} size={34} />
                  <span>{needLabels[value]}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="wo-cta mt-8" onClick={() => advance()}>
            {needs.length ? <Trans>That's all for now</Trans> : <Trans>Maybe later</Trans>}
          </button>
        </section>
      ) : null}

      {screen === "brain" ? (
        <section aria-label={t`Your AI knowledge`}>
          {top(() => {
            setBrain(null);
            advance();
          })}
          {heading(
            t`Where does your business knowledge live?`,
            t`Your AI brain: SOPs, notes and client info your bots can learn from.`,
          )}
          <div className="wo-cards">
            {brains.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`wo-card wo-tone-${option.tone}`}
                aria-pressed={brain === option.value}
                onClick={() => {
                  setBrain(option.value);
                  if (option.value !== "unsure") advance();
                }}
              >
                <span>
                  <b>{option.title}</b>
                  <small>{option.hint}</small>
                </span>
                <span className="wo-art" aria-hidden>
                  {option.icon}
                </span>
              </button>
            ))}
          </div>
          {brain === "unsure" ? (
            <div className="wo-explain" role="status">
              <p>
                <Trans>
                  It's one organized place for how your business works, so you and your bots never
                  have to explain things twice. Chief can set one up with you after this.
                </Trans>
              </p>
              <button type="button" className="wo-cta mt-4" onClick={() => advance()}>
                <Trans>Got it</Trans>
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {screen === "source" ? (
        <section aria-label={t`How you found Wea`}>
          {top(() => submit(answers("")))}
          {heading(first ? t`${first}, how did you hear about us?` : t`How did you hear about us?`)}
          <div className="wo-stack">
            {sources.map((option) => (
              <button
                key={option.value}
                type="button"
                className="wo-option"
                aria-pressed={sourceChoice === option.value}
                onClick={() => chooseSource(option.value)}
              >
                <span className="wo-icon wo-tone-mist" aria-hidden>
                  {option.icon}
                </span>
                <span>{option.label}</span>
                <span className="wo-check" aria-hidden>
                  <Check size={13} strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
          {sourceChoice === OTHER_SOURCE ? (
            <form
              className="mt-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(answers(otherSource.trim() || OTHER_SOURCE));
              }}
            >
              <div className="wo-field">
                <input
                  value={otherSource}
                  onChange={(event) => setOtherSource(event.target.value)}
                  aria-label={t`Where did you hear about us?`}
                  placeholder={t`Optional`}
                  maxLength={500}
                />
                <button type="submit" className="wo-go" aria-label={t`Continue`}>
                  <ArrowRight size={18} aria-hidden />
                </button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
