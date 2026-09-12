/* global __dirname */
// Only builds the exercise supplement. Never rewrites curriculum/import assets.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const focuses = new Map(
  fs
    .readFileSync(path.join(__dirname, "grammar-practice-focus.psv"), "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [id, ...values] = line.split("|");
      return [id, values];
    }),
);
// Explicit full-sentence alternatives. Never infer interchangeable word order at grading time.
const variants = {
  "a1-subject-pronouns": [["Ze woont hier."], ["Ze wonen hier."]],
  "a1-yes-no-questions": [["Werk jij vandaag?"], []],
  "a1-present-regular": [[], ["We wonen naast het station."]],
  "a1-present-common-irregulars": [[], ["We gaan naar huis."]],
  "a1-object-pronouns": [["Mijn buurman helpt mij."], []],
  "a1-modals-obligation-wishes": [
    ["Wij moeten vandaag werken."],
    ["Ze wil Nederlands leren."],
  ],
  "a2-reflexive-verbs": [["Ik voel mij vandaag goed."], []],
  "a2-perfect-subclauses": [
    ["Ik ben moe omdat ik hard gewerkt heb."],
    [
      "Ik weet dat zij de rekening heeft betaald.",
      "Ik weet dat ze de rekening betaald heeft.",
      "Ik weet dat ze de rekening heeft betaald.",
    ],
  ],
};
const catalog = {};
for (const level of ["A1", "A2"]) {
  const lessons = JSON.parse(
    fs.readFileSync(
      path.join(root, `public/import-data/grammar/${level}.json`),
      "utf8",
    ),
  );
  for (const lesson of lessons) {
    const id = lesson.lesson_id;
    assert(focuses.has(id), `Missing focus for ${id}`);
    const [first, wrong, other, second, hint, third] = focuses.get(id);
    const examples = [1, 2].map((i) => ({
      dutch: lesson[`example_dutch_${i}`],
      english: lesson[`example_english_${i}`],
    }));
    assert(examples[0].dutch.includes(first), `${id}: missing first focus`);
    assert(examples[1].dutch.includes(second), `${id}: missing second focus`);
    const make = (kind, prompt, correctAnswer, extra = {}) => ({
      kind,
      prompt,
      correctAnswer,
      acceptedAnswers: [],
      explanation: lesson.rule,
      hint: "",
      ...extra,
    });
    const choices = [first, wrong, other];
    // Stable rotation avoids always putting the correct option first.
    const offset = Object.keys(catalog).length % choices.length;
    const exercises = [
      make(
        "multiple-choice",
        `Choose the missing form:\n${examples[0].dutch.replace(first, "___")}\n${examples[0].english}`,
        first,
        { options: [...choices.slice(offset), ...choices.slice(0, offset)] },
      ),
      make(
        "fill-blank",
        `Complete the sentence:\n${examples[1].dutch.replace(second, "___")}\n${examples[1].english}`,
        second,
        {
          hint,
          acceptedAnswers:
            id === "a1-subject-pronouns"
              ? ["Ze"]
              : id === "a1-object-pronouns"
                ? ["je"]
                : [],
        },
      ),
    ];
    if (third === "ordering") {
      const chunks = examples[0].dutch.split(" ");
      exercises.push(
        make(
          "ordering",
          `Arrange the words: ${examples[0].english}`,
          examples[0].dutch,
          {
            chunks: [...chunks.slice(2), ...chunks.slice(0, 2)],
            hint: `Keep the lesson's wording. Begin with “${chunks[0]}”.`,
            acceptedAnswers: variants[id]?.[0] ?? [],
          },
        ),
      );
    } else {
      exercises.push(
        make(
          "correction",
          `Correct the marked form only:\n${examples[0].dutch.replace(first, `[${wrong}]`)}\n${examples[0].english}`,
          examples[0].dutch,
          {
            hint: "Write the complete corrected sentence. Keep the other words.",
            acceptedAnswers: variants[id]?.[0] ?? [],
          },
        ),
      );
    }
    examples.forEach((example, i) =>
      exercises.push(
        make("translation", example.english, example.dutch, {
          hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
          acceptedAnswers: variants[id]?.[i] ?? [],
        }),
      ),
    );
    catalog[id] = {
      source: {
        objective: lesson.learning_objective,
        rules: [lesson.rule],
        examples,
      },
      exercises: exercises.map((exercise, i) => ({
        ...exercise,
        id: `${id}:practice:${i + 1}`,
        sortOrder: i + 1,
      })),
    };
  }
}
assert.equal(Object.keys(catalog).length, 72);
fs.writeFileSync(
  path.join(root, "src/data/grammar-practice-catalog.ts"),
  '// Prepared from existing lesson content. Rebuild with scripts/build-grammar-practice.cjs.\nimport type { GrammarPracticeEntry } from "../domain/grammarPractice.ts";\nexport const grammarPracticeCatalog: Record<string, GrammarPracticeEntry> = ' +
    JSON.stringify(catalog, null, 2) +
    ";\n",
);
console.log(
  `Prepared ${Object.keys(catalog).length} lessons / 360 exercises; existing import files unchanged.`,
);
