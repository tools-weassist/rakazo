import { useLingui } from "@lingui/react/macro";
import { StyleSheet, Text, View } from "react-native";
import { mobileTokens } from "../../lib/appearance/appearance";
import { useMobileTokens, useThemedStyles } from "../../lib/native/native";
import { NativeSymbol } from "../native/native-symbol";

/** Marks a template as one bot or a ready-made team, on the list and the page. */
export function TemplateKindBadge({ members }: { members?: number }) {
  const { t } = useLingui();
  const tokens = useMobileTokens();
  const styles = useThemedStyles(createStyles);
  const team = members != null;
  const label = team ? t`Team · ${members} bots` : t`Single bot`;
  const color = team ? tokens.primary : tokens.mutedForeground;
  return (
    <View
      testID="template-kind-badge"
      accessibilityLabel={label}
      style={[styles.badge, team ? styles.team : styles.single]}
    >
      <NativeSymbol
        ios={team ? "person.3.fill" : "person.fill"}
        android={team ? "people" : "person"}
        size={12}
        color={color}
      />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

function createStyles() {
  const tokens = mobileTokens();
  return StyleSheet.create({
    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      borderCurve: "continuous",
    },
    single: { backgroundColor: tokens.secondary },
    team: {
      backgroundColor: tokens.secondary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.primary,
    },
    label: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  });
}
