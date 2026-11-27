import { useLingui } from "@lingui/react/macro";
import type { SignupSurvey as SignupSurveyAnswers } from "@rakazo/contracts";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AccountMenu } from "../../components/account/AccountMenu";
import { SignupSurvey } from "../../components/account/SignupSurvey";
import { WeaBotFace } from "../../components/wea-bot/wea-bot";
import { useSignOut } from "../../lib/auth/sign-out";
import type { ModelCatalogEntry } from "../../lib/models/model-auth";
import { rpc } from "../../lib/query/rpc";
import { errorText } from "../../lib/query/user-error";
import { FirstBotRetry } from "./first-bot";
import { ModelStep } from "./model-step";
import { canAskForNotifications, NotificationsStep } from "./notifications-step";
import { useOnboardingModel } from "./use-onboarding-model";
import "../landing/wea-fonts.css";
import "./onboarding.css";

type Step = "survey" | "model" | "notifications" | "bot";

/** Notifications come last, and only when the browser can still ask. */
function afterModel(): Step {
  return canAskForNotifications() ? "notifications" : "bot";
}

export function OnboardingPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const fieldId = useId();
  // The URL holds each step before the first chat, so /onboarding/survey and the rest open directly.
  const { step: routeStep } = useParams();
  const linkedStep =
    routeStep === "survey" || routeStep === "model" || routeStep === "notifications"
      ? routeStep
      : undefined;
  const [creatingBot, setCreatingBot] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  // Answers given this visit, so Back from the model step reopens the survey with them filled in.
  const [surveyAnswers, setSurveyAnswers] = useState<SignupSurveyAnswers>();
  // Only personalizes the questions; prefilled from the account and never saved.
  const [firstName, setFirstName] = useState("");
  const step = creatingBot ? "bot" : surveyDone ? "loading" : (linkedStep ?? "loading");
  const [billingEnabled, setBillingEnabled] = useState(false);
  // The step after the survey; null until me loads.
  const [afterSurvey, setAfterSurvey] = useState<Step | null>(null);
  const [catalog, setCatalog] = useState<ModelCatalogEntry[]>([]);
  const model = useOnboardingModel({
    catalog,
    billingEnabled,
    onConnected: () => goTo(afterModel()),
  });
  const { error, modelProbe, setError } = model;
  const createStartedRef = useRef(false);
  const { signingOut, logOut } = useSignOut("/sign-in", setError);

  useEffect(() => {
    const leaving = new AbortController();
    const { signal } = leaving;
    void Promise.all([
      rpc.me(undefined, { signal }),
      rpc.models.list(undefined, { signal }).catch(() => []),
    ])
      .then(([me, models]) => {
        if (signal.aborted) return;
        setBillingEnabled(me.billingEnabled);
        setCatalog(models);
        setFirstName(me.name.trim().split(/\s+/)[0] ?? "");
        const next = me.needsModel ? "model" : afterModel();
        setAfterSurvey(next);
        if (!linkedStep) goTo(me.needsSignupSurvey ? "survey" : next);
      })
      .catch(() => {
        if (signal.aborted) return;
        setAfterSurvey(afterModel());
        if (!linkedStep) goTo(afterModel());
      });
    return () => {
      leaving.abort();
      modelProbe.invalidate();
    };
  }, []);

  useEffect(() => {
    if (!surveyDone || !afterSurvey) return;
    setSurveyDone(false);
    goTo(afterSurvey);
  }, [surveyDone, afterSurvey]);

  function goTo(next: Step) {
    if (next === "bot") setCreatingBot(true);
    navigate(next === "bot" ? "/onboarding" : `/onboarding/${next}`, { replace: true });
  }

  async function createFirstBot() {
    if (createStartedRef.current) return;
    createStartedRef.current = true;
    setError(null);
    try {
      // The server creates and greets Chief only in a Space that never held a chat; otherwise
      // the app shows the Space as it is.
      const { botId } = await rpc.onboarding.firstBot();
      navigate(botId ? `/app/${botId}` : "/app");
    } catch (err) {
      createStartedRef.current = false;
      setError(errorText(err, t`Could not create your bot`));
    }
  }

  useEffect(() => {
    if (step !== "bot") return;
    void createFirstBot();
  }, [step]);

  // Loading, and creating the first bot, both show Chief until the chat opens.
  if (step === "loading" || (step === "bot" && !error)) return <ChiefSplash />;

  return (
    <div
      className="wea-onboarding min-h-full bg-background px-6 py-12"
      data-theme="light"
      data-rakazo-surface="onboarding"
    >
      <AccountMenu signingOut={signingOut} onLogOut={() => void logOut()} />
      <div className="mx-auto w-full max-w-[480px]">
        {step === "survey" ? (
          <SignupSurvey
            initial={surveyAnswers}
            name={firstName}
            onNameChange={setFirstName}
            onDone={(answers) => {
              setSurveyAnswers(answers);
              setSurveyDone(true);
            }}
          />
        ) : null}
        {step === "model" ? (
          <ModelStep
            model={model}
            fieldId={fieldId}
            onBack={surveyAnswers ? () => goTo("survey") : undefined}
          />
        ) : null}
        {step === "notifications" ? <NotificationsStep onDone={() => goTo("bot")} /> : null}
        {step === "bot" ? (
          <FirstBotRetry error={error} onRetry={() => void createFirstBot()} />
        ) : null}
      </div>
    </div>
  );
}

/** Chief on a soft teal halo while the account loads and the first chat is made. */
function ChiefSplash() {
  const { t } = useLingui();
  return (
    <div
      className="wea-onboarding wo-splash grid h-full place-items-center"
      data-theme="light"
      role="status"
      aria-label={t`Loading…`}
    >
      <span className="wo-halo">
        <WeaBotFace kind="chief" size={112} />
      </span>
    </div>
  );
}
