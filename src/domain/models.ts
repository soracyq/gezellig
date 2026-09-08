/** Content contracts. CEFR labels describe placement; they are not certification. */
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type WordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "numeral"
  | "particle"
  | "expression"
  | "phrase";

export interface TranslatedExample {
  dutch: string;
  english: string;
}

interface VocabularyBase {
  id: string;
  dutch: string;
  english: string;
  level: CEFRLevel;
  wordType: WordType;
  topic: string;
  example: TranslatedExample;
  isSample: boolean;
  notes?: string;
  datasetId?: string;
  tags?: string[];
}

export type VerbTense =
  | "present"
  | "past"
  | "presentPerfect"
  | "pastPerfect"
  | "future"
  | "futurePerfect"
  | "conditional"
  | "conditionalPerfect";

export type GrammaticalPerson =
  | "ik"
  | "jij / je"
  | "u"
  | "hij / zij / het"
  | "wij / we"
  | "jullie"
  | "zij / ze";

export interface NounItem extends VocabularyBase {
  wordType: "noun";
  article?: "de" | "het";
  plural?: string;
  indefiniteArticle?: "een";
  diminutive?: string;
}

export interface VerbItem extends VocabularyBase {
  wordType: "verb";
  regular?: boolean;
  separable?: boolean;
  auxiliary?: "hebben" | "zijn" | "hebben / zijn";
  pastParticiple?: string;
  conjugations?: Partial<
    Record<VerbTense, Partial<Record<GrammaticalPerson, string>>>
  >;
}

export interface AdjectiveItem extends VocabularyBase {
  wordType: "adjective";
  inflected?: string;
  comparative?: string;
  superlative?: string;
}

export interface OtherVocabularyItem extends VocabularyBase {
  wordType: Exclude<WordType, "noun" | "verb" | "adjective">;
}

/** Type-specific properties appear only where they make sense. */
export type VocabularyItem =
  NounItem | VerbItem | AdjectiveItem | OtherVocabularyItem;

export interface Question {
  id: string;
  kind: "multiple-choice";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  relatedItemId: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: CEFRLevel;
  category: string;
  summary: string;
  objective: string;
  explanation: string;
  rules: string[];
  commonMistakes: string[];
  examples: TranslatedExample[];
  questions: Question[];
  estimatedMinutes: number;
  isSample: boolean;
  exceptions?: string[];
  usageNotes?: string[];
  prerequisiteIds?: string[];
  datasetId?: string;
  sourceLessonId?: string;
  sortOrder?: number;
}

// Future learner contracts. The shell does not implement these learning rules.
// Timestamps are ISO 8601 UTC strings; learning days use UserSettings.timeZone.
export interface User {
  id: string;
  displayName: string;
  createdAt: string;
}

export type DailyVocabularyTarget = 5 | 10 | 15 | 20 | 30 | 40 | 50;

export interface UserSettings {
  userId: string;
  dailyVocabularyTarget: DailyVocabularyTarget;
  interfaceLanguage: "en";
  timeZone: string;
}

export type ContentType = "vocabulary" | "grammar";

export interface Lesson {
  id: string;
  title: string;
  level: CEFRLevel;
  contentType: ContentType;
  contentItemIds: string[];
  estimatedMinutes: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  kind: ContentType | "review";
  lessonId?: string;
  itemIds: string[];
  currentItemIndex: number;
  startedAt: string;
  completedAt?: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  attemptedAt: string;
}

/** Due is derived from the schedule; reviewing is temporary session state. */
export type ReviewState = "new" | "learning" | "mastered";

/** Content remains shared; these counters belong to one learner and one item. */
export interface UserProgress {
  id: string;
  userId: string;
  learningItemId: string;
  contentType: ContentType;
  state: ReviewState;
  totalAttempts: number;
  totalMistakes: number;
  firstStudiedAt?: string;
  lastAttemptAt?: string;
}

export interface ReviewItem {
  id: string;
  userProgressId: string;
  scheduledFor: string;
  consecutiveCorrectReviews: number;
  skipCount: number;
  lastReviewedAt?: string;
  lastSkippedAt?: string;
}

export interface ImportedDataset {
  id: string;
  name: string;
  importedAt: string;
  itemCount: number;
  levels: CEFRLevel[];
  format: "csv" | "xlsx" | "json";
  contentType: ContentType;
  skippedCount: number;
  status: "active" | "archived";
}
