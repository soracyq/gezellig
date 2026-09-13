import { useRef, useState } from "react";
import { randomUUID } from "expo-crypto";
import { Pressable, TextInput, View } from "react-native";
import type { GrammarExercise, GrammarTopic } from "../domain/models";
import { grammarExercises } from "../domain/grammarPractice";
import { useLearning } from "../state/LearningProvider";
import { Action, Badge, Body, Card, styles as uiStyles } from "./ui";
import { colors } from "../theme/tokens";

export function GrammarPractice({ lesson }: { lesson: GrammarTopic }) {
  const questions = grammarExercises(lesson);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);
  if (!questions.length)
    return (
      <Body muted>
        This custom lesson has no questions or translated examples yet. You can
        still read it and complete the lesson.
      </Body>
    );
  if (finished)
    return (
      <Card style={{ gap: 12, backgroundColor: colors.blueSoft }}>
        <Body style={{ fontSize: 22, fontWeight: "600" }}>
          Practice complete
        </Body>
        <Body>
          {score} / {questions.length} correct
        </Body>
        <Body muted>
          Your answers are saved. Lesson completion is your choice below.
        </Body>
        <Action
          title="Practise again"
          variant="secondary"
          onPress={() => {
            setIndex(0);
            setScore(0);
            setFinished(false);
            setRun((n) => n + 1);
          }}
        />
      </Card>
    );
  return (
    <View style={{ gap: 16 }}>
      <Body style={{ fontWeight: "600" }}>
        Question {index + 1} of {questions.length}
      </Body>
      <Exercise
        key={`${run}:${questions[index].id}`}
        question={questions[index]}
        onNext={(correct) => {
          setScore((value) => value + Number(correct));
          if (index + 1 === questions.length) setFinished(true);
          else setIndex((value) => value + 1);
        }}
        last={index + 1 === questions.length}
      />
      <Body muted style={{ fontSize: 12 }}>
        Each checked answer is saved to Statistics. Practice does not use your
        daily review quota. Reopening Practice starts a new round.
      </Body>
    </View>
  );
}

function Exercise({
  question,
  onNext,
  last,
}: {
  question: GrammarExercise;
  onNext: (correct: boolean) => void;
  last: boolean;
}) {
  const { answerGrammar, busy, loading, activityError } = useLearning();
  const [answer, setAnswer] = useState("");
  const [chosen, setChosen] = useState<number[]>([]);
  const [saved, setSaved] = useState<{
    answer: string;
    correct: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptId] = useState(() => randomUUID());
  const submitting = useRef(false);
  const advanced = useRef(false);
  const locked = !!saved || busy || loading || !!activityError;
  async function submit() {
    if (locked || submitting.current || !answer.trim()) return;
    submitting.current = true;
    setError(null);
    try {
      const result = await answerGrammar(
        question.relatedItemId,
        question.id,
        answer,
        attemptId,
      );
      setSaved({ answer: result.answer, correct: result.correct });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save the answer. Try again.",
      );
    } finally {
      submitting.current = false;
    }
  }
  return (
    <View style={{ gap: 14 }}>
      <Badge>
        {saved
          ? "Answer saved"
          : `Practice · ${question.kind.replace("-", " ")}`}
      </Badge>
      <Body style={{ fontSize: 20, fontWeight: "600" }}>
        {question.kind === "translation"
          ? `Translate into Dutch:\n${question.prompt}`
          : question.prompt}
      </Body>
      {!!question.hint && <Body muted>{question.hint}</Body>}
      {question.kind === "multiple-choice" ? (
        question.options?.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            aria-checked={(saved?.answer ?? answer) === option}
            accessibilityState={{
              checked: (saved?.answer ?? answer) === option,
              disabled: locked,
            }}
            disabled={locked}
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
        ))
      ) : (
        <>
          {question.kind === "ordering" && (
            <View style={{ gap: 8 }}>
              <Body muted>
                Tap the words in order, or type your sentence below.
              </Body>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {question.chunks?.map((chunk, i) => (
                  <Action
                    key={i}
                    title={chunk}
                    variant="secondary"
                    disabled={locked || chosen.includes(i)}
                    onPress={() => {
                      if (submitting.current) return;
                      const next = [...chosen, i];
                      setChosen(next);
                      setAnswer(next.map((n) => question.chunks![n]).join(" "));
                    }}
                  />
                ))}
              </View>
              <Action
                title="Clear word order"
                variant="secondary"
                disabled={locked}
                onPress={() => {
                  setChosen([]);
                  setAnswer("");
                }}
              />
            </View>
          )}
          <TextInput
            accessibilityLabel="Your Dutch answer"
            placeholder={
              question.kind === "fill-blank"
                ? "Type the missing form"
                : "Type your Dutch sentence"
            }
            value={saved?.answer ?? answer}
            editable={!locked}
            onChangeText={(value) => {
              if (!submitting.current) {
                setAnswer(value);
                setChosen([]);
              }
            }}
            autoCorrect={false}
            autoCapitalize="none"
            multiline
            placeholderTextColor={colors.muted}
            style={uiStyles.answerInput}
          />
        </>
      )}
      {saved ? (
        <>
          <Card
            style={{
              backgroundColor: saved.correct
                ? colors.greenSoft
                : colors.orangeSoft,
              gap: 8,
            }}
          >
            <Body style={{ fontWeight: "600" }}>
              {saved.correct ? "Correct." : "Not quite."} The answer is{" "}
              {question.correctAnswer}
              {/[.!?]$/.test(question.correctAnswer) ? "" : "."}
            </Body>
            <Body>{question.explanation}</Body>
            {!saved.correct && (
              <Body muted>
                Answers use the lesson wording and listed alternatives. Compare
                the form and word order before continuing.
              </Body>
            )}
          </Card>
          <Action
            title={last ? "See results" : "Next question"}
            onPress={() => {
              if (!advanced.current) {
                advanced.current = true;
                onNext(saved.correct);
              }
            }}
            icon="arrow-right"
          />
        </>
      ) : (
        <Action
          title="Check answer"
          disabled={locked || !answer.trim()}
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
