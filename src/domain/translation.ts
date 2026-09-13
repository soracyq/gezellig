import type {
  GrammarTopic,
  GrammaticalPerson,
  TranslationQuestion,
  VocabularyItem,
} from "./models.ts";
import { grammarExercises } from "./grammarPractice.ts";

/** Keep accents, apostrophes, word order and internal punctuation meaningful. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("nl-NL")
    .replace(/[.!?]+(?=\s|$)/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}
export function matchesAnswer(
  question: Pick<TranslationQuestion, "correctAnswer" | "acceptedAnswers">,
  answer: string,
): boolean {
  const normalized = normalizeAnswer(answer);
  return (
    !!normalized &&
    [question.correctAnswer, ...question.acceptedAnswers].some(
      (value) => normalizeAnswer(value) === normalized,
    )
  );
}

const people: {
  key: GrammaticalPerson;
  pronouns: string[];
  english: string;
  hint: string;
}[] = [
  { key: "ik", pronouns: ["ik"], english: "I", hint: "Use ik." },
  {
    key: "jij / je",
    pronouns: ["jij", "je"],
    english: "you",
    hint: "Use jij or je (singular, informal).",
  },
  { key: "u", pronouns: ["u"], english: "you", hint: "Use u (formal)." },
  {
    key: "hij / zij / het",
    pronouns: ["hij"],
    english: "he",
    hint: "Use hij.",
  },
  {
    key: "wij / we",
    pronouns: ["wij", "we"],
    english: "we",
    hint: "Use wij or we.",
  },
  {
    key: "jullie",
    pronouns: ["jullie"],
    english: "you",
    hint: "Use jullie (plural).",
  },
  {
    key: "zij / ze",
    pronouns: ["zij", "ze"],
    english: "they",
    hint: "Use zij or ze (plural).",
  },
];
// English forms are a small checked set for the existing conjugated samples.
// Unknown English meanings never go through a speculative conjugator.
const englishPresent: Record<string, { meaning: string; forms: string[] }> = {
  zijn: {
    meaning: "to be",
    forms: ["am", "are", "are", "is", "are", "are", "are"],
  },
  wonen: {
    meaning: "to live / reside",
    forms: ["live", "live", "live", "lives", "live", "live", "live"],
  },
  werken: {
    meaning: "to work",
    forms: ["work", "work", "work", "works", "work", "work", "work"],
  },
};
export function vocabularyTranslations(
  word: VocabularyItem,
): TranslationQuestion[] {
  const base = {
    kind: "translation" as const,
    relatedItemId: word.id,
    contentType: "vocabulary" as const,
    label: word.dutch,
    acceptedAnswers: [] as string[],
  };
  const head = word.dutch.trim().replace(/^(de|het)\s+/i, "");
  if (word.wordType === "noun") {
    const result: TranslationQuestion[] = [];
    result.push({
      ...base,
      id: `translation:${word.id}:singular`,
      prompt: word.english,
      correctAnswer: word.article
        ? `${word.article} ${head}`
        : word.dutch.trim(),
      hint: word.article
        ? "Include the definite article (de or het)."
        : "Use the Dutch form from your vocabulary lesson.",
    });
    // The source has Dutch plurals, but no English-plural column. Label the task safely.
    if (word.plural?.trim() && !/[;/()]/.test(word.plural))
      result.push({
        ...base,
        id: `translation:${word.id}:plural`,
        prompt: `Plural of “${word.english}”`,
        correctAnswer: `de ${word.plural.trim().replace(/^(de|het)\s+/i, "")}`,
        hint: "Write the Dutch plural with de.",
      });
    return result;
  }
  if (word.wordType === "verb") {
    const english = englishPresent[word.dutch];
    const conjugated =
      english?.meaning === word.english
        ? people.flatMap((person, i): TranslationQuestion[] => {
            const form = word.conjugations?.present?.[person.key]?.trim();
            // Slash-separated forms are ambiguous combinations; keep the canonical fallback.
            if (!form || /[;/()]/.test(form)) return [];
            const answers = person.pronouns.map((p) => `${p} ${form}`);
            return [
              {
                ...base,
                id: `translation:${word.id}:present:${i}`,
                prompt: `${person.english} ${english.forms[i]}`,
                correctAnswer: answers[0],
                acceptedAnswers: answers.slice(1),
                hint: person.hint,
              },
            ];
          })
        : [];
    if (conjugated.length) return conjugated;
  }
  return [
    {
      ...base,
      id: `translation:${word.id}:meaning`,
      prompt: word.english,
      correctAnswer: word.dutch,
      hint:
        word.wordType === "verb"
          ? "Write the Dutch infinitive."
          : "Use the Dutch form from your vocabulary lesson.",
    },
  ];
}
export function grammarTranslations(
  lesson: GrammarTopic,
): TranslationQuestion[] {
  const prepared = grammarExercises(lesson).filter(
    (exercise) => exercise.kind === "translation",
  );
  // Each authored pair stays intact. Unrelated examples are never spliced into a dialogue.
  return lesson.examples.flatMap((example, i) =>
    example.dutch.trim() && example.english.trim()
      ? [
          {
            id: `translation:${lesson.id}:example:${i}`,
            kind: "translation" as const,
            relatedItemId: lesson.id,
            contentType: "grammar" as const,
            prompt: example.english,
            correctAnswer: example.dutch,
            acceptedAnswers: [
              ...new Set([
                ...(example.acceptedAnswers ?? []),
                ...(prepared.find(
                  (exercise) => exercise.correctAnswer === example.dutch,
                )?.acceptedAnswers ?? []),
              ]),
            ],
            hint: "Use the wording from the lesson example.",
            label: `${lesson.title} · ${lesson.category}`,
            rule: lesson.rules[0],
          },
        ]
      : [],
  );
}
