import { useRef, useState } from "react";
import { randomUUID } from "expo-crypto";
import { Pressable, View } from "react-native";
import type { ContentType, Question } from "../domain/models";
import { useLearning } from "../state/LearningProvider";
import { Action, Badge, Body, Card } from "./ui";
import { colors } from "../theme/tokens";

export function PracticeQuestion({
  question,
  contentType,
}: {
  question: Question;
  contentType: ContentType;
}) {
  const { answerQuestion, busy, loading, activityError } = useLearning();
  const [answer, setAnswer] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptId] = useState(() => randomUUID());
  const submitting = useRef(false);
  const submitted = submittedAnswer !== null;
  const optionsDisabled = submitted || busy || loading || !!activityError;
  async function submit() {
    if (!answer || submitted || submitting.current) return;
    submitting.current = true;
    setError(null);
    try {
      await answerQuestion(question, answer, contentType, attemptId);
      setSubmittedAnswer(answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the answer.");
    } finally {
      submitting.current = false;
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <Badge>
        {submitted ? "Answer saved" : "Practice · Answers are saved"}
      </Badge>
      <Body style={{ fontSize: 20, fontWeight: "600" }}>{question.prompt}</Body>
      {question.options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="radio"
          aria-checked={(submittedAnswer ?? answer) === option}
          accessibilityState={{
            checked: (submittedAnswer ?? answer) === option,
            disabled: optionsDisabled,
          }}
          disabled={optionsDisabled}
          onPress={() => {
            if (!submitting.current) setAnswer(option);
          }}
          style={{
            padding: 16,
            minHeight: 48,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: answer === option ? colors.blue : colors.line,
            backgroundColor:
              answer === option ? colors.blueSoft : colors.surface,
          }}
        >
          <Body>{option}</Body>
        </Pressable>
      ))}
      {submitted ? (
        <Card
          style={{
            backgroundColor:
              submittedAnswer === question.correctAnswer
                ? colors.greenSoft
                : colors.orangeSoft,
            gap: 8,
          }}
        >
          <Body style={{ fontWeight: "600" }}>
            {submittedAnswer === question.correctAnswer
              ? "Correct."
              : "Not quite."}{" "}
            The answer is {question.correctAnswer}.
          </Body>
          <Body>{question.explanation}</Body>
        </Card>
      ) : (
        <Action
          title="Check answer"
          disabled={!answer || busy || loading || !!activityError}
          onPress={() => void submit()}
          icon="check"
        />
      )}
      {(error || activityError) && (
        <Body accessibilityRole="alert" style={{ color: colors.orangeText }}>
          {error || activityError}
        </Body>
      )}
    </View>
  );
}
