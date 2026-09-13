# B1/B2 curriculum checkpoint

This task is **unfinished**. The two grammar CSVs are importable; the vocabulary JSON is authoring work, not a production import file. It deliberately lives outside `public/`.

| Deliverable   | Current state                                                          | Required final state                                    |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| B1 vocabulary | 985 original draft headwords with English meanings and paired examples | Exactly 1,500 reviewed items with applicable morphology |
| B2 vocabulary | Not generated                                                          | Exactly 2,000 reviewed items with applicable morphology |
| B1 grammar    | 36 lessons; orders 73–108                                              | Focused progression beyond A1/A2                        |
| B2 grammar    | 36 lessons; orders 109–144                                             | Focused progression beyond B1                           |

## Completed grammar

- `public/import-data/dutch_grammar_B1.csv`
- `public/import-data/dutch_grammar_B2.csv`

Both files use exactly the existing 17 columns and UTF-8 CSV. All production rows have `is_sample=false`. IDs and titles are unique, every field is populated, and global sort order is continuous from 73 through 144.

B1 progresses through complex word order, subordinate and relative clauses, narrative viewpoint, passives, infinitives and modals, pronouns and `er`, hypotheses, comparisons, negation and cohesion. B2 adds clause hierarchy, information structure, relative reference, advanced passives, reported uncertainty, modal scope, infinitive meaning shifts, counterfactuals, complex `er`, compact structures and register. Similar A1/A2 topics were checked against the existing 72-lesson curriculum; their B1/B2 extensions are stated in each lesson's `notes`.

The existing importer creates two translation practice questions from each new lesson's paired examples. It does not give these lessons the separate five-question A1/A2 practice catalogue. No application code or import schema was changed.

## Vocabulary work still required

`vocabulary-b1.json` contains 561 nouns, 243 verbs, 180 adjectives and one expression. These are draft CEFR assignments and examples, not a completed language review. The duplicate check strips article/reflexive markers and normalizes Unicode and spacing before comparing with A1/A2.

1. Complete the B1 selection and balance the remaining word types and topics. Reassess borderline B1/B2 terms, senses, lexicalized diminutives and plural-only nouns.
2. Author and review B2, excluding every A1/A2 and accepted B1 lemma.
3. Verify noun articles/plurals and applicable verb and adjective metadata against reliable Dutch references. Do not invent missing morphology or count inflections as new items.
4. Export the exact 20-column production vocabulary CSVs only after their 1,500/2,000 counts and content requirements pass.
5. Test both vocabulary CSVs through the existing importer, with existing learner activity preserved.

Do not regenerate or alter A1/A2. The new grammar test records their original SHA-256 hashes and checks them byte for byte.

## Validation commands

Checks run on 14 September 2026:

- `npm test`: 120 passed, 0 failed, including the two new grammar/reference-preservation tests.
- TypeScript, ESLint and formatting checks passed.
- Browser and packaged Windows import tests passed: 36 B1 and 36 B2 lessons accepted after importing the A1/A2 baseline; no new-file duplicates or invalid rows.
- All persisted lesson fields, ordered cards, representative lesson/example/practice views and repeat-import protection passed. Existing learning activity, settings and Statistics stayed unchanged.
- Named prerequisite references in the B1/B2 notes resolve to existing lessons.
- Draft vocabulary check: 985 unique B1 headwords, no duplicates against A1/A2, and no missing draft fields. This does **not** certify vocabulary morphology, CEFR placement or production-import readiness.

```sh
node scripts/validate-b1-b2-vocabulary-draft.mjs
npm test
npm run typecheck
npm run lint
```

For the browser import test, start the existing production preview on port 4173, then run:

```sh
node scripts/test-grammar-imports.cjs --advanced
```

The test uses an isolated browser profile, imports A1/A2 first, then B1/B2, verifies every saved grammar field and card order, opens representative lessons and their practice tabs, checks repeated imports, and compares learning activity and Statistics before and after. `--desktop` runs the same check in the packaged Windows app; `GEZELLIG_TEST_EXECUTABLE` can select a local build.

This checkpoint is a source/data update. It does not replace the published installer or claim that all four requested B1/B2 files are finished.
