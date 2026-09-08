import { useMemo, useState } from "react";
import { View } from "react-native";
import {
  Action,
  Badge,
  Body,
  Card,
  PageHeading,
  SectionHeading,
} from "../components/ui";
import { PracticeQuestion } from "../components/PracticeQuestion";
import { reviewQuestions } from "../data/sample-content";
import { vocabularyPractice } from "../domain/practice";
import { useLearning } from "../state/LearningProvider";
import { colors as c } from "../theme/tokens";

export default function ReviewScreen() {
  const { vocabulary, statistics } = useLearning();
  const questions = useMemo(
    () => vocabularyPractice(vocabulary, reviewQuestions),
    [vocabulary],
  );
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState<"practice" | "preview">("practice");
  const [revealed, setRevealed] = useState(false);
  const question = questions[index % questions.length];
  function next() {
    setIndex((i) => (i + 1) % questions.length);
    setRound((n) => n + 1);
    setRevealed(false);
  }
  return (
    <View style={{ gap: 24 }}>
      <PageHeading
        eyebrow="A LITTLE PRACTICE, OFTEN"
        title="Make it stick."
        subtitle="Recall a meaning, check your answer, and keep learning."
      />
      <Card style={{ backgroundColor: c.blueSoft, gap: 12 }}>
        <SectionHeading title="Your practice collection" />
        <Body>
          {questions.length} vocabulary questions available ·{" "}
          {statistics.practiceAnswers} answers submitted
        </Body>
        <Body muted>
          Practice includes the starter questions and meanings from your
          vocabulary imports. Scheduled reviews and mastery are still to come.
        </Body>
      </Card>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Action
          title="Practice and save answers"
          variant={mode === "practice" ? "primary" : "secondary"}
          onPress={() => {
            setMode("practice");
            setRound((n) => n + 1);
          }}
        />
        <Action
          title="Preview without progress"
          variant={mode === "preview" ? "primary" : "secondary"}
          onPress={() => {
            setMode("preview");
            setRevealed(false);
          }}
        />
      </View>
      {question ? (
        <Card style={{ gap: 22, maxWidth: 850 }}>
          <Badge>
            {mode === "preview"
              ? "Preview · No progress saved"
              : "Practice · Answers are saved"}
          </Badge>
          <Body muted>
            Question {index + 1} of {questions.length}
          </Body>
          {mode === "practice" ? (
            <PracticeQuestion
              key={`${question.id}:${round}`}
              question={question}
              contentType="vocabulary"
            />
          ) : (
            <View style={{ gap: 16 }}>
              <Body style={{ fontSize: 22, fontWeight: "600" }}>
                {question.prompt}
              </Body>
              {question.options.map((option) => (
                <Body key={option}>{option}</Body>
              ))}
              <Action
                title={revealed ? "Hide answer" : "Reveal answer"}
                onPress={() => setRevealed((value) => !value)}
                variant="secondary"
              />
              {revealed && (
                <Body>
                  {question.correctAnswer} — {question.explanation}
                </Body>
              )}
              <Body muted>
                Previewing and revealing answers do not count as learning
                activity.
              </Body>
            </View>
          )}
          <Action
            title="Next question"
            onPress={next}
            variant="secondary"
            icon="arrow-right"
          />
          <Body muted style={{ fontSize: 12 }}>
            Skipping a question records nothing. A submitted answer counts once
            for that attempt; you can practice a question again.
          </Body>
        </Card>
      ) : (
        <Body>No practice questions are available yet.</Body>
      )}
    </View>
  );
}
