import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { fieldsFor } from "../src/imports/schema.ts";
import { validateTable, normalizeKey } from "../src/imports/validate.ts";

export const root = path.resolve(import.meta.dirname, "..");
export const output = path.join(root, "public/import-data");
export const headers = fieldsFor("vocabulary").map((f) => f.name);
const notes = {
  een: "Indefinite article. The same spelling also means one; the numeral is often accented één for emphasis. Articles use the app's particle category.",
  de: "Definite article for de-words and all plural nouns. Articles use the app's particle category.",
  het: "Personal pronoun it. Also the definite article for singular het-words; not counted as a second headword.",
  geen: "Negative determiner before an indefinite noun: geen auto, geen water. Stored in the app's particle category.",
  zij: "Subject pronoun: she (singular) or they (plural). Unstressed form: ze.",
  jij: "Stressed informal singular subject pronoun. Unstressed form: je.",
  wij: "Stressed subject pronoun. Unstressed form: we.",
  ons: "Use ons before a singular het-word, onze before a de-word or plural. Also the object pronoun us.",
  hun: "Possessive their. As an object pronoun, usage differs from hen; not a standard subject pronoun.",
  zichzelf:
    "Reflexive form for third person; other persons use forms such as mezelf and jezelf.",
  hetzelfde:
    "Use hetzelfde with het-words or independently; dezelfde with de-words and plurals. One headword only.",
  sommige:
    "Indefinite determiner before plural nouns. When referring independently to people: sommigen.",
  ander: "Base form; attributive inflection: andere.",
  elk: "Use elk before a singular het-word and elke before a de-word.",
  ieder: "Use ieder before a singular het-word and iedere before a de-word.",
  zulk: "Base form. Common plural use: zulke boeken. Zo'n is common before singular count nouns.",
  morgen:
    "Adverb tomorrow. The noun morgen can mean morning; that sense is covered by ochtend.",
  weer: "Noun weather. The adverb weer means again; see opnieuw. Counted only once.",
  gezondheid:
    "Conventional response to a sneeze. Also the noun de gezondheid (health); not counted separately.",
  vriendin:
    "May mean a female friend or a girlfriend; context distinguishes the relationship.",
  vriend:
    "May mean a male friend or a boyfriend; context distinguishes the relationship.",
  neef: "Nephew or male cousin; the example uses nephew.",
  nicht: "Niece or female cousin; the example uses niece.",
  bank: "The example uses sofa; the same headword can also mean a financial bank.",
  eten: "Verb infinitive to eat; also the noun het eten (food). The nominal sense is not a separate entry.",
  houden:
    "In the meaning like/love, use houden van. The verb has other meanings, including hold and keep.",
  vragen:
    "Mixed pattern: vroeg, gevraagd. Marked irregular because the simple past is irregular.",
  bakken:
    "Mixed pattern: bakte, gebakken. Marked irregular because of the participle.",
  lachen:
    "Mixed pattern: lachte, gelachen. Marked irregular because of the participle.",
  heten:
    "Mixed pattern: heette, geheten. Marked irregular because of the participle.",
  vouwen:
    "Mixed pattern: vouwde, gevouwen. Marked irregular because of the participle.",
  scheiden:
    "Mixed pattern: scheidde, gescheiden. Divorce uses zijn; separating objects uses hebben.",
  stoppen:
    "Stopping an activity or movement normally uses zijn; putting something into a bag uses hebben.",
  verbeteren:
    "Correcting or improving something uses hebben; becoming better can use zijn.",
  vergeten:
    "Both hebben and zijn occur. Forgetting to bring or do something commonly uses zijn.",
  overleggen:
    "Discuss/consult: inseparable, overlegde, overlegd. Do not confuse with the separable document-submission meaning.",
  overnachten: "Inseparable: overnachtte, overnacht (no ge- prefix).",
  ontspannen:
    "Often reflexive: zich ontspannen. Mixed pattern: ontspande, ontspannen.",
  bewegen: "Strong forms: bewoog, bewogen. Motion as an activity uses hebben.",
  blad: "Plural bladeren for leaves. Bladen is used for sheets, magazines and some other senses.",
  kop: "Cup in this example. Also head (especially of an animal), depending on context.",
  broodje:
    "A bread roll or filled roll is a conventional food meaning, beyond merely a small loaf.",
  kaartje:
    "Ticket is an independent conventional meaning; not counted just as an inflection of kaart.",
  zon: "Usually singular when referring to our sun; zonnen is possible for multiple stars/suns.",
  retour:
    "A return ticket in travel contexts. Also used adverbially for a return journey.",
  tablet:
    "A medicine tablet here. A tablet computer is het tablet and is not a second entry.",
  net: "Noun net. The adverb net (just) is not a separate entry.",
  meer: "Noun lake. The quantifier meer (more) is not a separate entry.",
  hals: "Usually the front or whole neck; nek commonly refers to the back of the neck.",
  nek: "Back of the neck; see hals for the front or whole neck.",
  "ten slotte":
    "Finally as the last step. Written as two words; tenslotte means after all.",
  privé:
    "Written separately as an adjective or joined in compounds, for example privénummer.",
  half: "Half as a quantity; half negen means half past eight, not half past nine.",
  "zin hebben in":
    "Fixed expression: zin hebben in + noun or zin hebben om te + infinitive.",
  "het eens zijn met":
    "Fixed expression for agreement, not a separately counted conjugated form of zijn.",
  "rekening houden met":
    "Fixed expression for taking something into account, not the literal bill/account sense.",
  "de weg kwijt": "Usually used with zijn: ik ben de weg kwijt.",
  "aan de hand":
    "Commonly in wat is er aan de hand? Meaning what is the matter?",
  bedankt:
    "Lexicalised politeness expression thanks; distinct from the verb bedanken.",
  "graag gedaan":
    "Fixed response to thanks, not counted as an inflected form of doen.",
};

