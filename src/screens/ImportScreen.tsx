import { View } from "react-native";
import { Body, Card, PageHeading } from "../components/ui";

export default function ImportScreen() {
  return (
    <View>
      <PageHeading
        eyebrow="GROW YOUR COLLECTION"
        title="Bring your own Dutch."
        subtitle="Vocabulary and grammar, in one learning space."
      />
      <Card>
        <Body>
          CSV and Excel imports are available in the browser version and the
          Windows desktop app. Native iOS and Android file importing is planned
          for a later release.
        </Body>
      </Card>
    </View>
  );
}
