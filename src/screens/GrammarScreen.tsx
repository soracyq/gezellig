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
import { useLearning } from "../state/LearningProvider";
import { CompleteItem } from "../components/CompleteItem";
import { PracticeQuestion } from "../components/PracticeQuestion";
import { cefrLevels } from "../data/sample-content";
import type { GrammarTopic } from "../domain/models";
import { colors as c, typography } from "../theme/tokens";

export default function GrammarScreen() {
  const { width } = useWindowDimensions();
  const { grammar: grammarTopics, completedLessonIds } = useLearning();
  const { preview, level: initialLevel } = useLocalSearchParams<{
    preview?: string;
    level?: string;
  }>();
  const [limit, setLimit] = useState(50);
  const router = useRouter();
  const [level, setLevel] = useState(initialLevel ?? "A1");
  const selected = grammarTopics.find((topic) => topic.id === preview) ?? null;
  const [section, setSection] = useState<
    "Understand" | "Examples" | "Practice"
  >("Understand");
  const topics = grammarTopics.filter((topic) => topic.level === level);
  function openTopic(topic: GrammarTopic) {
    router.setParams({ preview: topic.id });
    setSection("Understand");
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
            Start with articles and the present tense, or bring your own
            lessons. Read, explore examples, and complete a lesson at your own
            pace.
          </Body>
        </View>
        <Action
          title="Import grammar"
          href="/import?kind=grammar"
          variant="secondary"
          icon="upload"
        />
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
        subtitle={`${topics.length} lessons available`}
      />
      {topics.length === 0 ? (
        <EmptyState
          title={`More ${level} lessons will grow here`}
          description="Import grammar lessons for this level, or explore the A1 sample lessons."
        />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 22 }}>
          {topics.slice(0, limit).map((topic, i) => (
            <Card
              key={topic.id}
              style={{ width: width < 780 ? "100%" : "48%", gap: 16 }}
            >
              <View style={s.cardHeader}>
                <View style={s.lessonNumber}>
                  <Text style={s.lessonNumberText}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                </View>
                <Badge>
                  {topic.level} · {topic.category}
                </Badge>
              </View>
              <Text style={s.lessonTitle}>{topic.title}</Text>
              <Badge tone="neutral">
                {topic.isSample ? "Sample lesson" : "Imported lesson"}
              </Badge>
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
                title={
                  completedLessonIds.has(topic.id)
                    ? "Revisit lesson"
                    : "Open lesson"
                }
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
      {topics.length > limit && (
        <Action
          title="Show 50 more lessons"
          onPress={() => setLimit((n) => n + 50)}
          variant="secondary"
        />
      )}
      <View style={s.note}>
        <Icon name="info" size={15} />
        <Body muted style={{ flex: 1, fontSize: 12 }}>
          Sample lessons and level assignments are provisional. Imported lessons
          without exercises are available for reading and completion.
        </Body>
      </View>
      <PreviewModal
        visible={selected !== null}
        onClose={closePreview}
        title={selected?.title ?? "Lesson preview"}
        contentKey={`${selected?.id}:${section}`}
      >
        {selected && (
          <>
            <View style={s.sectionTabs}>
              {(["Understand", "Examples", "Practice"] as const).map(
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
                {selected.usageNotes?.map((note, i) => (
                  <Body key={i} muted>
                    {note}
                  </Body>
                ))}
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
                  title="Try practice"
                  onPress={() => setSection("Practice")}
                  variant="secondary"
                  icon="arrow-right"
                />
              </>
            )}
            {section === "Practice" &&
              (selected.questions.length > 0 ? (
                selected.questions.map((question) => (
                  <PracticeQuestion
                    key={question.id}
                    question={question}
                    contentType="grammar"
                  />
                ))
              ) : (
                <Body muted>
                  No exercises are included with this lesson. You can still read
                  the explanation and mark the lesson complete.
                </Body>
              ))}
            <CompleteItem key={selected.id} id={selected.id} type="grammar" />
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
