import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";
import {
  vocabularyItems as builtinVocabulary,
  grammarTopics as builtinGrammar,
} from "../data/sample-content";
import type {
  ContentType,
  Question,
  TranslationQuestion,
} from "../domain/models";
import { submitDailyReview } from "../domain/review";
import { submitGrammarPractice } from "../domain/grammarAttempt";
import { loadSettings } from "../storage/settings";
import {
  appendEvent,
  emptyActivity,
  getStatistics,
  makeEvent,
  type ActivityJournal,
} from "../domain/activity";
import { commitPreview } from "../imports/commit";
import type { ImportPreview } from "../imports/validate";
import {
  ACTIVITY_KEY,
  CURRICULUM_KEY,
  emptyCurriculum,
  readActivity,
  readCurriculum,
  resetActivity,
  writeActivity,
  writeCurriculum,
  type Curriculum,
} from "../storage/library";
import { withStorageLock } from "../storage/lock";
import {
  crossedDailyGoal,
  type GoalCelebration as Celebration,
} from "../domain/dailyGoals";
import { claimGoalCelebration } from "../storage/goalCelebrations";
import { prepareGoalSound } from "../services/goalSound";
import { GoalCelebration } from "../components/GoalCelebration";
import { orderVocabularyForLearning } from "../domain/vocabularyOrder";

