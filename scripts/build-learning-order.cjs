/* global __dirname */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const Papa = require("papaparse");
const root = path.resolve(__dirname, "..");
const drafts = path.join(root, "content-drafts/b1-b2");
const config = JSON.parse(
  fs.readFileSync(path.join(drafts, "learning-priority.json"), "utf8"),
);
const split = (value) => value.split("|");
const boosts = Object.entries(config.boost).map(([theme, words]) => [
  theme,
  new Set(split(words)),
]);
const later = new Set(split(config.later));
const digest = (bytes) =>
  crypto.createHash("sha256").update(bytes).digest("hex");
const rows = ["B1", "B2"].flatMap((level) => {
  const file = `dutch_vocabulary_${level}_${level === "B1" ? 1500 : 2000}.csv`;
  return Papa.parse(
    fs.readFileSync(path.join(root, "public/import-data", file), "utf8"),
    { header: true, skipEmptyLines: true },
  ).data;
});
const frequencyPath = path.join(drafts, "learning-frequency.json");
if (process.argv.includes("--refresh-frequency")) {
  const source = fs.readFileSync(
    path.join(root, ".artifact-build/b1b2/frequency.json"),
  );
  const bins = JSON.parse(source.toString("utf8"));
  assert.deepEqual(bins[0], { format: "cB", version: 1 });
  const frequencies = new Map(
    bins
      .slice(1)
      .flatMap((bucket, index) =>
        bucket.map((word) => [word, Number((9 - index / 100).toFixed(2))]),
      ),
  );
  fs.writeFileSync(
    frequencyPath,
    JSON.stringify(
      {
        source:
          "wordfreq Dutch frequency bins, Robyn Speer; CC BY-SA 4.0. See docs/B1_B2_LEARNING_ORDER.md for sources and attribution.",
        sourceSha256: digest(source),
        zipf: Object.fromEntries(
          rows.flatMap((row) =>
            [row.dutch, row.plural, row.inflected, row.past_participle]
              .filter(Boolean)
              .map((form) => [form, frequencies.get(form) ?? null]),
          ),
        ),
      },
      null,
      2,
    ) + "\n",
  );
}
const { zipf } = JSON.parse(fs.readFileSync(frequencyPath, "utf8"));
const sourceHashes = Object.fromEntries(
  fs
    .readdirSync(path.join(root, "public/import-data"))
    .filter((file) => /^dutch_(vocabulary|grammar)_.*\.(csv|xlsx)$/.test(file))
    .map((file) => [
      file,
      digest(fs.readFileSync(path.join(root, "public/import-data", file))),
    ]),
);
// Git normalizes most CSV record separators on checkout. Retain raw local
// hashes for the audit and canonical text hashes for portable regression tests.
const sourceTextHashes = Object.fromEntries(
  Object.keys(sourceHashes)
    .filter((file) => file.endsWith(".csv"))
    .map((file) => [
      file,
      digest(
        fs
          .readFileSync(path.join(root, "public/import-data", file), "utf8")
          .replace(/\r\n/g, "\n"),
      ),
    ]),
);

function evaluate(row, originalIndex) {
  const themes = boosts
    .filter(([, words]) => words.has(row.dutch))
    .map(([theme]) => theme);
  let theme = themes[0];
  if (!theme) {
    if (
      /Linking|Relationships and connections|Reference and quantity/.test(
        row.topic,
      )
    )
      theme = "description-linking";
    else if (/Argumentation|Everyday communication/.test(row.topic))
      theme = "communication";
    else if (/Work|Education|education/.test(row.topic)) theme = "work-study";
    else if (/Travel|housing/.test(row.topic)) theme = "home-services";
    else if (/Health|health|feelings/.test(row.topic)) theme = "health-social";
    else if (/Society|Nature|environment/.test(row.topic))
      theme = "society-news";
    else if (row.word_type === "verb") theme = "actions";
    else if (row.word_type === "adjective") theme = "description-linking";
    else theme = "culture-objects";
  }
  // Missing multiword frequencies are NOT the sum/minimum of token frequencies.
  // Their useful conversational function receives an explicit editorial baseline.
  const headwordFrequency = zipf[row.dutch];
  assert.notEqual(headwordFrequency, undefined, row.dutch);
  const forms = [row.plural, row.inflected, row.past_participle].filter(
    Boolean,
  );
  const formFrequency = Math.max(
    0,
    ...forms.map((form) => (zipf[form] ?? 0) - 0.25),
  );
  const frequency = Math.max(headwordFrequency ?? 0, formFrequency) || null;
  const isExpression = /expression|phrase/.test(row.word_type);
  let usefulness = themes.length
    ? 1.05 + Math.min(0.3, (themes.length - 1) * 0.15)
    : 0;
  if (
    ["verb", "adjective", "adverb", "preposition", "conjunction"].includes(
      row.word_type,
    )
  )
    usefulness += 0.2;
  if (isExpression) usefulness += 0.7;
  if (
    row.cefr_level === "B2" &&
    themes.some((t) =>
      ["communication", "work-study", "society-news"].includes(t),
    )
  )
    usefulness += 0.3;
  if (later.has(row.dutch)) usefulness -= 2.6;
  const observedOrBaseline = frequency ?? (isExpression ? 4.5 : 2.7);
  // Frequent tasks can be expressed with low-frequency Dutch compounds. Give
  // explicitly reviewed practical words an editorial floor, not a fake corpus count.
  const frequencyContribution = themes.length
    ? Math.max(observedOrBaseline, 4.2)
    : observedOrBaseline;
  const score = frequencyContribution * 1.4 + usefulness;
  return {
    dutch: row.dutch,
    level: row.cefr_level,
    word_type: row.word_type,
    theme,
    frequency: frequency === null ? null : Number(frequency.toFixed(2)),
    headwordFrequency,
    usefulness: Number(usefulness.toFixed(2)),
    score: Number(score.toFixed(3)),
    originalIndex,
  };
}

