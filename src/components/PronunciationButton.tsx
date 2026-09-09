import { useEffect, useState, useSyncExternalStore } from "react";
import { View } from "react-native";
import { pronunciationService } from "../services/pronunciation";
import { Action, Body } from "./ui";
export function PronunciationButton({ text }: { text: string }) {
  const status = useSyncExternalStore(
    pronunciationService.subscribe,
    pronunciationService.getStatus,
    () => "unavailable" as const,
  );
  const [failed, setFailed] = useState(false);
  useEffect(() => () => pronunciationService.cancel(), [text]);
  return (
    <View style={{ gap: 8 }}>
      <Action
        title="Listen"
        accessibilityLabel={`Listen to Dutch pronunciation of ${text}`}
        icon="volume-2"
        variant="secondary"
        disabled={status === "unavailable"}
        onPress={() => {
          setFailed(false);
          if (!pronunciationService.speakDutch(text, () => setFailed(true)))
            setFailed(true);
        }}
      />
      {(status === "unavailable" || failed) && (
        <Body muted accessibilityLiveRegion="polite">
          Dutch pronunciation is not available on this device.
        </Body>
      )}
    </View>
  );
}
