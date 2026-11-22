import type Ionicons from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { native } from "../../lib/native/native";
import { NativeSymbol } from "../native/native-symbol";

type TemplateSymbol = { ios: string; android: ComponentProps<typeof Ionicons>["name"] };

const SYMBOLS: Record<string, TemplateSymbol> = {
  "ai-brain-keeper": { ios: "brain", android: "bulb-outline" },
  "receipt-categorizer": { ios: "doc.text.magnifyingglass", android: "receipt-outline" },
  "ar-follow-up": { ios: "dollarsign.arrow.circlepath", android: "cash-outline" },
  "month-end-close": { ios: "calendar.badge.checkmark", android: "calendar-outline" },
  "expense-report-prep": { ios: "wallet.pass", android: "wallet-outline" },
  "cash-flow-snapshot": { ios: "chart.line.uptrend.xyaxis", android: "trending-up-outline" },
  "content-calendar-planner": { ios: "calendar", android: "calendar-outline" },
  "social-post-repurposer": { ios: "repeat", android: "repeat-outline" },
  "newsletter-drafter": { ios: "newspaper", android: "newspaper-outline" },
  "lead-follow-up": { ios: "person.crop.circle.badge.clock", android: "people-outline" },
  "campaign-recap": { ios: "megaphone", android: "megaphone-outline" },
  "sop-process-tracker": { ios: "folder.badge.gearshape", android: "folder-outline" },
  "meeting-action-items": { ios: "note.text", android: "reader-outline" },
  "weekly-ops-report": { ios: "list.bullet.rectangle", android: "clipboard-outline" },
  "vendor-tracker": { ios: "shippingbox", android: "cube-outline" },
  "project-status-updates": { ios: "rectangle.3.group", android: "albums-outline" },
  "sop-builder": { ios: "doc.text", android: "document-text-outline" },
  "results-eod-report": { ios: "checklist", android: "clipboard-outline" },
  "va-client-finder": { ios: "briefcase", android: "briefcase-outline" },
  "delegation-coach": { ios: "list.bullet.clipboard", android: "checkbox-outline" },
  "ai-upskill-coach": { ios: "graduationcap", android: "school-outline" },
  "get-paid-back-office": { ios: "banknote", android: "receipt-outline" },
  "scope-rate-guard": { ios: "scalemass", android: "scale-outline" },
  "inbox-admin-triage": { ios: "envelope.badge", android: "mail-unread-outline" },
  "night-shift-handoff": { ios: "moon.stars", android: "moon-outline" },
  "va-onboarding-kit": { ios: "person.badge.plus", android: "person-add-outline" },
  "va-business-manager": { ios: "chart.bar.xaxis", android: "stats-chart-outline" },
  "client-va-sync": { ios: "person.2", android: "people-circle-outline" },
  "calendar-keeper": { ios: "calendar.badge.clock", android: "time-outline" },
  "agency-ops-manager": { ios: "building.2", android: "business-outline" },
  "morning-briefing": { ios: "sun.max", android: "sunny-outline" },
  "inbox-triage": { ios: "tray", android: "file-tray-outline" },
  "pr-reviewer": { ios: "arrow.triangle.pull", android: "git-pull-request-outline" },
  "topic-watch": { ios: "binoculars", android: "telescope-outline" },
};

/** The mark for bot templates as a whole. */
export const BOT_TEMPLATES_SYMBOL: TemplateSymbol = {
  ios: "square.grid.2x2",
  android: "grid-outline",
};

/** A template's mark in a rounded tile; unknown templates share the templates mark. */
export function BotTemplateIcon({ id, size = 32 }: { id?: string; size?: number }) {
  const symbol = (id && SYMBOLS[id]) || BOT_TEMPLATES_SYMBOL;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        borderCurve: "continuous",
        backgroundColor: native.fillPressed,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <NativeSymbol {...symbol} size={Math.round(size * 0.5)} color={native.label} />
    </View>
  );
}
