import { useEffect, useRef } from "react";
import type { ScrollViewInstance } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { androidRipple, withAlpha } from "../../lib/appearance/ripple";
import { useMobileTokens } from "../../lib/native/native";

export type FilterChipOption<Key extends string> = { key: Key | null; label: string };

export const FILTER_CHIPS_HEIGHT = 40;

/**
 * One row of filter chips that scrolls sideways. The row's height and every chip's size stay the
 * same whichever is picked (the border is always there; only its colour changes), so picking one
 * never reflows the chips or moves the list below.
 */
export function FilterChips<Key extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testID,
  inset = 0,
}: {
  options: readonly FilterChipOption<Key>[];
  value: Key | null;
  onChange: (key: Key | null) => void;
  accessibilityLabel: string;
  testID?: string;
  /** The screen's side padding, so the row can scroll edge to edge. */
  inset?: number;
}) {
  const tokens = useMobileTokens();
  const row = useRef<ScrollViewInstance>(null);
  const offsets = useRef(new Map<string, { x: number; width: number }>());
  const scrollX = useRef(0);
  const widthRef = useRef(0);
  // Keep the picked chip in view.
  useEffect(() => {
    const chip = offsets.current.get(value ?? "");
    if (!chip || !widthRef.current) return;
    if (chip.x - inset < scrollX.current) row.current?.scrollTo({ x: Math.max(0, chip.x - inset) });
    else if (chip.x + chip.width + inset > scrollX.current + widthRef.current)
      row.current?.scrollTo({ x: chip.x + chip.width + inset - widthRef.current });
  }, [value, inset]);
  return (
    <ScrollView
      ref={row}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[styles.row, { marginHorizontal: -inset }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: inset }]}
      onLayout={(event) => {
        widthRef.current = event.nativeEvent.layout.width;
      }}
      onScroll={(event) => {
        scrollX.current = event.nativeEvent.contentOffset.x;
      }}
      scrollEventThrottle={32}
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key ?? ""}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            android_ripple={androidRipple(withAlpha(tokens.foreground, 0.12))}
            onLayout={(event) => {
              const { x, width } = event.nativeEvent.layout;
              offsets.current.set(option.key ?? "", { x, width });
            }}
            onPress={() => onChange(option.key)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? tokens.primary : "transparent",
                borderColor: selected ? tokens.primary : tokens.border,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: selected ? tokens.primaryForeground : tokens.foreground },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0, height: FILTER_CHIPS_HEIGHT },
  content: { gap: 8, alignItems: "center" },
  chip: {
    height: FILTER_CHIPS_HEIGHT,
    borderRadius: FILTER_CHIPS_HEIGHT / 2,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    overflow: "hidden",
  },
  label: { fontSize: 15, fontWeight: "600" },
});
