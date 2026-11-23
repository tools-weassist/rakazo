import { useLingui } from "@lingui/react/macro";
import type { ContentReportReason } from "@rakazo/contracts";
import { CONTENT_REPORT_DETAILS_MAX_LENGTH } from "@rakazo/contracts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { NativeSymbol } from "../components/native/native-symbol";
import {
  SettingsGroup,
  SettingsInputRow,
  SettingsRow,
} from "../components/settings/settings-group";
import { errorText } from "../lib/api/user-error";
import { useMobileTokens } from "../lib/native/native";
import { useScreenHeader } from "../lib/navigation/screen-header";
import { useSave } from "../lib/query/query";

/** Reports a bot's message as offensive or harmful to the people who run Wea, without leaving the app. */
export default function ReportMessageScreen() {
  const { messageId, botId, groupId } = useLocalSearchParams<{
    messageId: string;
    botId?: string;
    groupId?: string;
  }>();
  const { t } = useLingui();
  const tokens = useMobileTokens();
  const router = useRouter();
  useScreenHeader({ title: t`Report message` });
  const [reason, setReason] = useState<ContentReportReason | null>(null);
  const [details, setDetails] = useState("");
  const save = useSave({
    save: async (input: { reason: ContentReportReason; details: string }, send) =>
      send("threads/report", {
        ...(groupId ? { groupId } : { botId: botId! }),
        messageId,
        reason: input.reason,
        ...(input.details.trim() ? { details: input.details.trim() } : {}),
      }),
    closesScreen: true,
    onSaved: () => {
      Alert.alert(t`Thanks for reporting`, t`The Wea team will review this message.`);
      router.back();
    },
  });
  const reasons: readonly { value: ContentReportReason; title: string; detail: string }[] = [
    {
      value: "offensive",
      title: t`Offensive`,
      detail: t`Hateful, harassing, sexual or otherwise offensive`,
    },
    {
      value: "harmful",
      title: t`Harmful or unsafe`,
      detail: t`Dangerous advice, scams or content that could hurt someone`,
    },
    { value: "other", title: t`Something else`, detail: t`Tell us more below` },
  ];
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SettingsGroup
        label={t`Why are you reporting this message?`}
        footer={t`Reports go to the Wea team. The bot isn't told.`}
      >
        {reasons.map((option) => (
          <SettingsRow
            key={option.value}
            title={option.title}
            detail={option.detail}
            accessibilityRole="radio"
            accessibilityState={{ checked: reason === option.value }}
            disabled={save.pending}
            trailing={
              reason === option.value ? (
                <NativeSymbol
                  ios="checkmark"
                  android="checkmark"
                  size={16}
                  color={tokens.foreground}
                />
              ) : null
            }
            onPress={() => setReason(option.value)}
          />
        ))}
      </SettingsGroup>
      <SettingsGroup label={t`Details (optional)`}>
        <SettingsInputRow
          key="details"
          accessibilityLabel={t`Details (optional)`}
          placeholder={t`What was wrong with it?`}
          multiline
          maxLength={CONTENT_REPORT_DETAILS_MAX_LENGTH}
          editable={!save.pending}
          value={details}
          onChangeText={setDetails}
        />
      </SettingsGroup>
      <SettingsGroup>
        <SettingsRow
          key="send"
          title={t`Send report`}
          tinted
          disabled={!reason || save.pending}
          dimmed={!reason || save.pending}
          onPress={() => {
            if (reason) save.run({ reason, details });
          }}
        />
      </SettingsGroup>
      {save.error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: tokens.destructive }]}>
          {errorText(save.error, t`Could not send the report. Try again.`)}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 24 },
  error: { paddingHorizontal: 20, fontSize: 13 },
});
