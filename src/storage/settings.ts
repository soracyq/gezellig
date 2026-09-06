export const DAILY_TARGETS = [5, 10, 15, 20, 30, 40, 50] as const;

export type DailyTarget = (typeof DAILY_TARGETS)[number];

export const DEFAULT_DAILY_TARGET: DailyTarget = 10;
export const SETTINGS_STORAGE_KEY = "@dutchly/settings";

export type StoredSettings = {
  version: 1;
  dailyTarget: DailyTarget;
};

export type SettingsResult = {
  settings: StoredSettings;
  error: string | null;
};

// Accept a small storage interface so the rules can be tested without a device.
export type SettingsStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
};

function defaultSettings(): StoredSettings {
  return { version: 1, dailyTarget: DEFAULT_DAILY_TARGET };
}

function isDailyTarget(value: unknown): value is DailyTarget {
  return DAILY_TARGETS.some((target) => target === value);
}

export function parseSettings(raw: string | null): SettingsResult {
  if (raw === null) {
    return { settings: defaultSettings(), error: null };
  }

  try {
    const saved: unknown = JSON.parse(raw);

    if (
      typeof saved !== "object" ||
      saved === null ||
      Array.isArray(saved) ||
      !("version" in saved) ||
      saved.version !== 1 ||
      !("dailyTarget" in saved) ||
      !isDailyTarget(saved.dailyTarget)
    ) {
      throw new Error("Unsupported settings");
    }

    return {
      settings: { version: 1, dailyTarget: saved.dailyTarget },
      error: null,
    };
  } catch {
    return {
      settings: defaultSettings(),
      error:
        "Your saved settings could not be read. We are using 10 words per day for now. Choose a daily target to save a fresh preference.",
    };
  }
}

export async function loadSettings(
  storage: SettingsStorage,
): Promise<SettingsResult> {
  try {
    return parseSettings(await storage.getItem(SETTINGS_STORAGE_KEY));
  } catch {
    return {
      settings: defaultSettings(),
      error:
        "Your saved settings could not be loaded. We are using 10 words per day for now. Choose a daily target to try saving again.",
    };
  }
}

export async function saveSettings(
  storage: SettingsStorage,
  dailyTarget: DailyTarget,
): Promise<void> {
  if (!isDailyTarget(dailyTarget)) {
    throw new Error("Choose one of the available daily targets.");
  }

  const settings: StoredSettings = { version: 1, dailyTarget };
  await storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
