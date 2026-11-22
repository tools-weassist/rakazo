import { useLingui } from "@lingui/react/macro";
import { APACHE_LICENSE_TEXT, OPEN_SOURCE_NOTICE } from "@rakazo/core/open-source-notice";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useSideInsets } from "../../lib/layout/side-insets";
import { native, useThemedStyles } from "../../lib/native/native";

/** Apache-2.0 attribution and license text, as Settings presents it. */
export default function OpenSourceLicensesScreen() {
  const sideInsets = useSideInsets();
  const styles = useThemedStyles(createStyles);
  const { t } = useLingui();
  return (
    <ScrollView
      style={[styles.screen, sideInsets]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text accessibilityRole="header" style={styles.credit}>
        {t`Wea is built on Rakazo, open-source under the Apache License, Version 2.0.`}
      </Text>
      <Text selectable style={styles.legal}>
        {`${OPEN_SOURCE_NOTICE}\n\n${APACHE_LICENSE_TEXT}`}
      </Text>
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: native.groupedPage },
    content: { padding: 20, paddingBottom: 40, gap: 16 },
    credit: { color: native.label, fontSize: 16, lineHeight: 22 },
    legal: { color: native.secondaryLabel, fontSize: 13, lineHeight: 18 },
  });
}