const levels = {};
for (const level of ["B1", "B2"]) {
  const evaluated = rows.filter((r) => r.cefr_level === level).map(evaluate);
  const index = new Map(evaluated.map((row) => [row.dutch, row]));
  const opening = split(config.first[level]);
  assert.equal(opening.length, 50);
  assert.equal(new Set(opening).size, opening.length);
  for (const word of opening)
    assert(index.has(word), `${level}: unknown opening word ${word}`);
  const ordered = opening.map((word) => index.get(word));
  const remaining = evaluated.filter((row) => !opening.includes(row.dutch));
  while (remaining.length) {
    remaining.sort(
      (a, b) => b.score - a.score || a.originalIndex - b.originalIndex,
    );
    const best = remaining[0].score;
    let choice = 0,
      bestAdjusted = -Infinity;
    // Mix equally useful items instead of sweeping a whole topic or part of speech.
    // Stay within 0.75 score of the strongest remaining candidate.
    for (
      let i = 0;
      i < remaining.length && remaining[i].score >= best - 0.75;
      i++
    ) {
      const row = remaining[i];
      const recent = ordered.slice(-6);
      const penalty =
        recent.filter((r) => r.theme === row.theme).length * 0.17 +
        recent.slice(-3).filter((r) => r.word_type === row.word_type).length *
          0.13;
      const adjusted = row.score - penalty;
      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted;
        choice = i;
      }
    }
    ordered.push(remaining.splice(choice, 1)[0]);
  }
  // Deliberate same-level families, not unreliable spelling-prefix grouping.
  // Keep a short gap for variety. Opening sequence stays fixed; levels never move.
  for (const family of config.families) {
    const positions = family.map((w) =>
      ordered.findIndex((row) => row.dutch === w),
    );
    if (positions.some((p) => p < 0)) continue;
    const first = Math.min(...positions),
      last = Math.max(...positions);
    if (last - first > 60 && last >= 50) {
      const [mate] = ordered.splice(last, 1);
      ordered.splice(Math.max(50, first + 25), 0, mate);
    }
  }
  levels[level] = ordered.map((row, index) => ({
    ...row,
    learning_rank: index + 1,
  }));
}
const ranks = Object.values(levels).flat();
const code = `// Generated by scripts/build-learning-order.cjs; do not sort alphabetically.\n// Data: CC BY-SA 4.0; see docs/B1_B2_LEARNING_ORDER.md for attribution.\n// A read-only sidecar preserves every imported record and its existing ID.\nexport const vocabularyLearningRanks: Readonly<Record<string, number>> = {\n${ranks.map((r) => `  ${JSON.stringify(`${r.level}|${r.dutch}|${r.word_type}`)}: ${r.learning_rank},`).join("\n")}\n};\n`;
fs.writeFileSync(
  path.join(root, "src/data/vocabulary-learning-ranks.ts"),
  code,
);
fs.writeFileSync(
  path.join(drafts, "learning-order-audit.json"),
  JSON.stringify({ sourceHashes, sourceTextHashes, levels }, null, 2) + "\n",
);
for (const [level, ordered] of Object.entries(levels)) {
  console.log(`${level}: ${ordered.length} unique ranks`);
  for (const [label, start] of [
    ["first 50", 0],
    ["middle 50", Math.floor(ordered.length / 2) - 25],
    ["last 50", ordered.length - 50],
  ])
    console.log(
      `${label}: ${ordered
        .slice(start, start + 50)
        .map((r) => r.dutch)
        .join(" | ")}`,
    );
}
