import AsyncStorage from "@react-native-async-storage/async-storage";
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
  loadSettings,
  saveSettings,
  type DailyTarget,
} from "../storage/settings";

type SettingsContextValue = {
  dailyTarget: DailyTarget;
  setDailyTarget: (target: DailyTarget) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  clearError: () => void;
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

  useEffect(() => {
    let cancelled = false;
    isMounted.current = true;

    void loadSettings(AsyncStorage).then((result) => {
      if (cancelled) return;

      updateDailyTarget(result.settings.dailyTarget);
      setError(result.error);
      hasLoaded.current = true;
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, []);

  const setDailyTarget = useCallback((target: DailyTarget): Promise<void> => {
    if (!hasLoaded.current || !isMounted.current) {
      // The settings screen also disables its controls while loading.
      // This guard prevents a delayed read from replacing a new choice.
      return Promise.resolve();
    }

    pendingSaves.current += 1;
    setIsSaving(true);

    const save = saveQueue.current.then(async () => {
      if (isMounted.current) setError(null);

      try {
        await saveSettings(AsyncStorage, target);
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
