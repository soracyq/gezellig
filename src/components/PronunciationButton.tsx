import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { pronunciationService } from "../services/pronunciation";
import { Action, Body } from "./ui";
export function PronunciationButton({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) {
  return (
    <PronunciationControl key={text} text={text}>
      {children}
    </PronunciationControl>
  );
}
function PronunciationControl({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) {
  const mode = useSyncExternalStore(
    pronunciationService.subscribe,
    pronunciationService.getMode,
    () => "unavailable" as const,
  );
  const [failed, setFailed] = useState(false);
  const [playback, setPlayback] = useState<"idle" | "preparing" | "playing">(
    "idle",
  );
  useEffect(() => () => pronunciationService.cancel(), [text]);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Action
          title="Listen"
          accessibilityLabel={`Listen to Dutch pronunciation of ${text}`}
          icon="volume-2"
          variant="secondary"
          disabled={mode === "unavailable"}
          onPress={() => {
            setFailed(false);
            setPlayback("preparing");
            const failure = () => {
              setFailed(true);
              setPlayback("idle");
            };
            if (
              !pronunciationService.speakDutch(text, failure, {
                onStart: () => setPlayback("playing"),
                onEnd: () => setPlayback("idle"),
              })
            )
              failure();
          }}
        />
        {children}
      </View>
      <Body muted accessibilityLiveRegion="polite">
        {failed
          ? "Could not play pronunciation. Check your sound output and try Listen again."
          : mode === "unavailable"
            ? "Pronunciation needs a browser with audio support. Try the Windows app, Chrome or Edge."
            : playback === "preparing"
              ? "Preparing pronunciation…"
              : playback === "playing"
                ? "Playing Dutch pronunciation…"
                : mode === "offline"
                  ? "Built-in Dutch voice · works offline"
                  : "Dutch device voice · works offline"}
      </Body>
    </View>
  );
}
