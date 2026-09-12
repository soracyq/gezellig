import { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  EmptyState,
  PageHeading,
  SectionHeading,
} from "../components/ui";
import { dailyReview } from "../domain/review";
import { ReviewRefresh } from "../components/ReviewRefresh";
import type { TranslationQuestion } from "../domain/models";
import { useLearning } from "../state/LearningProvider";
import { useSettings } from "../state/SettingsProvider";
import { colors as c, typography } from "../theme/tokens";

export default function ReviewScreen() {
  const {
    vocabulary,
    grammar,
    activity,
    now,
    loading,
    activityError,
    curriculumError,
  } = useLearning();
  const { dailyTarget, isLoading, error } = useSettings();
  const plan = dailyReview(vocabulary, grammar, activity, dailyTarget, now);
  return (
    <View style={{ gap: 24 }}>
      <PageHeading
        eyebrow="A LITTLE PRACTICE, OFTEN"
        title="Make it stick."
        subtitle="Refresh what’s due, then test your Dutch. A little practice over time."
      />
      {loading || isLoading ? (
        <Body>Loading today’s review…</Body>
      ) : activityError || curriculumError || error ? (
        <Body>{activityError || curriculumError || error}</Body>
      ) : (
        <DailySession key={plan.day} plan={plan} />
      )}
    </View>
  );
}
function StudyActions() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      <Action title="Learn vocabulary" href="/vocabulary" variant="secondary" />
      <Action title="Study grammar" href="/grammar" variant="secondary" />
    </View>
  );
}
function DailySession({ plan }: { plan: ReturnType<typeof dailyReview> }) {
  const { answerReview, busy, refresh } = useLearning();
  const { refresh: refreshSettings } = useSettings();
  const [chosen, setChosen] = useState<string | null>(null);
  const [refreshed, setRefreshed] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<{
    question: TranslationQuestion;
    correct: boolean;
    alreadySaved: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const current =
    feedback?.question ??
    plan.questions.find((c) => c.question.id === chosen)?.question ??
    plan.questions[0]?.question;
  const needsRefresh =
    !feedback &&
    plan.questions.some((item) => !refreshed.has(item.question.id));
  async function submit(answer: string) {
    if (!current || feedback || submitting.current) return;
    submitting.current = true;
    setError(null);
    try {
      const result = await answerReview(current, answer, plan.day);
      setFeedback({
        question: current,
        correct: result.correct,
        alreadySaved: result.alreadySaved,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your answer.");
    } finally {
      submitting.current = false;
    }
  }
  if (!plan.eligible && !plan.completed)
    return (
      <View style={{ gap: 20 }}>
        <EmptyState
          title="Nothing to review yet"
          description="Mark a vocabulary word studied or complete a grammar lesson first. Its first review is scheduled for the next day."
        />
        <StudyActions />
        <Body muted>
          Review uses studied items with suitable translation examples. Imported
          content becomes available to learn; importing does not count as
          studying.
        </Body>
      </View>
    );
  return (
    <View style={{ gap: 24 }}>
      <Card style={{ backgroundColor: c.blueSoft, gap: 10 }}>
        <SectionHeading title="Today’s review" />
        <Body>
          {plan.completed} of {plan.total} completed · {plan.remaining}{" "}
          remaining
        </Body>
        <Body muted>
          {plan.total} review questions available today · Daily maximum:{" "}
          {plan.target}
        </Body>
        <Body muted>
          Due and difficult items come first. Each word or lesson appears at
          most once today.
        </Body>
      </Card>
      {needsRefresh ? (
        <ReviewRefresh
          key={plan.questions.map((item) => item.key).join("|")}
          questions={plan.questions}
          start={() =>
            setRefreshed(
              (previous) =>
                new Set([
                  ...previous,
                  ...plan.questions.map((item) => item.question.id),
                ]),
            )
          }
        />
      ) : current ? (
        <Card style={{ gap: 18, maxWidth: 850 }}>
          <Badge>
            {current.contentType === "grammar"
              ? "Grammar translation"
              : "Vocabulary translation"}
          </Badge>
          <Body muted>Phase 2 · Test</Body>
          <Body accessibilityRole="header" style={s.heading}>
            Translate into Dutch
          </Body>
          <Body style={s.prompt}>{current.prompt}</Body>
          <Body muted>{current.hint}</Body>
          {feedback ? (
            <View accessibilityLiveRegion="polite" style={{ gap: 14 }}>
              <Body
                style={{
                  fontWeight: "700",
                  color: feedback.correct ? c.green : c.orange,
                }}
              >
                {feedback.correct ? "Correct —" : "Not quite. Correct answer:"}{" "}
                {current.correctAnswer}
              </Body>
              <Body muted>{current.label}</Body>
              {current.rule && <Body>{current.rule}</Body>}
              <Body muted>
                {feedback.alreadySaved
                  ? "This item was already saved today; no extra attempt was added."
                  : "Answer saved."}
              </Body>
              <Action
                title={plan.remaining ? "Next question" : "See today’s results"}
                onPress={() => {
                  setFeedback(null);
                  setChosen(null);
                  setError(null);
                }}
                icon="arrow-right"
              />
            </View>
          ) : (
            <TranslationInput
              key={current.id}
              grammar={current.contentType === "grammar"}
              busy={busy}
              submit={submit}
            />
          )}
          {!feedback && (
            <Action
              title="Skip for now"
              variant="quiet"
              disabled={busy}
              onPress={() => {
                const index = plan.questions.findIndex(
                  (c) => c.question.id === current.id,
                );
                setChosen(
                  plan.questions[(index + 1) % plan.questions.length]?.question
                    .id ?? null,
                );
                setError(null);
              }}
            />
          )}
          {!feedback && (
            <Body muted>
              Skipping records nothing and does not use your daily allowance.
            </Body>
          )}
          {error && (
            <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
              <Body style={{ color: c.orange }}>{error}</Body>
              <Action
                title="Refresh review"
                variant="secondary"
                onPress={() => void Promise.all([refresh(), refreshSettings()])}
              />
            </View>
          )}
        </Card>
      ) : (
        <Card style={{ gap: 16, maxWidth: 850 }}>
          <SectionHeading
            title={plan.completed ? "Review complete" : "No reviews due today"}
          />
          <Body>
            {plan.completed >= plan.target
              ? `You completed your ${plan.completed} review questions for today.`
              : "You’re all caught up for today."}
          </Body>
          {plan.completed > 0 && (
            <Body>
              {plan.correct} correct · {plan.incorrect} incorrect ·{" "}
              {plan.accuracy ?? 0}% accuracy
            </Body>
          )}
          <Body>
            {plan.vocabularyReviewed} vocabulary items reviewed ·{" "}
            {plan.grammarReviewed} grammar lessons reviewed
          </Body>
          <Body muted>
            {plan.deferred
              ? `${plan.deferred} due items remain saved for a future daily allowance. `
              : ""}
            {plan.nextDueDay
              ? `Next scheduled review: ${plan.nextDueDay}. `
              : ""}
            Your daily allowance renews on your next local calendar day. Your
            learning history stays saved.
          </Body>
          <Action title="Return home" href="/" />
          <StudyActions />
        </Card>
      )}
      <Body muted>
        {plan.mastered} items have reached five consecutive correct scheduled
        reviews. Reviews are spaced over separate scheduled days; practice and
        refreshing do not advance that count.
      </Body>
    </View>
  );
}
function TranslationInput({
  grammar,
  busy,
  submit,
}: {
  grammar: boolean;
  busy: boolean;
  submit: (answer: string) => Promise<void>;
}) {
  const [answer, setAnswer] = useState("");
  return (
    <View style={{ gap: 14 }}>
      <TextInput
        accessibilityLabel="Your Dutch answer"
        placeholder="Type your Dutch answer…"
        placeholderTextColor={c.muted}
        value={answer}
        onChangeText={setAnswer}
        editable={!busy}
        multiline={grammar}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        maxLength={4000}
        style={[
          s.input,
          grammar && { minHeight: 140, textAlignVertical: "top" },
        ]}
        onSubmitEditing={grammar ? undefined : () => void submit(answer)}
      />
      <Action
        title="Check answer"
        disabled={!answer.trim() || busy}
        onPress={() => void submit(answer)}
        icon="check"
      />
    </View>
  );
}
const s = StyleSheet.create({
  heading: { fontSize: typography.sizes.subtitle, fontWeight: "600" },
  prompt: {
    fontSize: typography.sizes.title,
    lineHeight: 36,
    fontWeight: "600",
  },
  input: {
    fontFamily: typography.family,
    fontSize: typography.sizes.subtitle,
    lineHeight: 28,
    minHeight: 54,
    padding: 14,
    borderWidth: 1,
    borderColor: c.blue,
    borderRadius: 10,
    color: c.text,
    backgroundColor: c.surface,
  },
});
