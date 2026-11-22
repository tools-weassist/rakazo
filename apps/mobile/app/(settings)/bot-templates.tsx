import { useLingui } from "@lingui/react/macro";
import type { BotTemplateCategory } from "@rakazo/contracts";
import { BOT_TEMPLATE_CATEGORIES } from "@rakazo/contracts";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import type { ScrollViewInstance } from "react-native";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotTemplateIcon } from "../../components/bots/bot-template-icon";
import { TemplateKindBadge } from "../../components/bots/template-kind-badge";
import { FilterChips } from "../../components/native/filter-chips";
import { NativeActionButton } from "../../components/native/native-action-button";
import { SettingsGroup, SettingsRow } from "../../components/settings/settings-group";
import { errorText } from "../../lib/api/user-error";
import { botTemplateCategoryLabel, botTemplateCopy } from "../../lib/bots/bot-template-copy";
import { teamTemplateCopy } from "../../lib/bots/team-template-copy";
import { useSideInsets } from "../../lib/layout/side-insets";
import { native, useThemedStyles } from "../../lib/native/native";
import { queryClient, rpcQuery } from "../../lib/query/query";

/** The filter: All, one template category, or the ready-made teams. */
type Filter = BotTemplateCategory | "teams";

/** Ready-made bots and teams; each one's page says what it does and how it helps. */
export default function BotTemplatesScreen() {
  const router = useRouter();
  const sideInsets = useSideInsets();
  const styles = useThemedStyles(createStyles);
  const { t } = useLingui();
  const templates = useQuery(rpcQuery("bots/templates"), queryClient);
  const teams = useQuery(rpcQuery("bots/teamTemplates"), queryClient);
  const [category, setCategory] = useState<Filter | null>(null);
  const categories = BOT_TEMPLATE_CATEGORIES.filter((name) =>
    templates.data?.some((template) => template.category === name),
  );
  const hasTeams = Boolean(teams.data?.length);
  const selected: Filter | null =
    category === "teams"
      ? hasTeams
        ? "teams"
        : null
      : category && categories.includes(category)
        ? category
        : null;
  const shownSingles =
    selected === "teams"
      ? []
      : selected
        ? templates.data?.filter((template) => template.category === selected)
        : templates.data;
  const shownTeams = selected === "teams" || selected === null ? (hasTeams ? teams.data : []) : [];
  const { refetch: refetchTemplates } = templates;
  const { refetch: refetchTeams } = teams;
  const list = useRef<ScrollViewInstance>(null);
  const pick = (next: Filter | null) => {
    setCategory(next);
    // A shorter list starts at its top under the chips, not wherever the longer one was.
    if (Platform.OS === "android") list.current?.scrollTo({ y: 0, animated: false });
  };
  const chips: Array<{ key: Filter | null; label: string }> = [
    { key: null, label: t`All` },
    ...(hasTeams ? [{ key: "teams" as const, label: t`Teams` }] : []),
    ...categories.map((name) => ({ key: name, label: botTemplateCategoryLabel(name) })),
  ];
  const showChips = hasTeams || categories.length >= 2;

  useFocusEffect(
    useCallback(() => {
      void refetchTemplates();
      void refetchTeams();
    }, [refetchTemplates, refetchTeams]),
  );

  const failed = (templates.error && !templates.data) || (teams.error && !teams.data);
  const pending = !templates.data && !teams.data && (templates.isPending || teams.isPending);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView
        ref={list}
        style={sideInsets}
        stickyHeaderIndices={Platform.OS === "android" ? [0] : undefined}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Always the first child, so Android can pin it: filtering never moves the chips. */}
        <View style={showChips ? styles.chipBar : styles.noChips}>
          {showChips ? (
            <FilterChips
              options={chips}
              value={selected}
              onChange={pick}
              accessibilityLabel={t`Filter templates by category`}
              testID="bot-template-categories"
              inset={16}
            />
          ) : null}
        </View>
        {failed ? (
          <View style={styles.list}>
            <Text style={styles.error}>
              {errorText(templates.error ?? teams.error, t`Could not load templates`)}
            </Text>
            <NativeActionButton
              fill={false}
              label={t`Retry`}
              onPress={() => {
                void refetchTemplates();
                void refetchTeams();
              }}
              prominence="secondary"
            />
          </View>
        ) : null}
        {pending ? (
          <ActivityIndicator color={native.secondaryLabel} accessibilityLabel={t`Loading…`} />
        ) : null}
        {shownTeams?.length ? (
          <SettingsGroup>
            {shownTeams.map((team) => {
              const { name, summary } = teamTemplateCopy(team);
              return (
                <SettingsRow
                  key={team.id}
                  testID="team-template-row"
                  accessibilityRole="button"
                  title={name}
                  detail={summary}
                  badge={<TemplateKindBadge members={team.members.length} />}
                  leading={<BotTemplateIcon id={team.lead} />}
                  chevron="right"
                  onPress={() =>
                    router.push({ pathname: "/team-template", params: { id: team.id } })
                  }
                />
              );
            })}
          </SettingsGroup>
        ) : null}
        {shownSingles?.length ? (
          <SettingsGroup>
            {shownSingles.map((template) => {
              const { name, summary } = botTemplateCopy(template);
              return (
                <SettingsRow
                  key={template.id}
                  testID="bot-template-row"
                  accessibilityRole="button"
                  title={name}
                  detail={summary}
                  badge={<TemplateKindBadge />}
                  leading={<BotTemplateIcon id={template.id} />}
                  chevron="right"
                  onPress={() =>
                    router.push({ pathname: "/bot-template", params: { id: template.id } })
                  }
                />
              );
            })}
          </SettingsGroup>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: native.page },
    content: { padding: 16, gap: 14 },
    // Opaque so the list scrolls under the pinned chips; the padding stands in for the gap.
    chipBar: { backgroundColor: native.page, marginVertical: -7, paddingVertical: 7 },
    noChips: { marginBottom: -14 },
    list: { gap: 8 },
    error: { color: native.secondaryLabel, fontSize: 14 },
  });
}