const builtins = { vocabulary: builtinVocabulary, grammar: builtinGrammar };
function useLearningState() {
  const [curriculum, setCurriculum] = useState<Curriculum>(emptyCurriculum);
  const [activity, setActivity] = useState<ActivityJournal>(emptyActivity);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const mounted = useRef(false);
  const lifetime = useRef(0);
  const pending = useRef(0);
  const refresh = useCallback(async () => {
    const generation = lifetime.current;
    // Reads and writes share one queue: a delayed hydration must never replace
    // a newer saved result, and a refresh must wait for pending local writes.
    const work = queue.current
      .catch(() => undefined)
      .then(async () => {
        const [content, history] = await Promise.allSettled([
          readCurriculum(AsyncStorage),
          readActivity(AsyncStorage),
        ]);
        if (!mounted.current || generation !== lifetime.current) return;
        if (content.status === "fulfilled") {
          setCurriculum(content.value);
          setCurriculumError(null);
        } else
          setCurriculumError(
            content.reason?.message ?? "Saved curriculum could not be loaded.",
          );
        if (history.status === "fulfilled") {
          setActivity(history.value);
          setActivityError(null);
        } else
          setActivityError(
            history.reason?.message ??
              "Saved learning history could not be loaded.",
          );
        setLoading(false);
        setNow(new Date());
      });
    queue.current = work;
    await work;
  }, []);
  useEffect(() => {
    mounted.current = true;
    const generation = lifetime.current;
    void refresh();
    const interval = setInterval(() => setNow(new Date()), 60000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === ACTIVITY_KEY ||
        event.key === CURRICULUM_KEY
      )
        void refresh();
    };
    if (Platform.OS === "web") window.addEventListener("storage", onStorage);
    return () => {
      mounted.current = false;
      lifetime.current = generation + 1;
      clearInterval(interval);
      subscription.remove();
      if (Platform.OS === "web")
        window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);
  function transact<T>(operation: () => Promise<T>): Promise<T> {
    if (loading)
      return Promise.reject(
        new Error("Please wait for your saved data to load."),
      );
    pending.current++;
    setBusy(true);
    setOperationError(null);
    const work = queue.current
      .catch(() => undefined)
      .then(() => withStorageLock(operation));
    queue.current = work;
    return work
      .catch((error) => {
        if (mounted.current)
          setOperationError(
            error instanceof Error
              ? error.message
              : "The change could not be saved. Please try again.",
          );
        throw error;
      })
      .finally(() => {
        pending.current--;
        if (mounted.current && pending.current === 0) setBusy(false);
      });
  }
  const vocabulary = useMemo(
    () =>
      orderVocabularyForLearning([
        ...builtinVocabulary,
        ...curriculum.vocabulary,
      ]),
    [curriculum.vocabulary],
  );
  const grammar = [...builtinGrammar, ...curriculum.grammar].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  async function completeItem(id: string, contentType: ContentType) {
    if (
      !(contentType === "vocabulary" ? vocabulary : grammar).some(
        (item) => item.id === id,
      )
    )
      throw new Error("This learning item is no longer available.");
    prepareGoalSound();
    await transact(async () => {
      const journal = await readActivity(AsyncStorage);
      const completedAt = new Date();
      const next = appendEvent(
        journal,
        makeEvent(
          contentType === "vocabulary" ? "word-studied" : "lesson-completed",
          id,
          contentType,
          {},
          completedAt,
        ),
      );
      await writeActivity(AsyncStorage, next);
      setActivity(next);
      setNow(new Date());
      try {
        const settings = await loadSettings(AsyncStorage);
        if (contentType === "vocabulary" && settings.error) return;
        const goal = crossedDailyGoal(
          journal,
          next,
          contentType,
          settings.settings.dailyTarget,
          completedAt,
        );
        if (
          goal &&
          (await claimGoalCelebration(AsyncStorage, goal)) &&
          mounted.current
        )
          setCelebrations((pending) => [...pending, goal]);
      } catch {
        // Progress is already safely saved. A notification-storage failure
        // must not misreport study completion as failed or replay on refresh.
      }
    });
  }
  async function answerQuestion(
    question: Question,
    answer: string,
    contentType: ContentType,
    attemptId: string,
  ) {
    if (!question.options.includes(answer))
      throw new Error("Choose one of the available answers.");
    await transact(async () => {
      const journal = await readActivity(AsyncStorage);
      const next = appendEvent(
        journal,
        makeEvent("answer", question.relatedItemId, contentType, {
          id: attemptId,
          questionId: question.id,
          correct: answer === question.correctAnswer,
        }),
      );
      await writeActivity(AsyncStorage, next);
      setActivity(next);
      setNow(new Date());
    });
  }
  async function importContent(preview: ImportPreview) {
    return transact(async () => {
      const latest = await readCurriculum(AsyncStorage);
      const result = commitPreview(
        latest,
        preview,
        builtins,
        `dataset-${randomUUID()}`,
      );
      await writeCurriculum(AsyncStorage, result.curriculum);
      setCurriculum(result.curriculum);
      return { imported: result.imported, skipped: result.skipped };
    });
  }
  async function answerGrammar(
    lessonId: string,
    questionId: string,
    answer: string,
    attemptId: string,
  ) {
    return transact(async () => {
      const [journal, latest] = await Promise.all([
        readActivity(AsyncStorage),
        readCurriculum(AsyncStorage),
      ]);
      const lesson = [...builtinGrammar, ...latest.grammar].find(
        (item) => item.id === lessonId,
      );
      if (!lesson) throw new Error("This lesson is no longer available.");
      const result = submitGrammarPractice(
        journal,
        lesson,
        questionId,
        answer,
        attemptId,
      );
      await writeActivity(AsyncStorage, result.journal);
      setActivity(result.journal);
      setNow(new Date());
      return result;
    });
  }
  async function resetProgress() {
    await transact(async () => {
      await resetActivity(AsyncStorage);
      setActivity(emptyActivity());
      setActivityError(null);
      setNow(new Date());
    });
  }
  async function answerReview(
    question: TranslationQuestion,
    answer: string,
    day: string,
  ) {
    return transact(async () => {
      const [journal, latest, settings] = await Promise.all([
        readActivity(AsyncStorage),
        readCurriculum(AsyncStorage),
        loadSettings(AsyncStorage),
      ]);
      if (settings.error)
        throw new Error(
          "Your daily target could not be loaded. Check Settings before saving a review.",
        );
      const result = submitDailyReview(
        [...builtinVocabulary, ...latest.vocabulary],
        [...builtinGrammar, ...latest.grammar],
        journal,
        settings.settings.dailyTarget,
        question,
        answer,
        day,
      );
      await writeActivity(AsyncStorage, result.journal);
      setActivity(result.journal);
      setNow(new Date());
      return result;
    });
  }
  const studiedIds = new Set(
    activity.events
      .filter((e) => e.kind === "word-studied")
      .map((e) => e.itemId),
  );
  const completedLessonIds = new Set(
    activity.events
      .filter((e) => e.kind === "lesson-completed")
      .map((e) => e.itemId),
  );
  return {
    curriculum,
    activity,
    vocabulary,
    grammar,
    statistics: getStatistics(activity, now),
    now,
    loading,
    busy,
    curriculumError,
    activityError,
    error: operationError,
    refresh,
    completeItem,
    answerQuestion,
    answerGrammar,
    answerReview,
    importContent,
    resetProgress,
    studiedIds,
    completedLessonIds,
    celebration: celebrations[0] ?? null,
    dismissCelebration: () => setCelebrations((pending) => pending.slice(1)),
  };
}
const LearningContext = createContext<ReturnType<
  typeof useLearningState
> | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const value = useLearningState();
  return (
    <LearningContext.Provider value={value}>
      {children}
      {value.celebration && (
        <GoalCelebration
          key={`${value.celebration.kind}:${value.celebration.day}`}
          goal={value.celebration}
          onClose={value.dismissCelebration}
        />
      )}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be inside LearningProvider");
  return value;
}
