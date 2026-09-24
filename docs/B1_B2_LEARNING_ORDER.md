# B1/B2 learning order

Gezellig now displays the existing 1,500 B1 and 2,000 B2 vocabulary items in a
practical learning sequence. No vocabulary text, translations, examples,
morphology, CEFR placement or identifiers were edited. All existing vocabulary
and grammar CSV/Excel files remain byte-for-byte unchanged.

## Ordering and preservation

The explicit ordering field is `learning_rank`: 1–1500 in B1 and 1–2000 in B2.
It is held in a read-only sidecar, `src/data/vocabulary-learning-ranks.ts`, keyed
by level, normalized Dutch headword and word type. These are lookup keys, not
replacement item IDs. The full editorial audit also names the field
`learning_rank`.

`src/domain/vocabularyOrder.ts` sorts references to existing records and replaces
only ranked slots within the same level. A1, A2, C1 and unmatched custom words
retain their original positions. The provider exposes that ordered view without
writing it back to storage. Vocabulary browsing, pagination, type/search filters
and the existing new/studied grouping all use this view. Rank order is retained
inside both status groups.

`continueLearning` uses the same order. If the learner's latest studied word is
in B1/B2, it first selects the highest-priority unlearned word in that level.
This handles learners who previously started with the old alphabetical order.
Once the level is finished, the existing continuation/wrap behavior applies.
A1/A2/C1 continuation retains its existing behavior.

The follow-up audit also checks mixed personal imports: custom B1/B2 words retain
their displayed positions in Continue Learning instead of being skipped until
every ranked word is studied. A collection containing only custom words keeps
its previous continuation behavior.

Import IDs currently depend on accepted row positions. For that reason the source
files and importer remain unchanged, and no migration, deletion or reimport is
needed. Existing studied status, mistakes, review schedules and mastery continue
to reference the same IDs. Review priority itself has not changed.

## Editorial method

This is an editorial learning sequence, not a claim that every adjacent pair
has a precisely measurable difference in usefulness.

1. Each level opens with 50 individually selected, mixed items. B1 emphasizes
   everyday needs, clarification, appointments, services and relationships. B2
   emphasizes explanation, argument, decisions and professional/social discussion.
2. The rest combines observed Dutch word frequency with explicit practical-use
   boosts for communication, work/study, home/services, health/social life,
   society/news and descriptions/linking. Useful compounds receive an editorial
   minimum contribution so low headword frequency does not bury practical terms.
3. Niche, literary, specialized and narrow-context words receive a lower priority.
   They are retained, including their existing levels.
4. Where a plural, inflected adjective or participle is more frequent than the
   headword, its frequency minus 0.25 is considered as supporting evidence. This
   is a ranking proxy, not a summed lemma frequency. Multiword expressions with
   no observed frequency use an explicitly editorial baseline, never a fabricated
   phrase frequency inferred from common component words.
5. Among similarly useful candidates (within 0.75 score), recent topic and
   word-type repetition is discouraged. Existing source position breaks remaining
   ties. Alphabetic comparison is not used by the rank builder or application.
6. Explicit, same-level word families stay nearby with a short gap for variety.
   Related words are never pulled across CEFR levels, and the fixed openings
   remain unchanged.

The numerical implementation is in `scripts/build-learning-order.cjs`; selections,
boosts, later-priority terms and families are in
`content-drafts/b1-b2/learning-priority.json`. The derived frequency snapshot is
`learning-frequency.json`. Running `node scripts/build-learning-order.cjs`
reproduces the rank map and `learning-order-audit.json` without changing any
curriculum file. The audit includes every rank, source position, frequency
evidence, usefulness adjustment, theme and original-file SHA-256 hashes.

## Sources and data license

