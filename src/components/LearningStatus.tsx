import { Pressable, Text, View } from "react-native";
import type { LearningFilter } from "../domain/learningStatus";
import { learningColors, typography } from "../theme/tokens";
import { Icon } from "./ui";

export function LearningStatus({
  learned,
  grammar = false,
}: {
  learned: boolean;
  grammar?: boolean;
}) {
  const tone = learned ? learningColors.completed : learningColors.new;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "flex-start",
        backgroundColor: tone.background,
      }}
    >
      <Icon
        name={learned ? "check-circle" : "circle"}
        size={13}
        color={tone.text}
      />
      <Text
        style={{
          color: tone.text,
          fontFamily: typography.family,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {grammar
          ? learned
            ? "Completed"
            : "Not completed"
          : learned
            ? "Studied"
            : "Not studied"}
      </Text>
    </View>
  );
}
export function LearningStatusFilter({
  value,
  onChange,
  counts,
  grammar = false,
}: {
  value: LearningFilter;
  onChange: (value: LearningFilter) => void;
  counts: Record<LearningFilter, number>;
  grammar?: boolean;
}) {
  const labels = {
    all: "All",
    new: grammar ? "Not completed" : "Not studied",
    learned: grammar ? "Completed" : "Studied",
  };
  return (
    <View style={{ gap: 8, marginBottom: 20 }}>
      <Text
        style={{
          fontFamily: typography.family,
          fontSize: 12,
          color: learningColors.completed.text,
        }}
      >
        Learning status · counts match your current filters
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["all", "new", "learned"] as const).map((key) => {
          const tone =
            key === "new" ? learningColors.new : learningColors.completed;
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${grammar ? "Grammar" : "Vocabulary"} status ${labels[key]} (${counts[key]})`}
              aria-pressed={key === value}
              accessibilityState={{ selected: key === value }}
              onPress={() => onChange(key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: key === value ? tone.accent : tone.border,
                backgroundColor:
                  key === value ? tone.background : "transparent",
              }}
            >
              <Text
                style={{
                  color: tone.text,
                  fontFamily: typography.family,
                  fontSize: 13,
                  fontWeight: key === value ? "700" : "400",
                }}
              >
                {labels[key]} · {counts[key]}
              </Text>
              {key === value && (
                <Icon name="check" size={14} color={tone.text} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
