import { useEffect, useRef } from "react";
import { View } from "react-native";
import type { GoalCelebration as Celebration } from "../domain/dailyGoals";
import { playGoalSound } from "../services/goalSound";
import { colors } from "../theme/tokens";
import { Action, Body, Icon, PreviewModal } from "./ui";

export function GoalCelebration({
  goal,
  onClose,
}: {
  goal: Celebration;
  onClose: () => void;
}) {
  const played = useRef(false);
  const sound = useRef<AbortController | null>(null);
  useEffect(() => () => sound.current?.abort(), []);
  function close() {
    sound.current?.abort();
    onClose();
  }
  const vocabulary = goal.kind === "vocabulary";
  return (
    <PreviewModal
      visible
      title={
        vocabulary
          ? "Today's vocabulary goal complete! 🎉"
          : "Grammar goal complete! 🎉"
      }
      eyebrow="A LITTLE PROGRESS, EVERY DAY"
      closeLabel="Close celebration"
      footer="Your progress is saved. You can keep learning at your own pace."
      onClose={close}
      onShow={() => {
        if (played.current) return;
        played.current = true;
        sound.current = new AbortController();
        void playGoalSound(sound.current.signal);
      }}
    >
      <View style={{ alignItems: "center", gap: 16, paddingVertical: 12 }}>
        <View
          style={{
            backgroundColor: colors.orangeSoft,
            padding: 18,
            borderRadius: 24,
          }}
        >
          <Icon name="award" size={40} color={colors.orange} />
        </View>
        <Body style={{ textAlign: "center", fontSize: 18 }}>
          {vocabulary
            ? `You studied ${goal.count} words today.`
            : goal.count === 1
              ? "You completed today's grammar lesson."
              : `You completed ${goal.count} grammar lessons today.`}
        </Body>
        <Body style={{ color: colors.blue, fontSize: 24, fontWeight: "600" }}>
          {vocabulary ? "Goed bezig!" : "Mooi gedaan!"}
        </Body>
      </View>
      <Action
        title="Continue learning"
        icon="arrow-right"
        variant="warm"
        onPress={close}
      />
    </PreviewModal>
  );
}
