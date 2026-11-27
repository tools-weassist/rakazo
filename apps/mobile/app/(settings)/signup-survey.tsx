import { useLingui } from "@lingui/react/macro";
import type { SignupSurvey as SignupSurveyAnswers, SignupSurveyRole } from "@rakazo/contracts";
import { SIGNUP_SURVEY_NEEDS, SIGNUP_SURVEY_ROLE_DETAILS } from "@rakazo/contracts";
import { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeActionButton } from "../../components/native/native-action-button";
import { NativeSymbol } from "../../components/native/native-symbol";
import {
  SettingsGroup,
  SettingsRow,
  useStackedSettings,
} from "../../components/settings/settings-group";
import { MenuPickerMenu } from "../../components/ui/menu-picker";
import { signupSurveyAnswers } from "../../lib/auth/signup-survey";
import { CallKeyboardContext } from "../../lib/calls/call-keyboard-context";
import { useSideInsets } from "../../lib/layout/side-insets";
import { native, useThemedStyles } from "../../lib/native/native";
import { useSave } from "../../lib/query/query";
import { ACCOUNT_SETTINGS } from "../../lib/query/settings-target";
import { closeSettingsSheet } from "../../lib/settings/settings-sheet";

type Brain = NonNullable<SignupSurveyAnswers["brain"]>;
const STEP_COUNT = 3;

