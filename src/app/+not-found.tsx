import { Action, EmptyState } from "../components/ui";
import { View } from "react-native";
export default function NotFound() {
  return (
    <View style={{ gap: 20 }}>
      <EmptyState
        title="This page has wandered off"
        description="Choose an area from the menu, or return to your learning space."
        icon="compass"
      />
      <Action title="Back to Home" href="/" />
    </View>
  );
}