Frequency evidence uses the existing cached Dutch data from
[wordfreq, by Robyn Speer](https://github.com/rspeer/wordfreq). Wordfreq combines
multiple sources; its data reflects language use through approximately 2021.
The cache format and Zipf conversion were checked against the project's
[frequency-reader implementation](https://github.com/rspeer/wordfreq/blob/master/wordfreq/__init__.py).
Frequency is one input alongside the editorial criteria above.

The derived frequency snapshot and rank data are shared under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), with credit to
Robyn Speer and the Gezellig vocabulary project for the adapted selection and
arrangement. Preserve these attributions on redistribution. This does not change
the app code license or the original vocabulary/example licenses.

Following [wordfreq's attribution notice](https://github.com/rspeer/wordfreq/blob/master/NOTICE.md),
credit also belongs to Marc Brysbaert and the other SUBTLEX authors; SUBTLEX is
freely available through the
[Ghent University frequency resources](http://crr.ugent.be/programs-data/subtitle-frequencies).
Underlying wordfreq sources include Google Books Ngrams, Leeds Internet Corpus,
Wikipedia, ParaCrawl and OpenSubtitles. See the linked notice for source-specific
credits and the original vocabulary notice in `public/import-data/` for unchanged
dictionary and sentence attribution.

## Sample inspection

All first 50, middle 50 and last 50 entries in both levels were inspected.
The opening sequences mix nouns, verbs, adjectives and linking/stance expressions.
Middle samples broaden to contexts such as identity, industry, conflict and
specialized descriptions. End samples emphasize narrow compounds, literary,
natural-world, cultural or specialist words. The samples do not follow A–Z;
automated checks also cover mixed forms/themes and related-word proximity.

**First 20 B1:** aangeven, mogelijkheid, redelijk, namelijk, contact, oplossen,
noodzakelijk, wat mij betreft, overleg, aanpassen, behoefte, trouwens, betrouwbaar,
inschrijven, omgeving, zelfstandig, op de hoogte zijn, gevolg, vermijden, prettig.

**First 20 B2:** uitgangspunt, inschatten, relevant, in hoeverre, prioriteit,
verwoorden, concreet, daarentegen, aanbeveling, afronden, haalbaar, in de praktijk,
onderscheid, verantwoorden, kritisch, kortom, draagvlak, vertegenwoordigen,
aannemelijk, in tegenstelling tot.

## Verification

- `npm test`: 152 passed, zero failures, including seven new ordering tests and
  the existing CSV/Excel importer, progress and review regression tests.
- `npm run typecheck`, ESLint on affected files, and Prettier checks passed.
- `npm run build:desktop:dir`: production web export and Windows packaging passed.
- `node scripts/test-learning-order.cjs`: passed against the production browser
  build with all 3,500 entries imported through the real parser/validator/commit
  functions into an isolated profile. Verified both levels' first 50, new/studied
  grouping, type/search filters, unchanged stored records and progress, old-order
  continuation, recording a new study against its original ID, and reload.
- Browser screenshot: `test-results/learning-order/web-b2.png`.
- `node scripts/test-learning-order.cjs --desktop`: the same checks passed in
  the packaged Windows application with an isolated profile and no page errors.
- `npm run build:desktop`: rebuilt `release/Gezellig-0.6.2-Setup.exe` successfully,
  including the data-attribution notice. Installation was not performed.
- Re-running the rank builder produced identical rank-map and audit hashes.

## Files changed for this task

- `src/data/vocabulary-learning-ranks.ts`: all 3,500 explicit ranks.
- `src/domain/vocabularyOrder.ts`: read-only sorting and rank lookup.
- `src/domain/homeLearning.ts`: continuation using the new priorities.
- `src/state/LearningProvider.tsx`: ordered view of existing vocabulary.
- `content-drafts/b1-b2/learning-priority.json`, `learning-frequency.json` and
  `learning-order-audit.json`: editorial inputs, frequency evidence and full audit.
- `scripts/build-learning-order.cjs`: reproducible rank generation.
- `tests/vocabulary-order.test.ts`, `scripts/test-learning-order.cjs`: regression
  and browser/Windows integration tests.
- `public/learning-order-NOTICE.txt`: attribution shipped with web and Windows.
- This report, `docs/B1_B2_LEARNING_ORDER.md`.

No real learner profile was altered during testing. The application version
remains 0.6.2; this task does not publish a GitHub release.