/** Wea's onboarding questions, shown once after signing up; every one can be skipped. */
export default function SignupSurvey() {
  const call = useContext(CallKeyboardContext);
  const sideInsets = useSideInsets();
  const { t } = useLingui();
  const styles = useThemedStyles(createStyles);
  const stacked = useStackedSettings();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<SignupSurveyRole>();
  const [roleDetail, setRoleDetail] = useState<string>();
  const [brain, setBrain] = useState<Brain>();
  const [firstNeed, setFirstNeed] = useState<string>();
  const [secondNeed, setSecondNeed] = useState<string>();
  const [source, setSource] = useState("");
  const answers = useSave({
    target: ACCOUNT_SETTINGS,
    save: async (survey: SignupSurveyAnswers, send) => {
      // Answers are optional, so a slow or failed save never holds up the new account.
      closeSettingsSheet();
      await send("onboarding/signupSurvey", survey);
    },
    closesScreen: true,
  });
  const roles: { key: SignupSurveyRole; label: string }[] = [
    { key: "business_owner", label: t`I'm a business owner` },
    { key: "va", label: t`I'm a virtual assistant or outsourced professional` },
    { key: "agency", label: t`I run a VA agency or team` },
    { key: "exploring", label: t`Just exploring` },
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
  const brains: { key: Brain; label: string }[] = [
    { key: "drive", label: t`Yes, in Google Drive` },
    { key: "notion", label: t`Yes, in Notion` },
    { key: "github", label: t`Yes, in GitHub` },
    { key: "assistant", label: t`Yes, in another AI assistant (ChatGPT, Claude, Grok Bot…)` },
    { key: "other", label: t`Yes, somewhere else (Obsidian, notes, files)` },
    { key: "none", label: t`Not yet` },
    { key: "unsure", label: t`What's an AI brain?` },
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
  const details = role
    ? SIGNUP_SURVEY_ROLE_DETAILS[role].map((key) => ({ key, label: detailLabels[key] ?? key }))
    : [];
  const needs = role
    ? SIGNUP_SURVEY_NEEDS[role].map((key) => ({ key, label: needLabels[key] ?? key }))
    : [];

  function chooseRole(next: SignupSurveyRole) {
    setRole(next);
    // A follow-up or need belongs to the role that offered it.
    setRoleDetail(undefined);
    setFirstNeed(undefined);
    setSecondNeed(undefined);
  }

  function finish() {
    answers.run(
      signupSurveyAnswers({ role, roleDetail, brain, needs: [firstNeed, secondNeed], source }),
    );
  }

  return (
    <KeyboardAvoidingView
      enabled={!call}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        style={sideInsets}
        contentContainerStyle={[styles.content, stacked && styles.compactContent]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <>
            <Text
              style={styles.title}
            >{t`The AI assistant for outsourced professionals and business owners.`}</Text>
            <Text style={styles.intro}>
              {t`3 quick questions to set you up with the right team of AI assistants in less than 30 seconds.`}
            </Text>
          </>
        ) : null}
        <Text accessibilityLiveRegion="polite" style={styles.progress}>
          {t`${step + 1} of ${STEP_COUNT}`}
        </Text>
        {step === 0 ? (
          <SettingsGroup>
            <ChoiceRow
              choices={roles}
              label={t`Which best describes you?`}
              onChange={chooseRole}
              value={role}
            />
            {role && details.length ? (
              <ChoiceRow
                choices={details}
                label={followUps[role]}
                onChange={setRoleDetail}
                value={roleDetail}
              />
            ) : null}
          </SettingsGroup>
        ) : null}
        {step === 1 ? (
          <>
            <SettingsGroup
              label={t`Do you already have an AI brain, one place where your business knowledge lives (SOPs, notes, client info) that AI can use?`}
            >
              <ChoiceRow choices={brains} label={t`AI brain`} onChange={setBrain} value={brain} />
            </SettingsGroup>
            {brain === "unsure" ? (
              <Text style={styles.intro}>
                {t`It's one organized place for how your business works, so you and your bots never have to explain things twice. We can set one up for you.`}
              </Text>
            ) : null}
          </>
        ) : null}
        {step === 2 ? (
          <>
            {role ? (
              <SettingsGroup label={t`What do you want help with first?`}>
                <ChoiceRow
                  choices={needs}
                  label={t`First`}
                  onChange={setFirstNeed}
                  value={firstNeed}
                />
                <ChoiceRow
                  choices={needs.filter((need) => need.key !== firstNeed)}
                  label={t`Anything else? (optional)`}
                  onChange={setSecondNeed}
                  value={secondNeed}
                />
              </SettingsGroup>
            ) : null}
            <SettingsGroup label={t`How did you hear about us?`}>
              <TextInput
                accessibilityLabel={t`How did you hear about us?`}
                maxLength={500}
                onChangeText={setSource}
                placeholder={t`Optional`}
                placeholderTextColor={native.tertiaryLabel}
                style={styles.input}
                value={source}
              />
            </SettingsGroup>
          </>
        ) : null}
        <View style={styles.actions}>
          {step > 0 ? (
            <NativeActionButton
              label={t`Back`}
              onPress={() => setStep((current) => current - 1)}
              prominence="secondary"
            />
          ) : null}
          <NativeActionButton
            label={step === STEP_COUNT - 1 ? t`Continue` : t`Next`}
            onPress={step === STEP_COUNT - 1 ? finish : () => setStep((current) => current + 1)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** A native menu row that stays blank until the user picks, so nothing is chosen for them. */
function ChoiceRow<T extends string>({
  label,
  choices,
  value,
  onChange,
}: {
  label: string;
  choices: readonly { key: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
}) {
  return (
    <MenuPickerMenu
      choices={choices}
      label={label}
      onChange={(key) => {
        const match = choices.find((choice) => choice.key === key);
        if (match) onChange(match.key);
      }}
      value={value ?? ""}
    >
      <View>
        <SettingsRow
          accessibilityLabel={label}
          accessibilityRole="button"
          accessible
          title={label}
          trailing={
            <NativeSymbol
              android="chevron-expand"
              color={native.tertiaryLabel}
              ios="chevron.up.chevron.down"
              size={13}
            />
          }
          value={choices.find((choice) => choice.key === value)?.label}
        />
      </View>
    </MenuPickerMenu>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: native.groupedPage },
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 28 },
    compactContent: { paddingHorizontal: 8 },
    input: {
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: native.label,
      fontSize: 16,
    },
    title: { color: native.label, fontSize: 17, lineHeight: 23, paddingHorizontal: 4 },
    intro: { color: native.secondaryLabel, fontSize: 15, paddingHorizontal: 4 },
    progress: { color: native.secondaryLabel, fontSize: 14, paddingHorizontal: 4 },
    actions: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  });
}
