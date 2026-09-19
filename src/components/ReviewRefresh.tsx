import { useState } from "react";
import { Platform, View } from "react-native";
import type { dailyReview } from "../domain/review";
import { vocabularyLabel } from "../domain/homeLearning";
import { useLearning } from "../state/LearningProvider";
import { Action, Badge, Body, Card, SectionHeading } from "./ui";
import { useReviewEnter } from "./useReviewEnter";
import { ReviewTranslate } from "./ReviewTranslate";

export function ReviewRefresh({
  questions,
  start,
}: {
  questions: ReturnType<typeof dailyReview>["questions"];
  start: () => void;
}) {
  const { vocabulary, grammar } = useLearning();
  const [index, setIndex] = useState(0);
  const question = questions[Math.min(index, questions.length - 1)]?.question;
  useReviewEnter(!!question, () => {
    if (index + 1 < questions.length) setIndex((value) => value + 1);
    else start();
  });
  if (!question) return null;
  const word =
    question.contentType === "vocabulary"
      ? vocabulary.find((item) => item.id === question.relatedItemId)
      : undefined;
  const lesson =
    question.contentType === "grammar"
      ? grammar.find((item) => item.id === question.relatedItemId)
      : undefined;
  const details =
    word?.wordType === "noun"
      ? [
          word.article && `Article: ${word.article}`,
          word.plural && `Plural: ${word.plural}`,
          word.diminutive && `Diminutive: ${word.diminutive}`,
        ]
      : word?.wordType === "verb"
        ? [
            word.auxiliary && `Auxiliary: ${word.auxiliary}`,
            word.pastParticiple && `Past participle: ${word.pastParticiple}`,
            ...Object.entries(word.conjugations?.present ?? {}).map(
              ([person, form]) => `${person}: ${form}`,
            ),
          ]
        : word?.wordType === "adjective"
          ? [
              word.inflected && `Before a noun: ${word.inflected}`,
              word.comparative && `Comparative: ${word.comparative}`,
              word.superlative && `Superlative: ${word.superlative}`,
            ]
          : [];
  return (
    <Card style={{ gap: 16, maxWidth: 850 }}>
      <Badge>Phase 1 · Refresh</Badge>
      <SectionHeading title={`Refresh ${index + 1} of ${questions.length}`} />
      <Body muted>
        Read through today’s due material before testing. Refreshing saves no
        answers and does not change your review streak.
      </Body>
      {word && (
        <>
          <Body
            accessibilityRole="header"
            style={{ fontSize: 24, fontWeight: "600" }}
          >
            {vocabularyLabel(word)}
          </Body>
          <Body>{word.english}</Body>
          <ReviewTranslate text={vocabularyLabel(word)} />
          {details.filter(Boolean).map((detail, i) => (
            <Body key={i} muted>
              {detail}
            </Body>
          ))}
          {!!word.example.dutch && (
            <View style={{ gap: 5 }}>
              <Body>{word.example.dutch}</Body>
              <Body muted>{word.example.english}</Body>
            </View>
          )}
        </>
      )}
      {lesson && (
        <>
          <Body
            accessibilityRole="header"
            style={{ fontSize: 24, fontWeight: "600" }}
          >
            {lesson.title}
          </Body>
          <Body>{lesson.rules[0] || lesson.objective}</Body>
          {lesson.examples.slice(0, 2).map((example, i) => (
            <View key={i} style={{ gap: 5 }}>
              <Body>{example.dutch}</Body>
              <Body muted>{example.english}</Body>
              <ReviewTranslate text={example.dutch} />
            </View>
          ))}
        </>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {index > 0 && (
          <Action
            title="Previous material"
            variant="secondary"
            onPress={() => setIndex((value) => value - 1)}
          />
        )}
        {index + 1 < questions.length ? (
          <Action
            title="Next material"
            onPress={() => setIndex((value) => value + 1)}
            icon="arrow-right"
          />
        ) : (
          <Action title="Start test" onPress={start} icon="arrow-right" />
        )}
      </View>
      {Platform.OS === "web" && <Body muted>Press Enter to continue.</Body>}
    </Card>
  );
}
