import { View } from "react-native";
import { googleTranslateUrl } from "../domain/externalLinks";
import { Action, Body } from "./ui";

export function ReviewTranslate({
  text,
  draft = false,
}: {
  text: string;
  draft?: boolean;
}) {
  const dutch = text.trim();
  if (!dutch) return null;
  return (
    <View style={{ gap: 6, alignItems: "flex-start" }}>
      <Action
        title="Google Translate"
        accessibilityLabel={
          draft
            ? "Listen to your draft answer in Google Translate"
            : "Listen to this Dutch text in Google Translate"
        }
        href={googleTranslateUrl(dutch)}
        target="_blank"
        variant="secondary"
        icon="external-link"
        disabled={dutch.length > 500}
      />
      <Body muted style={{ fontSize: 12 }}>
        {dutch.length > 500
          ? "Use a phrase of up to 500 characters for Google Translate."
          : "Google Translate opens in your browser. Use its speaker button to listen there."}
      </Body>
    </View>
  );
}
