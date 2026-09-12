import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_DAILY_TARGET,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  saveSettings,
  type DailyTarget,
} from "../storage/settings";
import { withStorageLock } from "../storage/lock";

type SettingsContextValue = {
  dailyTarget: DailyTarget;
  setDailyTarget: (target: DailyTarget) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [dailyTarget, updateDailyTarget] =
    useState<DailyTarget>(DEFAULT_DAILY_TARGET);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const isMounted = useRef(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingSaves = useRef(0);
  const readSequence = useRef(0);

  const refresh = useCallback(async () => {
    const sequence = ++readSequence.current;
    // A refresh must not replace an in-flight local choice with an older value.
    await saveQueue.current;
    const result = await loadSettings(AsyncStorage);
    if (!isMounted.current || sequence !== readSequence.current) return;
    updateDailyTarget(result.settings.dailyTarget);
    setError(result.error);
    hasLoaded.current = true;
    setIsLoading(false);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    // Hydration and subsequent external changes both apply awaited storage reads.
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY || event.key === null)
        void refresh();
    };
    if (Platform.OS === "web") window.addEventListener("storage", onStorage);
    return () => {
      isMounted.current = false;
      // Invalidate outstanding reads; this ref is a counter, not a DOM node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      readSequence.current++;
      subscription.remove();
      if (Platform.OS === "web")
        window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const setDailyTarget = useCallback((target: DailyTarget): Promise<void> => {
    if (!hasLoaded.current || !isMounted.current) {
      // The settings screen also disables its controls while loading.
      // This guard prevents a delayed read from replacing a new choice.
      return Promise.resolve();
    }

    pendingSaves.current += 1;
    readSequence.current++;
    setIsSaving(true);

    const save = saveQueue.current.then(async () => {
      if (isMounted.current) setError(null);

      try {
        await withStorageLock(() => saveSettings(AsyncStorage, target));
        if (isMounted.current) updateDailyTarget(target);
      } catch {
        if (isMounted.current) {
          setError(
            "Your daily target could not be saved. Please choose it again to retry.",
          );
        }
      } finally {
        pendingSaves.current -= 1;
        if (isMounted.current && pendingSaves.current === 0) setIsSaving(false);
      }
    });

    // Keep writes in the order the user chose them, even on slower devices.
    saveQueue.current = save;
    return save;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <SettingsContext.Provider
      value={{
        dailyTarget,
        setDailyTarget,
        isLoading,
        isSaving,
        error,
        clearError,
        refresh,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const settings = useContext(SettingsContext);

  if (!settings) {
    throw new Error("useSettings must be used inside SettingsProvider.");
  }

  return settings;
}
