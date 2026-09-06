import assert from "node:assert/strict";
import test from "node:test";

import {
  DAILY_TARGETS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  parseSettings,
  saveSettings,
  type DailyTarget,
  type SettingsStorage,
} from "../src/storage/settings.ts";

test("a new install starts with 10 words per day and no recovery message", () => {
  assert.deepEqual(parseSettings(null), {
    settings: { version: 1, dailyTarget: 10 },
    error: null,
  });
});

test("every offered daily target can be restored", () => {
  for (const dailyTarget of DAILY_TARGETS) {
    assert.deepEqual(
      parseSettings(JSON.stringify({ version: 1, dailyTarget })),
      {
        settings: { version: 1, dailyTarget },
        error: null,
      },
    );
  }
});

test("corrupt values and unsupported versions recover visibly to the default", () => {
  const invalidValues = [
    "",
    "{broken",
    "null",
    "[]",
    "true",
    "10",
    "{}",
    '{"version":2,"dailyTarget":20}',
    '{"version":"1","dailyTarget":20}',
    '{"version":1,"dailyTarget":"20"}',
    '{"version":1,"dailyTarget":0}',
    '{"version":1,"dailyTarget":12}',
    '{"version":1,"dailyTarget":null}',
  ];

  for (const raw of invalidValues) {
    const result = parseSettings(raw);
    assert.deepEqual(result.settings, { version: 1, dailyTarget: 10 }, raw);
    assert.match(result.error ?? "", /Choose a daily target/, raw);
  }
});

test("loading damaged storage does not overwrite the original data", async () => {
  const writes: string[] = [];
  const storage: SettingsStorage = {
    getItem: async (key) => {
      assert.equal(key, SETTINGS_STORAGE_KEY);
      return "damaged data";
    },
    setItem: async (_key, value) => {
      writes.push(value);
    },
  };

  const result = await loadSettings(storage);
  assert.equal(result.settings.dailyTarget, 10);
  assert.ok(result.error);
  assert.deepEqual(writes, []);

  // A deliberate user choice repairs the preference with a versioned record.
  await saveSettings(storage, 20);
  assert.deepEqual(writes, ['{"version":1,"dailyTarget":20}']);
});

test("a failed read reports a recoverable error without writing", async () => {
  let writeCount = 0;
  const result = await loadSettings({
    getItem: async () => {
      throw new Error("Storage unavailable");
    },
    setItem: async () => {
      writeCount += 1;
    },
  });

  assert.equal(result.settings.dailyTarget, 10);
  assert.match(result.error ?? "", /could not be loaded/);
  assert.equal(writeCount, 0);
});

test("a preference round-trips through its own storage key", async () => {
  const values = new Map<string, string>();
  const storage: SettingsStorage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };

  await saveSettings(storage, 50);
  assert.deepEqual(await loadSettings(storage), {
    settings: { version: 1, dailyTarget: 50 },
    error: null,
  });
  assert.deepEqual([...values.keys()], [SETTINGS_STORAGE_KEY]);
});

test("failed writes propagate so the provider can show a save error", async () => {
  await assert.rejects(
    saveSettings(
      {
        getItem: async () => null,
        setItem: async () => {
          throw new Error("Storage full");
        },
      },
      15,
    ),
    /Storage full/,
  );
});

test("invalid targets are rejected before storage is changed", async () => {
  let writeCount = 0;
  await assert.rejects(
    saveSettings(
      {
        getItem: async () => null,
        setItem: async () => {
          writeCount += 1;
        },
      },
      12 as DailyTarget,
    ),
    /available daily targets/,
  );
  assert.equal(writeCount, 0);
});
