import { Trans, useLingui } from "@lingui/react/macro";
import type { SignupSurvey as SignupSurveyAnswers, SignupSurveyRole } from "@rakazo/contracts";
import {
  SIGNUP_SURVEY_MAX_NEEDS,
  SIGNUP_SURVEY_NEEDS,
  SIGNUP_SURVEY_ROLE_DETAILS,
} from "@rakazo/contracts";
import { Button, Input, ToggleGroup, ToggleGroupItem } from "@rakazo/ui-web";
import { useId, useState } from "react";
import { rpc } from "../../lib/query/rpc";

type Brain = NonNullable<SignupSurveyAnswers["brain"]>;

const tileGroup = "mt-2 grid w-full grid-cols-1 gap-2 sm:grid-cols-2";
const tile =
  "h-auto min-h-11 justify-start whitespace-normal rounded-lg border border-border px-3 py-2.5 text-start aria-pressed:border-primary aria-pressed:bg-primary/10";

/** Wea's three onboarding questions; every one can be skipped. The answers pick a starter bot. */
export function SignupSurvey({ onDone }: { onDone: () => void }) {
  const { t } = useLingui();
  const fieldId = useId();
  const [role, setRole] = useState<SignupSurveyRole | null>(null);
  const [roleDetail, setRoleDetail] = useState<string | null>(null);
  const [brain, setBrain] = useState<Brain | null>(null);
  const [needs, setNeeds] = useState<string[]>([]);
  const [source, setSource] = useState("");

  const roles: { value: SignupSurveyRole; label: string }[] = [
    { value: "business_owner", label: t`I'm a business owner` },
    { value: "va", label: t`I'm a virtual assistant (VA)` },
    { value: "agency", label: t`I run a VA agency or team` },
    { value: "exploring", label: t`Just exploring` },
  ];
  const followUps: Record<SignupSurveyRole, string> = {
    business_owner: t`Do you work with a VA today?`,
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
    "1-5": t`1–5`,
    "6-20": t`6–20`,
    "20+": t`20+`,
  };
  const brains: { value: Brain; label: string }[] = [
    { value: "drive", label: t`Yes, in Google Drive` },
    { value: "notion", label: t`Yes, in Notion` },
    { value: "assistant", label: t`Yes, in another AI assistant (ChatGPT, Claude, Grok Bot…)` },
    { value: "other", label: t`Yes, somewhere else (Obsidian, notes, files)` },
    { value: "none", label: t`Not yet` },
    { value: "unsure", label: t`What's an AI brain?` },
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

  function chooseRole(next: SignupSurveyRole | null) {
    setRole(next);
    // A follow-up or need belongs to the role that offered it.
    setRoleDetail(null);
    setNeeds([]);
  }

  function submit(answers: SignupSurveyAnswers) {
    // Answers are optional, so a slow or failed save never holds up onboarding.
    void rpc.onboarding.signupSurvey(answers).catch(() => undefined);
    onDone();
  }

  function answers(): SignupSurveyAnswers {
    return {
      ...(role ? { role } : {}),
      ...(role && roleDetail ? { roleDetail } : {}),
      ...(brain ? { brain } : {}),
      ...(role && needs.length ? { needs } : {}),
      ...(source.trim() ? { source: source.trim() } : {}),
    };
  }

  const details = role ? SIGNUP_SURVEY_ROLE_DETAILS[role] : [];
  const needChoices = SIGNUP_SURVEY_NEEDS[role ?? "exploring"];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(answers());
      }}
    >
      <h1 className="text-display font-medium text-foreground">
        <Trans>Welcome to Wea</Trans>
      </h1>
      <p className="mt-2 text-body text-muted-foreground">
        <Trans>
          Three quick questions so we can set you up with the right bots. Skip any of them.
        </Trans>
      </p>

      <p id={`${fieldId}-role`} className="mt-8 text-body font-medium text-foreground">
        <Trans>Which best describes you?</Trans>
      </p>
      <ToggleGroup
        aria-labelledby={`${fieldId}-role`}
        value={role ? [role] : []}
        onValueChange={([next]) => chooseRole((next as SignupSurveyRole | undefined) ?? null)}
        className={tileGroup}
      >
        {roles.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className={tile}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {role && details.length ? (
        <>
          <p id={`${fieldId}-detail`} className="mt-6 text-body font-medium text-foreground">
            {followUps[role]}
          </p>
          <ToggleGroup
            aria-labelledby={`${fieldId}-detail`}
            value={roleDetail ? [roleDetail] : []}
            onValueChange={([next]) => setRoleDetail((next as string | undefined) ?? null)}
            className={tileGroup}
          >
            {details.map((value) => (
              <ToggleGroupItem key={value} value={value} className={tile}>
                {detailLabels[value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      ) : null}

      <p id={`${fieldId}-brain`} className="mt-6 text-body font-medium text-foreground">
        <Trans>
          Do you already have an AI brain, one place where your business knowledge lives (SOPs,
          notes, client info) that AI can use?
        </Trans>
      </p>
      <ToggleGroup
        aria-labelledby={`${fieldId}-brain`}
        value={brain ? [brain] : []}
        onValueChange={([next]) => setBrain((next as Brain | undefined) ?? null)}
        className={tileGroup}
      >
        {brains.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className={tile}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {brain === "unsure" ? (
        <p className="mt-2 text-body-sm text-muted-foreground" role="status">
          <Trans>
            It's one organized place for how your business works, so you and your bots never have to
            explain things twice. We can set one up for you.
          </Trans>
        </p>
      ) : null}

      {role ? (
        <>
          <p id={`${fieldId}-needs`} className="mt-6 text-body font-medium text-foreground">
            <Trans>What do you want help with first?</Trans>{" "}
            <span className="font-normal text-muted-foreground">
              <Trans>Pick up to 2</Trans>
            </span>
          </p>
          <ToggleGroup
            multiple
            aria-labelledby={`${fieldId}-needs`}
            value={needs}
            onValueChange={(next) => setNeeds((next as string[]).slice(-SIGNUP_SURVEY_MAX_NEEDS))}
            className={tileGroup}
          >
            {needChoices.map((value) => (
              <ToggleGroupItem key={value} value={value} className={tile}>
                {needLabels[value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      ) : null}

      <label
        htmlFor={`${fieldId}-source`}
        className="mt-6 block text-body font-medium text-foreground"
      >
        <Trans>How did you hear about us?</Trans>
      </label>
      <Input
        id={`${fieldId}-source`}
        value={source}
        onChange={(event) => setSource(event.target.value)}
        maxLength={500}
        placeholder={t`Optional`}
        className="mt-2"
      />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="submit">
          <Trans>Continue</Trans>
        </Button>
        <Button type="button" variant="ghost" onClick={() => submit({})}>
          <Trans>Skip for now</Trans>
        </Button>
      </div>
    </form>
  );
}