export async function loadVocabulary() {
  const all = [];
  for (const level of ["A1", "A2"]) {
    let type, topic;
    const content = await fs.readFile(
      path.join(output, "source", `${level}.psv`),
      "utf8",
    );
    for (const line of content.split(/\r?\n/)) {
      if (!line) continue;
      if (line.startsWith("@")) {
        [type, topic] = line.slice(1).split("|");
        continue;
      }
      const values = line
        .split("|")
        .map((v) => v.normalize("NFC").trim().replace(/\s+/gu, " "));
      const [dutch, english, example_dutch, example_english, ...meta] = values;
      const requiredLength = { noun: 6, verb: 8, adjective: 7 }[type] ?? 4;
      assert.equal(
        values.length,
        requiredLength,
        `${level} ${dutch}: source field count`,
      );
      const row = Object.fromEntries(headers.map((h) => [h, ""]));
      Object.assign(row, {
        dutch,
        english,
        cefr_level: level,
        word_type: type,
        topic,
        example_dutch,
        example_english,
        is_sample: "false",
      });
      if (type === "noun") {
        [row.article, row.plural] = meta;
        if (!row.plural)
          row.notes = "Normally used without a plural in this meaning.";
      }
      if (type === "verb") {
        row.regularity = { r: "regular", i: "irregular" }[meta[0]];
        row.separable = { 0: "false", 1: "true" }[meta[1]];
        row.auxiliary = { h: "hebben", z: "zijn", b: "hebben / zijn" }[meta[2]];
        row.past_participle = meta[3];
        assert(
          row.regularity &&
            row.separable &&
            row.auxiliary &&
            row.past_participle,
          `Verb metadata: ${dutch}`,
        );
        if (meta[2] === "b")
          row.notes =
            "Auxiliary depends on construction: hebben often for an activity or transitive use; zijn for direction or a change of state.";
        if (["kunnen", "willen", "moeten", "mogen", "laten"].includes(dutch))
          row.notes =
            "The listed participle is used when applicable; before another infinitive the perfect commonly uses an infinitive instead (for example heeft moeten werken).";
      }
      if (type === "adjective")
        [row.inflected, row.comparative, row.superlative] = meta;
      if (
        [
          "januari",
          "februari",
          "maart",
          "april",
          "mei",
          "juni",
          "juli",
          "augustus",
          "september",
          "oktober",
          "november",
          "december",
        ].includes(dutch)
      )
        row.notes =
          "Month names are lowercase in Dutch. Normally used without an article; the plural is only for referring to multiple occurrences of that month.";
      if (notes[dutch]) row.notes = notes[dutch];
      all.push(row);
    }
  }
  const seen = new Map();
  for (const row of all) {
    const key = normalizeKey(row.dutch);
    assert(
      !seen.has(key),
      `Duplicate ${row.dutch}: ${seen.get(key)} / ${row.cefr_level}`,
    );
    seen.set(key, row.cefr_level);
    assert(
      !/^((de|het)\s)/i.test(row.dutch) || row.word_type !== "noun",
      `Noun article repeated: ${row.dutch}`,
    );
    for (const [field, value] of Object.entries(row)) {
      assert.equal(typeof value, "string", `${row.dutch}.${field}`);
      assert(
        !/[\uFFFD\r\n\t]/u.test(value),
        `${row.dutch}.${field}: broken characters`,
      );
      assert.equal(
        value,
        value.trim().replace(/\s+/gu, " "),
        `${row.dutch}.${field}: whitespace`,
      );
    }
    assert(
      row.example_dutch && row.example_english,
      `Example missing: ${row.dutch}`,
    );
    if (row.word_type === "noun")
      assert(["de", "het"].includes(row.article), `Article: ${row.dutch}`);
  }
  for (const [level, count] of [
    ["A1", 500],
    ["A2", 1000],
  ]) {
    const rows = all.filter((r) => r.cefr_level === level);
    assert.equal(rows.length, count, level);
    const preview = validateTable(
      {
        headers,
        rows: rows.map((r, i) => ({
          row: i + 2,
          values: headers.map((h) => r[h]),
        })),
        format: "csv",
        warnings: [],
      },
      "vocabulary",
      level + ".csv",
      { vocabulary: [], grammar: [] },
    );
    assert.deepEqual(preview.issues, [], `${level} real app validation`);
    assert.equal(preview.items.length, count);
  }
  return all;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const rows = await loadVocabulary();
  console.log(
    JSON.stringify(
      {
        counts: Object.fromEntries(
          ["A1", "A2"].map((l) => [
            l,
            rows.filter((r) => r.cefr_level === l).length,
          ]),
        ),
        total: rows.length,
        types: rows.reduce(
          (a, r) => ((a[r.word_type] = (a[r.word_type] ?? 0) + 1), a),
          {},
        ),
      },
      null,
      2,
    ),
  );
  const byHead = new Map(rows.map((r) => [r.dutch, r]));
  const collisions = rows.flatMap((r) =>
    ["plural", "past_participle", "inflected", "comparative", "superlative"]
      .filter((f) => r[f] && r[f] !== r.dutch && byHead.has(r[f]))
      .map((f) => ({
        head: r.dutch,
        field: f,
        form: r[f],
        otherType: byHead.get(r[f]).word_type,
      })),
  );
  console.log(
    "Morphology/headword overlaps requiring lexical review:",
    JSON.stringify(collisions),
  );
}
