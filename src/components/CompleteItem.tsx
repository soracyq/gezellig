import { useState } from "react";
import { View } from "react-native";
import type { ContentType } from "../domain/models";
import { useLearning } from "../state/LearningProvider";
import { Action, Body } from "./ui";

export function CompleteItem({ id, type }: { id: string; type: ContentType }) {
  const {
    completeItem,
    studiedIds,
    completedLessonIds,
    loading,
    busy,
    activityError,
  } = useLearning();
  const [error, setError] = useState<string | null>(null);
  const completed = (
    type === "vocabulary" ? studiedIds : completedLessonIds
  ).has(id);
  async function save() {
    setError(null);
    try {
      await completeItem(id, type);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save your progress.",
      );
    }
  }
  return (
    <View style={{ gap: 10 }}>
      <Action
        title={
          completed
            ? type === "vocabulary"
              ? "Word studied"
              : "Lesson completed"
            : type === "vocabulary"
              ? "Mark studied"
              : "Complete lesson"
        }
        icon="check-circle"
        onPress={() => void save()}
        disabled={completed || loading || busy || !!activityError}
      />
      <Body muted style={{ fontSize: 12 }}>
        {completed
          ? "Saved on this device. Each item counts once until you reset progress."
          : "Choose this when you have finished studying. Reading alone does not record progress."}
      </Body>
      {error && <Body accessibilityRole="alert">{error}</Body>}
    </View>
  );
}
