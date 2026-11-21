import { useLingui } from "@lingui/react/macro";
import type { BotTemplateCategory } from "@rakazo/contracts";
import { BOT_TEMPLATE_CATEGORIES } from "@rakazo/contracts";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BotTemplateIcon } from "../../components/bots/bot-template-icon";
import { NativeActionButton } from "../../components/native/native-action-button";
import { SettingsGroup, SettingsRow } from "../../components/settings/settings-group";
import { errorText } from "../../lib/api/user-error";
import { botTemplateCategoryLabel, botTemplateCopy } from "../../lib/bots/bot-template-copy";
import { useSideInsets } from "../../lib/layout/side-insets";
import { native, useThemedStyles } from "../../lib/native/native";
import { queryClient, rpcQuery } from "../../lib/query/query";

/** Ready-made bots; each one's page shows an example of what it sends. */
export default function BotTemplatesScreen() {
  const router = useRouter();
  const sideInsets = useSideInsets();
  const styles = useThemedStyles(createStyles);
  const { t } = useLingui();
  const templates = useQuery(rpcQuery("bots/templates"), queryClient);
  const [category, setCategory] = useState<BotTemplateCategory | null>(null);
  const categories = BOT_TEMPLATE_CATEGORIES.filter((name) =>
    templates.data?.some((template) => template.category === name),
  );
  const selected = category && categories.includes(category) ? category : null;
  const shown = selected
    ? templates.data?.filter((template) => template.category === selected)
    : templates.data;
  const { refetch } = templates;
  const open = (id: string) => router.push({ pathname: "/bot-template", params: { id } });

  // A bot made from a template, or deleted since, changes what each one opens.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView
        style={sideInsets}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        {templates.error && !templates.data ? (
          <View style={styles.list}>
            <Text style={styles.error}>
              {errorText(templates.error, t`Could not load templates`)}
            </Text>
            <NativeActionButton
              fill={false}
              label={t`Retry`}
              onPress={() => void refetch()}
              prominence="secondary"
            />
          </View>
        ) : null}
        {templates.isPending ? (
          <ActivityIndicator color={native.secondaryLabel} accessibilityLabel={t`Loading…`} />
        ) : null}
        {categories.length >= 2 ? (
          <View
            style={styles.categories}
            accessibilityLabel={t`Filter templates by category`}
            testID="bot-template-categories"
          >
            {[null, ...categories].map((name) => (
              <NativeActionButton
                key={name ?? "all"}
                label={name ? botTemplateCategoryLabel(name) : t`All`}
                selected={selected === name}
                prominence="secondary"
                fill={false}
                style={styles.category}
                onPress={() => setCategory(name)}
              />
            ))}
          </View>
        ) : null}
        {shown?.length ? (
          <SettingsGroup>
            {shown.map((template) => {
              const { name, summary } = botTemplateCopy(template);
              return (
                <SettingsRow
                  key={template.id}
                  testID="bot-template-row"
                  accessibilityRole="button"
                  title={name}
                  detail={summary}
                  leading={<BotTemplateIcon id={template.id} />}
                  chevron="right"
                  onPress={() => open(template.id)}
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
    categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    category: { borderRadius: 24 },
    list: { gap: 8 },
    error: { color: native.secondaryLabel, fontSize: 14 },
  });
}
