import { useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  EmptyState,
  Icon,
  Label,
  PageHeading,
  ProgressBar,
} from "../components/ui";
import { demoStatistics, reviewQuestions } from "../data/sample-content";
import { colors as c, radius, spacing, typography } from "../theme/tokens";

export default function ReviewScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { width } = useWindowDimensions();
  const question = reviewQuestions[questionIndex];
  const wide = width >= 1100;

  function nextPreview() {
    setQuestionIndex((current) => (current + 1) % reviewQuestions.length);
    setRevealed(false);
  }

  return (
    <View style={s.page}>
      <PageHeading
        eyebrow="A LITTLE PRACTICE, OFTEN"
        title="Make it stick."
        subtitle="Take a look at how a gentle review moment could feel."
      >
        <Badge tone="orange">Sample preview</Badge>
      </PageHeading>

      <Card style={s.demoNote}>
        <View style={s.demoIcon}>
          <Icon name="refresh-cw" color={c.orange} />
        </View>
        <View style={s.flex}>
          <Text style={s.demoTitle}>
            Demo overview · {demoStatistics.dueReviews} items due
          </Text>
          <Body muted style={s.small}>
            This is a fictional due count. The {reviewQuestions.length} sample
            questions below are a separate preview collection.
          </Body>
        </View>
        <Badge tone="neutral">Demo data</Badge>
      </Card>

      {!question ? (
        <EmptyState
          icon="check-circle"
          title="No sample reviews yet."
          description="Sample review questions will appear here when they are available."
        />
      ) : (
        <View style={[s.layout, !wide && s.stack]}>
          <Card style={s.questionCard}>
            <View style={s.questionTop}>
              <Label color={c.blue}>VOCABULARY PREVIEW</Label>
              <Text style={s.counter}>
                {String(questionIndex + 1).padStart(2, "0")}{" "}
                <Text style={s.counterMuted}>
                  / {String(reviewQuestions.length).padStart(2, "0")}
                </Text>
              </Text>
            </View>
            <ProgressBar
              value={((questionIndex + 1) / reviewQuestions.length) * 100}
              label={`Preview ${questionIndex + 1} of ${reviewQuestions.length}`}
              color={c.blue}
            />
            <View style={s.promptBlock}>
              <Badge tone="neutral">Sample question</Badge>
              <Text accessibilityRole="header" style={s.prompt}>
                {question.prompt}
              </Text>
              <Body muted style={s.small}>
                Consider the options, then reveal the answer.
              </Body>
            </View>
            <View style={s.options}>
              {question.options.map((option, index) => {
                const correct = revealed && option === question.correctAnswer;
                return (
                  <View
                    key={`${question.id}-${option}`}
                    style={[s.option, correct && s.correctOption]}
                  >
                    <View style={[s.optionLetter, correct && s.correctLetter]}>
                      <Text
                        style={[s.letterText, correct && s.correctLetterText]}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={s.optionText}>{option}</Text>
                    {correct && (
                      <Icon name="check-circle" color={c.green} size={19} />
                    )}
                  </View>
                );
              })}
            </View>
            {revealed && (
              <View accessibilityLiveRegion="polite" style={s.answer}>
                <Label color={c.green}>
                  THE ANSWER IS {question.correctAnswer.toUpperCase()}
                </Label>
                <Body>{question.explanation}</Body>
              </View>
            )}
            <View style={s.actions}>
              <Action
                title={revealed ? "Hide answer" : "Reveal answer"}
                onPress={() => setRevealed((current) => !current)}
                icon={revealed ? "eye-off" : "eye"}
              />
              <Action
                title="Next preview"
                onPress={nextPreview}
                icon="arrow-right"
                variant="secondary"
              />
            </View>
            <View style={s.previewNote}>
              <Icon name="info" size={15} />
              <Body muted style={s.small}>
                Preview only. Answers are not graded and learning progress is
                not recorded.
              </Body>
            </View>
          </Card>

          <View style={[s.sidebar, !wide && s.sidebarStack]}>
            <Card style={s.rhythmCard}>
              <View style={s.rhythmIcon}>
                <Icon name="sun" size={25} color={c.blue} />
              </View>
              <Text accessibilityRole="header" style={s.sideTitle}>
                Small steps. Lasting learning.
              </Text>
              <Body muted>
                Review brings familiar words back into focus, a little at a
                time.
              </Body>
              <View style={s.ruleDivider} />
              <Label color={c.blue}>PLANNED FOR A LATER MILESTONE</Label>
              <View style={s.feature}>
                <Icon name="calendar" size={18} color={c.blue} />
                <Body style={s.featureText}>
                  Return to words in spaced review sessions.
                </Body>
              </View>
              <View style={s.feature}>
                <Icon name="rotate-ccw" size={18} color={c.blue} />
                <Body style={s.featureText}>
                  Give difficult words another chance.
                </Body>
              </View>
              <View style={s.feature}>
                <Icon name="check-circle" size={18} color={c.blue} />
                <Body style={s.featureText}>
                  Build mastery with five consecutive correct scheduled reviews.
                </Body>
              </View>
            </Card>
            <View style={s.sideFootnote}>
              <Body muted style={s.small}>
                Ready to explore something new?
              </Body>
              <Action
                title="Browse vocabulary"
                href="/vocabulary"
                variant="quiet"
                icon="arrow-right"
                style={s.browseAction}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: spacing.xl },
  flex: { flex: 1, gap: spacing.xs, minWidth: 170 },
  small: { fontSize: 12, lineHeight: 19, flexShrink: 1 },
  demoNote: {
    backgroundColor: c.orangeSoft,
    borderColor: c.orangeSoft,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  demoTitle: {
    color: c.navy,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  layout: { flexDirection: "row", gap: spacing.xl, alignItems: "flex-start" },
  stack: { flexDirection: "column", alignItems: "stretch" },
  questionCard: { flex: 1, gap: spacing.xl, width: "100%" },
  questionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  counter: {
    color: c.navy,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  counterMuted: { color: c.faint },
  promptBlock: { gap: spacing.md, paddingVertical: spacing.sm },
  prompt: {
    color: c.navy,
    fontSize: 25,
    fontWeight: "600",
    lineHeight: 35,
    letterSpacing: -0.4,
    fontFamily: typography.family,
  },
  options: { gap: spacing.md },
  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.background,
  },
  correctOption: { backgroundColor: c.greenSoft, borderColor: c.green },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: c.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  correctLetter: { backgroundColor: c.green },
  letterText: {
    color: c.muted,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: typography.family,
  },
  correctLetterText: { color: c.white },
  optionText: {
    flex: 1,
    color: c.navy,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: typography.family,
  },
  answer: {
    gap: spacing.sm,
    backgroundColor: c.greenSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  previewNote: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  sidebar: { width: 290, gap: spacing.lg },
  sidebarStack: { width: "100%" },
  rhythmCard: {
    gap: spacing.lg,
    backgroundColor: c.blueSoft,
    borderColor: c.blueSoft,
  },
  rhythmIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sideTitle: {
    color: c.navy,
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "600",
    letterSpacing: -0.5,
    fontFamily: typography.family,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: c.illustration.water,
    marginVertical: spacing.xs,
  },
  feature: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  featureText: { flex: 1, fontSize: 13, lineHeight: 20 },
  sideFootnote: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  browseAction: { paddingHorizontal: 0 },
});
