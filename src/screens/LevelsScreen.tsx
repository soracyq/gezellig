import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  EmptyState,
  Icon,
  Label,
  PageHeading,
  SectionHeading,
} from "../components/ui";
import { cefrLevels } from "../data/sample-content";
import { useLearning } from "../state/LearningProvider";
import type { CEFRLevel } from "../domain/models";
import { colors as c, radius, spacing, typography } from "../theme/tokens";

const levelNames: Record<CEFRLevel, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-intermediate",
  C1: "Advanced",
};

export default function LevelsScreen() {
  const { vocabulary: vocabularyItems, grammar: grammarTopics } = useLearning();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("A1");
  const { width } = useWindowDimensions();
  const wide = width >= 1050;
  const words = vocabularyItems.filter((item) => item.level === selectedLevel);
  const topics = grammarTopics.filter((item) => item.level === selectedLevel);
  const hasContent = words.length > 0 || topics.length > 0;

  return (
    <View style={s.page}>
      <PageHeading
        eyebrow="YOUR LEARNING PATH"
        title="One level at a time."
        subtitle="Explore your route through Dutch, from A1 to C1."
      >
        <Badge tone="orange">Your curriculum</Badge>
      </PageHeading>

      <View style={s.levels}>
        {cefrLevels.map((level) => {
          const selected = selectedLevel === level;
          return (
            <Pressable
              key={level}
              accessibilityRole="button"
              accessibilityLabel={`${level} — ${levelNames[level]}`}
              accessibilityState={{ selected }}
              aria-pressed={selected}
              onPress={() => setSelectedLevel(level)}
              style={({ pressed }) => [
                s.level,
                selected && s.selectedLevel,
                pressed && s.pressed,
              ]}
            >
              <Text style={[s.levelName, selected && s.selectedLevelName]}>
                {level}
              </Text>
              <Text style={[s.levelCaption, selected && s.selectedCaption]}>
                {levelNames[level]}
              </Text>
              <Icon
                name={selected ? "arrow-down" : "arrow-right"}
                size={16}
                color={selected ? c.white : c.muted}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={s.openNote}>
        <Icon name="unlock" size={15} color={c.green} />
        <Body muted style={s.small}>
          All levels are open to explore. Choose the place that feels right for
          you.
        </Body>
      </View>

      {hasContent ? (
        <View style={s.content}>
          <Card style={s.intro}>
            <View style={[s.introRow, !wide && s.stacked]}>
              <View style={s.introText}>
                <Label color={c.blue}>{selectedLevel} · A PLACE TO BEGIN</Label>
                <Text accessibilityRole="header" style={s.introTitle}>
                  Start with the everyday.
                </Text>
                <Body muted>
                  Explore the words and lessons in your collection. Import
                  additional material whenever you are ready.
                </Body>
              </View>
              <View style={s.counts}>
                <View style={s.count}>
                  <Text style={s.countNumber}>{words.length}</Text>
                  <Body muted style={s.small}>
                    words available
                  </Body>
                </View>
                <View style={s.countDivider} />
                <View style={s.count}>
                  <Text style={s.countNumber}>{topics.length}</Text>
                  <Body muted style={s.small}>
                    grammar topics
                  </Body>
                </View>
              </View>
            </View>
          </Card>

          <View style={[s.columns, !wide && s.stacked]}>
            <Card style={s.column}>
              <View style={s.cardHeading}>
                <View style={[s.iconBox, { backgroundColor: c.orangeSoft }]}>
                  <Icon name="book-open" color={c.orange} />
                </View>
                <View style={s.headingText}>
                  <Text accessibilityRole="header" style={s.cardTitle}>
                    Words for your world
                  </Text>
                  <Body muted style={s.small}>
                    Vocabulary · {selectedLevel}
                  </Body>
                </View>
              </View>
              <Body muted>
                Meet nouns, verbs, an adjective, and an everyday expression.
                Each word has an English meaning and a Dutch example.
              </Body>
              <View style={s.wordChips}>
                {words.slice(0, 5).map((word) => (
                  <View key={word.id} style={s.wordChip}>
                    <Text style={s.wordText}>
                      {word.wordType === "noun" && word.article
                        ? `${word.article} `
                        : ""}
                      {word.dutch}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={s.cardFooter}>
                <Action
                  title="Explore vocabulary"
                  href={`/vocabulary?level=${selectedLevel}`}
                  variant="secondary"
                  icon="arrow-right"
                />
              </View>
            </Card>

            <Card style={s.column}>
              <View style={s.cardHeading}>
                <View style={[s.iconBox, { backgroundColor: c.blueSoft }]}>
                  <Icon name="layers" color={c.blue} />
                </View>
                <View style={s.headingText}>
                  <Text accessibilityRole="header" style={s.cardTitle}>
                    Put the pieces together
                  </Text>
                  <Body muted style={s.small}>
                    Grammar · {selectedLevel}
                  </Body>
                </View>
              </View>
              <View style={s.topicList}>
                {topics.slice(0, 5).map((topic, index) => (
                  <View key={topic.id} style={s.topic}>
                    <Text style={s.topicNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <View style={s.headingText}>
                      <Text style={s.topicTitle}>{topic.title}</Text>
                      <Body muted style={s.small}>
                        {topic.estimatedMinutes} min ·{" "}
                        {topic.isSample ? "Sample lesson" : "Imported lesson"}
                      </Body>
                    </View>
                  </View>
                ))}
              </View>
              <View style={s.cardFooter}>
                <Action
                  title="Explore grammar"
                  href={`/grammar?level=${selectedLevel}`}
                  variant="secondary"
                  icon="arrow-right"
                />
              </View>
            </Card>
          </View>

          <View style={s.footnote}>
            <Icon name="info" size={16} />
            <Body muted style={s.small}>
              Starter samples and your imports are organized by level. This
              collection is not a complete or independently validated CEFR
              course.
            </Body>
          </View>
        </View>
      ) : (
        <View style={s.content}>
          <SectionHeading
            title={`Explore ${selectedLevel}`}
            subtitle="This level is accessible; your collection is empty here."
          />
          <EmptyState
            icon="compass"
            title={`A little room to grow at ${selectedLevel}.`}
            description="Import words or grammar lessons for this level, or explore the starter A1 collection."
          />
          <Action
            title="Import learning content"
            href="/import"
            variant="secondary"
            icon="upload"
          />
          <Action
            title="View A1 samples"
            onPress={() => setSelectedLevel("A1")}
            icon="arrow-left"
            variant="secondary"
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: spacing.xl },
  levels: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  level: {
    flex: 1,
    minWidth: 115,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
    gap: spacing.sm,
  },
  selectedLevel: { backgroundColor: c.navy, borderColor: c.navy },
  pressed: { opacity: 0.8 },
  levelName: {
    color: c.navy,
    fontSize: 28,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  selectedLevelName: { color: c.white },
  levelCaption: { color: c.muted, fontSize: 12, fontFamily: typography.family },
  selectedCaption: { color: c.hero },
  openNote: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  small: { fontSize: 12, lineHeight: 19, flexShrink: 1 },
  content: { gap: spacing.xl },
  intro: {
    backgroundColor: c.blueSoft,
    borderColor: c.blueSoft,
    padding: spacing.xxl,
  },
  introRow: { flexDirection: "row", gap: spacing.xxl, alignItems: "center" },
  stacked: { flexDirection: "column", alignItems: "stretch" },
  introText: { flex: 1, gap: spacing.md },
  introTitle: {
    color: c.navy,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "600",
    letterSpacing: -0.7,
    fontFamily: typography.family,
  },
  counts: { flexDirection: "row", gap: spacing.xl, alignItems: "center" },
  count: { gap: spacing.xs },
  countNumber: {
    color: c.navy,
    fontSize: 38,
    fontWeight: "500",
    fontFamily: typography.family,
  },
  countDivider: { width: 1, height: 46, backgroundColor: c.illustration.water },
  columns: { flexDirection: "row", gap: spacing.xl, alignItems: "stretch" },
  column: { flex: 1, gap: spacing.lg },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headingText: { flex: 1, gap: spacing.xs },
  cardTitle: {
    color: c.navy,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  wordChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  wordChip: {
    backgroundColor: c.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wordText: { color: c.navy, fontSize: 13, fontFamily: typography.family },
  cardFooter: { marginTop: "auto", paddingTop: spacing.sm },
  topicList: { gap: spacing.lg },
  topic: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  topicNumber: {
    color: c.muted,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  topicTitle: {
    color: c.navy,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    fontFamily: typography.family,
  },
  footnote: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
});
