import { useLocalSearchParams, useRouter } from "expo-router";
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
  PreviewModal,
  SectionHeading,
} from "../components/ui";
import { cefrLevels, grammarTopics } from "../data/sample-content";
import type { GrammarTopic } from "../domain/models";
import { colors as c, typography } from "../theme/tokens";

export default function GrammarScreen() {
  const { width } = useWindowDimensions();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const router = useRouter();
  const [level, setLevel] = useState("A1");
  const selected = grammarTopics.find((topic) => topic.id === preview) ?? null;
  const [section, setSection] = useState<
    "Understand" | "Examples" | "Practice preview"
  >("Understand");
  const [showAnswer, setShowAnswer] = useState(false);
  const topics = grammarTopics.filter((topic) => topic.level === level);
  function openTopic(topic: GrammarTopic) {
    router.setParams({ preview: topic.id });
    setSection("Understand");
    setShowAnswer(false);
  }
  function closePreview() {
    router.setParams({ preview: undefined });
  }
  return (
    <View>
      <PageHeading
        eyebrow="MAKE THE PIECES FIT"
        title="Find the rhythm of Dutch."
        subtitle="Clear explanations. Everyday examples. A little less guesswork."
      />
      <View style={[s.banner, width < 650 && s.bannerCompact]}>
        <View style={s.bannerIcon}>
          <Icon name="file-text" color={c.blue} size={31} />
        </View>
        <View style={{ flex: width < 650 ? undefined : 1, gap: 7 }}>
          <Text style={s.bannerTitle}>Small lessons, useful foundations.</Text>
          <Body muted>
            Start with articles and the present tense. These two sample lessons
            show how grammar will work.
          </Body>
        </View>
        <Badge>Sample curriculum</Badge>
      </View>
      <View style={s.levels}>
        {cefrLevels.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Grammar level ${value}`}
            accessibilityState={{ selected: value === level }}
            onPress={() => setLevel(value)}
            style={[s.level, value === level && s.activeLevel]}
          >
            <Text
              style={[
                s.levelText,
                value === level && { color: c.blue, fontWeight: "700" },
              ]}
            >
              {value}
            </Text>
            <Text style={s.levelCaption}>
              {value === "A1"
                ? "First steps"
                : value === "A2"
                  ? "Everyday life"
                  : value === "B1"
                    ? "Find your voice"
                    : value === "B2"
                      ? "Go further"
                      : "Express yourself"}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionHeading
        title={
          level === "A1" ? "Start with the essentials" : `Explore ${level}`
        }
        subtitle={`${topics.length} sample lessons available`}
      />
      {topics.length === 0 ? (
        <EmptyState
          title={`More ${level} lessons will grow here`}
          description="There are no sample lessons at this level yet. Return to A1 to explore the lesson structure."
        />
      ) : (
        <View
          style={{ flexDirection: width < 780 ? "column" : "row", gap: 22 }}
        >
          {topics.map((topic, i) => (
            <Card key={topic.id} style={{ flex: 1, gap: 16 }}>
              <View style={s.cardHeader}>
                <View
                  style={[
                    s.lessonNumber,
                    i === 1 && { backgroundColor: c.orangeSoft },
                  ]}
                >
                  <Text
                    style={[s.lessonNumberText, i === 1 && { color: c.orange }]}
                  >
                    0{i + 1}
                  </Text>
                </View>
                <Badge>
                  {topic.level} · {topic.category}
                </Badge>
              </View>
              <Text style={s.lessonTitle}>{topic.title}</Text>
              <Body muted style={{ fontSize: 14 }}>
                {topic.summary}
              </Body>
              <View style={s.lessonMeta}>
                <Icon name="clock" size={14} />
                <Text style={s.metaText}>
                  {topic.estimatedMinutes} min read
                </Text>
                <View style={s.dot} />
                <Text style={s.metaText}>{topic.examples.length} examples</Text>
              </View>
              <Action
                title="Preview lesson"
                onPress={() => openTopic(topic)}
                variant="secondary"
                icon="arrow-right"
                style={{
                  alignSelf: "stretch",
                  justifyContent: "space-between",
                  marginTop: "auto",
                }}
              />
            </Card>
          ))}
        </View>
      )}
      <View style={s.note}>
        <Icon name="info" size={15} />
        <Body muted style={{ flex: 1, fontSize: 12 }}>
          Sample lessons and level assignments are provisional. Lesson
          completion and graded tests will be added later.
        </Body>
      </View>
      <PreviewModal
        visible={selected !== null}
        onClose={closePreview}
        title={selected?.title ?? "Lesson preview"}
      >
        {selected && (
          <>
            <View style={s.sectionTabs}>
              {(["Understand", "Examples", "Practice preview"] as const).map(
                (value) => (
                  <Pressable
                    key={value}
                    onPress={() => setSection(value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: section === value }}
                    style={[
                      s.sectionTab,
                      section === value && { backgroundColor: c.blueSoft },
                    ]}
                  >
                    <Text
                      style={[
                        s.sectionTabText,
                        section === value && { color: c.blue },
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            {section === "Understand" && (
              <>
                <View style={{ gap: 9 }}>
                  <Label color={c.orange}>WHAT YOU’LL EXPLORE</Label>
                  <Body style={{ fontWeight: "600" }}>
                    {selected.objective}
                  </Body>
                </View>
                <Body>{selected.explanation}</Body>
                <View style={{ gap: 12 }}>
                  <Label>KEEP IN MIND</Label>
                  {selected.rules.map((rule) => (
                    <View key={rule} style={s.rule}>
                      <Icon name="check-circle" size={17} color={c.green} />
                      <Body style={{ flex: 1 }}>{rule}</Body>
                    </View>
                  ))}
                </View>
                <Action
                  title="See examples"
                  onPress={() => setSection("Examples")}
                  variant="secondary"
                  icon="arrow-right"
                />
              </>
            )}
            {section === "Examples" && (
              <>
                <View style={{ gap: 12 }}>
                  {selected.examples.map((example) => (
                    <Card
                      key={example.dutch}
                      style={{
                        backgroundColor: c.blueSoft,
                        borderWidth: 0,
                        gap: 6,
                      }}
                    >
                      <Body style={{ fontWeight: "600", fontSize: 17 }}>
                        {example.dutch}
                      </Body>
                      <Body muted>{example.english}</Body>
                    </Card>
                  ))}
                </View>
                <Label color={c.orange}>COMMON MISTAKES</Label>
                {selected.commonMistakes.map((mistake) => (
                  <Body key={mistake}>{mistake}</Body>
                ))}
                <Action
                  title="See practice preview"
                  onPress={() => setSection("Practice preview")}
                  variant="secondary"
                  icon="arrow-right"
                />
              </>
            )}
            {section === "Practice preview" && (
              <>
                <Badge tone="orange">Example question · No grading</Badge>
                <Body style={{ fontSize: 19, fontWeight: "600" }}>
                  {selected.questions[0].prompt}
                </Body>
                <View style={{ gap: 10 }}>
                  {selected.questions[0].options.map((option) => (
                    <View key={option} style={s.answerOption}>
                      <Body>{option}</Body>
                    </View>
                  ))}
                </View>
                {showAnswer && (
                  <Card
                    style={{
                      backgroundColor: c.greenSoft,
                      borderWidth: 0,
                      gap: 9,
                    }}
                  >
                    <Label color={c.green}>
                      ANSWER: {selected.questions[0].correctAnswer}
                    </Label>
                    <Body>{selected.questions[0].explanation}</Body>
                  </Card>
                )}
                <Action
                  title={showAnswer ? "Hide answer" : "Reveal answer"}
                  onPress={() => setShowAnswer(!showAnswer)}
                  icon="eye"
                />
                <Body muted style={{ fontSize: 12 }}>
                  This preview illustrates a future practice question. It does
                  not grade or save an attempt.
                </Body>
              </>
            )}
          </>
        )}
      </PreviewModal>
    </View>
  );
}
const s = StyleSheet.create({
  bannerCompact: { flexDirection: "column", alignItems: "flex-start" },
  banner: {
    padding: 25,
    backgroundColor: c.blueSoft,
    borderRadius: 17,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 20,
    marginBottom: 26,
  },
  bannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 17,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: c.navy,
    fontFamily: typography.family,
    letterSpacing: -0.5,
  },
  levels: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 },
  level: {
    flex: 1,
    minWidth: 110,
    padding: 17,
    gap: 6,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    minHeight: 76,
  },
  activeLevel: { backgroundColor: c.blueSoft, borderColor: c.blue },
  levelText: { fontSize: 19, color: c.navy, fontFamily: typography.family },
  levelCaption: { color: c.muted, fontSize: 11, fontFamily: typography.family },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  lessonNumber: {
    width: 53,
    height: 53,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.blueSoft,
  },
  lessonNumberText: { color: c.blue, fontSize: 22, fontWeight: "600" },
  lessonTitle: {
    fontFamily: typography.family,
    fontSize: 25,
    fontWeight: "600",
    color: c.navy,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  lessonMeta: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    paddingVertical: 5,
  },
  metaText: { color: c.muted, fontSize: 12 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: c.muted,
    marginHorizontal: 4,
  },
  note: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 25 },
  sectionTabs: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sectionTab: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 8,
  },
  sectionTabText: { color: c.muted, fontSize: 12, fontWeight: "600" },
  rule: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  answerOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 10,
  },
});
