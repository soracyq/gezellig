export type ImportKind = "vocabulary" | "grammar";
export type Field = { name: string; required?: boolean; description: string };
export const vocabularyFields: Field[] = [
  {
    name: "dutch",
    required: true,
    description: "Dutch term. For nouns, put de/het in article.",
  },
  { name: "english", required: true, description: "English meaning." },
  { name: "cefr_level", required: true, description: "A1, A2, B1, B2 or C1." },
  {
    name: "word_type",
    required: true,
    description:
      "noun, verb, adjective, adverb, pronoun, preposition, conjunction, numeral, particle, expression or phrase.",
  },
  { name: "topic", description: "Topic name, for example Home." },
  {
    name: "example_dutch",
    description: "Optional Dutch sentence; include its English translation.",
  },
  {
    name: "example_english",
    description: "English translation of the example.",
  },
  { name: "notes", description: "Optional usage notes." },
  { name: "tags", description: "Optional tags separated by semicolons." },
  { name: "article", description: "Nouns only: de or het." },
  { name: "plural", description: "Nouns only: plural form." },
  { name: "diminutive", description: "Nouns only: diminutive form." },
  { name: "regularity", description: "Verbs only: regular or irregular." },
  { name: "separable", description: "Verbs only: true or false." },
  {
    name: "auxiliary",
    description: "Verbs only: hebben, zijn or hebben / zijn.",
  },
  { name: "past_participle", description: "Verbs only: past participle." },
  { name: "inflected", description: "Adjectives only: inflected form." },
  { name: "comparative", description: "Adjectives only: comparative form." },
  { name: "superlative", description: "Adjectives only: superlative form." },
  {
    name: "is_sample",
    description: "Optional true/false. Use true for demonstration content.",
  },
];
export const grammarFields: Field[] = [
  {
    name: "lesson_id",
    description: "Optional stable identifier; any readable unique text.",
  },
  { name: "cefr_level", required: true, description: "A1, A2, B1, B2 or C1." },
  { name: "title", required: true, description: "Lesson title in English." },
  {
    name: "category",
    description: "For example Articles, Pronouns or Word order.",
  },
  {
    name: "learning_objective",
    description: "What the learner will be able to do.",
  },
  {
    name: "summary",
    description: "Short English description for the lesson card.",
  },
  {
    name: "explanation",
    required: true,
    description: "Main explanation in English.",
  },
  {
    name: "rule",
    description: "Optional rule. Use separate lines for multiple rules.",
  },
  {
    name: "example_dutch_1",
    description: "First Dutch example; pair with an English translation.",
  },
  { name: "example_english_1", description: "Translation of first example." },
  { name: "example_dutch_2", description: "Optional second Dutch example." },
  { name: "example_english_2", description: "Translation of second example." },
  {
    name: "common_mistake",
    description:
      "Optional common mistake; separate multiple notes with new lines.",
  },
  { name: "notes", description: "Optional English usage notes." },
  { name: "sort_order", description: "Optional nonnegative whole number." },
  {
    name: "estimated_minutes",
    description: "Optional reading time from 1 to 120 minutes; default 5.",
  },
  {
    name: "is_sample",
    description: "Optional true/false; true marks demo content.",
  },
];
export const fieldsFor = (kind: ImportKind) =>
  kind === "vocabulary" ? vocabularyFields : grammarFields;
export const exampleRows: Record<ImportKind, Record<string, string>[]> = {
  vocabulary: [
    {
      dutch: "tafel",
      english: "table",
      cefr_level: "A1",
      word_type: "noun",
      topic: "At home",
      article: "de",
      plural: "tafels",
      example_dutch: "Het boek ligt op de tafel.",
      example_english: "The book is on the table.",
      is_sample: "true",
    },
    {
      dutch: "leren",
      english: "to learn",
      cefr_level: "A1",
      word_type: "verb",
      topic: "Learning",
      regularity: "regular",
      separable: "false",
      auxiliary: "hebben",
      past_participle: "geleerd",
      example_dutch: "Ik leer Nederlands.",
      example_english: "I am learning Dutch.",
      is_sample: "true",
    },
    {
      dutch: "nieuw",
      english: "new",
      cefr_level: "A1",
      word_type: "adjective",
      topic: "Everyday life",
      inflected: "nieuwe",
      comparative: "nieuwer",
      superlative: "nieuwst",
      example_dutch: "Dit is een nieuw boek.",
      example_english: "This is a new book.",
      is_sample: "true",
    },
    {
      dutch: "alstublieft",
      english: "please / here you are (polite)",
      cefr_level: "A1",
      word_type: "expression",
      topic: "Being polite",
      example_dutch: "Een koffie, alstublieft.",
      example_english: "A coffee, please.",
      is_sample: "true",
    },
  ],
  grammar: [
    {
      lesson_id: "example-niet",
      cefr_level: "A1",
      title: "A first look at niet",
      category: "Negation",
      learning_objective: "Recognize niet in a simple negative sentence.",
      summary: "Say that you are not doing something.",
      explanation:
        "Niet means “not”. In the short sentence Ik werk niet, niet follows the verb. Its position can change in longer sentences.",
      rule: "Use niet to negate the action in Ik werk niet.",
      example_dutch_1: "Ik werk niet.",
      example_english_1: "I am not working.",
      example_dutch_2: "Ik begrijp het niet.",
      example_english_2: "I do not understand it.",
      common_mistake:
        "The position of niet depends on the sentence; do not always place it immediately after the verb.",
      estimated_minutes: "3",
      sort_order: "1",
      is_sample: "true",
    },
    {
      lesson_id: "example-ik",
      cefr_level: "A1",
      title: "Introducing yourself with ik",
      category: "Pronouns",
      learning_objective: "Recognize ik as the Dutch word for I.",
      summary: "Use ik to talk about yourself.",
      explanation:
        "Ik means “I”. It refers to the speaker. Like most Dutch words, ik is only capitalized at the beginning of a sentence.",
      rule: "Use ik when you are the person doing the action.",
      example_dutch_1: "Ik ben Sam.",
      example_english_1: "I am Sam.",
      example_dutch_2: "Vandaag werk ik.",
      example_english_2: "Today I am working.",
      estimated_minutes: "3",
      sort_order: "2",
      is_sample: "true",
    },
  ],
};
