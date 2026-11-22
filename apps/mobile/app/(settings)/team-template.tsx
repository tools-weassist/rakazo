import { useLingui } from "@lingui/react/macro";
import type { TeamTemplateListing } from "@rakazo/contracts";
import { isBotTemplateChanged } from "@rakazo/contracts";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { BotTemplateIcon } from "../../components/bots/bot-template-icon";
import { TemplateKindBadge } from "../../components/bots/template-kind-badge";
import { NativeActionButton } from "../../components/native/native-action-button";
import { SettingsGroup, SettingsRow } from "../../components/settings/settings-group";
import { errorText } from "../../lib/api/user-error";
import { botTemplateCopy } from "../../lib/bots/bot-template-copy";
import { teamTemplateCopy } from "../../lib/bots/team-template-copy";
import { useSideInsets } from "../../lib/layout/side-insets";
import { native, useMobileTokens, useThemedStyles } from "../../lib/native/native";
import { queryClient, rpcQuery, useSave } from "../../lib/query/query";
import type { SearchInboxSession } from "../../lib/search/search-inbox";
import { addToSearchInbox, searchInboxSession } from "../../lib/search/search-inbox";
import { openFromSettingsSheet } from "../../lib/settings/settings-sheet";

/** One ready-made team: what it does, who is on it, and a Create team action. */
export default function TeamTemplateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sideInsets = useSideInsets();
  const styles = useThemedStyles(createStyles);
  const tokens = useMobileTokens();
  const { t } = useLingui();
  const teams = useQuery(rpcQuery("bots/teamTemplates"), queryClient);
  const team = teams.data?.find((item) => item.id === id);

  return (
    <ScrollView
      style={[styles.screen, sideInsets]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {team ? (
        <TeamDetail team={team} onChanged={() => void teams.refetch()} />
      ) : teams.isPending ? (
        <ActivityIndicator color={tokens.mutedForeground} accessibilityLabel={t`Loading…`} />
      ) : (
        <View style={styles.failure}>
          <Text style={styles.secondary}>
            {errorText(teams.error, t`Could not load templates`)}
          </Text>
          <NativeActionButton
            fill={false}
            label={t`Retry`}
            onPress={() => void teams.refetch()}
            prominence="secondary"
          />
        </View>
      )}
    </ScrollView>
  );
}

function TeamDetail({ team, onChanged }: { team: TeamTemplateListing; onChanged: () => void }) {
  const router = useRouter();
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  const { t } = useLingui();
  const copy = teamTemplateCopy(team);
  const singles = useQuery(rpcQuery("bots/templates"), queryClient);
  const apply = useSave({
    // Always apply, even when there's a group: it repairs a missing member and refreshes the notes.
    save: async ({ askedIn: _askedIn }: { askedIn: SearchInboxSession }, send) =>
      send("bots/createTeamFromTemplate", { teamId: team.id, version: team.version }),
    stale: [
      rpcQuery("bots/list").queryKey,
      rpcQuery("bots/templates").queryKey,
      rpcQuery("bots/teamTemplates").queryKey,
    ],
    closesScreen: true,
    onSaved: (result, { askedIn }) => {
      if (!navigation.isFocused()) return;
      addToSearchInbox({ kind: "group", group: result.group }, askedIn);
      openFromSettingsSheet(router, {
        pathname: "/group-thread",
        params: { groupId: result.group.id, name: result.group.name },
      });
    },
    onFailed: (cause) => {
      if (!navigation.isFocused()) return;
      if (isBotTemplateChanged(cause)) {
        Alert.alert(t`This template was just updated. Check it again.`);
        onChanged();
      } else {
        Alert.alert(
          t`Could not finish the team. Try again; the bots already made are kept.`,
          errorText(cause, t`Try again.`),
        );
      }
    },
  });

  const memberName = (member: TeamTemplateListing["members"][number]) => {
    const template = singles.data?.find((item) => item.id === member.templateId);
    return template ? botTemplateCopy(template).name : member.name;
  };

  return (
    <>
      <View testID="team-template-detail" style={styles.header}>
        <BotTemplateIcon id={team.lead} size={56} />
        <View style={styles.grow}>
          <Text accessibilityRole="header" style={styles.name}>
            {copy.name}
          </Text>
          <TemplateKindBadge members={team.members.length} />
          <Text style={styles.secondary}>{copy.summary}</Text>
        </View>
      </View>
      <NativeActionButton
        label={apply.pending ? t`Creating…` : team.groupId ? t`Open team` : t`Create team`}
        busy={apply.pending}
        onPress={() => apply.run({ askedIn: searchInboxSession() })}
      />

      <SettingsGroup label={t`What it does`}>
        {copy.whatItDoes.map((text) => (
          <SettingsRow key={text} title={text} />
        ))}
      </SettingsGroup>
      <SettingsGroup label={t`How it helps you`}>
        {copy.howItHelps.map((text) => (
          <SettingsRow key={text} title={text} />
        ))}
      </SettingsGroup>

      <SettingsGroup label={t`Success metric`}>
        <SettingsRow title={team.successMetric.name} detail={team.successMetric.measure} />
      </SettingsGroup>

      <SettingsGroup label={t`Team members`}>
        {team.members.map((member) => (
          <SettingsRow
            key={member.templateId}
            title={
              member.templateId === team.lead
                ? `${memberName(member)} · ${t`Lead`}`
                : memberName(member)
            }
            detail={
              member.botId
                ? `${copy.roles[member.templateId] ?? member.role}\n${t`Your existing bot joins the team`}`
                : (copy.roles[member.templateId] ?? member.role)
            }
            leading={<BotTemplateIcon id={member.templateId} />}
          />
        ))}
      </SettingsGroup>

      <SettingsGroup
        label={t`What you fill in first`}
        footer={t`The lead asks for these, one at a time, in its first chat.`}
      >
        {team.setupInputs.map((input) => (
          <SettingsRow key={input.name} title={input.name} detail={input.detail} />
        ))}
      </SettingsGroup>

      <SettingsGroup label={t`Week one`}>
        {team.weekOne.map((step, index) => (
          <SettingsRow key={step} title={`${index + 1}. ${step}`} />
        ))}
      </SettingsGroup>
      <SettingsGroup label={t`Approvals you'll be asked for`}>
        {team.approvals.map((item) => (
          <SettingsRow key={item} title={item} />
        ))}
      </SettingsGroup>
      <SettingsGroup
        label={t`What this team won't do`}
        footer={t`Creates the missing bots and a group chat. Bots you already made from these templates are reused, and each member gets a note naming the team. Routines stay paused. Nothing runs or is sent until you ask.`}
      >
        {team.wontDo.map((item) => (
          <SettingsRow key={item} title={item} />
        ))}
      </SettingsGroup>
    </>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: native.groupedPage },
    content: { padding: 20, paddingBottom: 40, gap: 20 },
    failure: { gap: 10 },
    header: { flexDirection: "row", alignItems: "center", gap: 14 },
    grow: { flex: 1, gap: 2, minWidth: 0 },
    name: { color: native.label, fontSize: 22, fontWeight: "600" },
    secondary: { color: native.secondaryLabel, fontSize: 15 },
  });
}
