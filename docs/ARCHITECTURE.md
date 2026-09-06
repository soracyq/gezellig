# Dutchly app architecture

Dutchly is a working name and can be changed without changing the learning model.

## What the first milestone does

The app provides seven connected screens, a few separate sample content records, clearly labelled sample statistics, and a locally saved daily vocabulary target. It is a foundation for reviewing the design and navigation. It does not run learning sessions, grade answers, schedule reviews, estimate the learner's actual level, import files, or create accounts.

The app targets iOS, Android, and web with Expo and React Native. TypeScript describes the expected shape of data so accidental mismatches are easier to catch. Expo Router connects URL paths and mobile navigation to screen files. Cross-platform support is a development target, not a claim that every device has been tested.

## Screen map

All main areas remain directly accessible. At smaller sizes, navigation must remain readable and usable without squeezing seven controls into one narrow row.

| Screen     | Route         | Shell behavior                                                                                 | Later behavior                                                                              |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Home       | `/`           | Show sample learning overview, daily target, and links to vocabulary and review previews.      | Resume an unfinished session, show actual due items and daily activity.                     |
| Levels     | `/levels`     | Browse A1–C1 and an explicitly tentative curriculum outline.                                   | Show progress against a validated curriculum version. No artificial locking is planned.     |
| Vocabulary | `/vocabulary` | Browse a small sample set; show fields appropriate to nouns, verbs, and other supported types. | Study a daily set and take a short test.                                                    |
| Grammar    | `/grammar`    | Preview sample topics, English explanations, and Dutch examples.                               | Complete a structured lesson, practice, and lesson test.                                    |
| Review     | `/review`     | Explain the planned review system and show labelled sample items.                              | Answer due questions, handle mistakes, and apply the review policy.                         |
| Statistics | `/statistics` | Show an explicitly labelled example report.                                                    | Calculate learning activity and accuracy from saved events.                                 |
| Settings   | `/settings`   | Choose and save a daily target: 5, 10, 15, 20, 30, 40, or 50 words.                            | Add relevant review preferences and account/import controls only when those features exist. |

## Structure and dependencies

The intended separation is:

```text
src/app/                      Expo Router routes and shared layout
src/screens/                  Main area screen implementations
src/components/               Shared UI, AppShell, and illustration
src/data/sample-content.ts    Labelled sample curriculum and demo data
src/domain/models.ts          Shared TypeScript data definitions
src/state/SettingsProvider.tsx Local settings context
src/storage/settings.ts       Local settings persistence
src/theme/tokens.ts            Colors, spacing, type, and design values
docs/                         Architecture and implementation roadmap
```

Screens consume content and shared components. Local settings are read through a small context. A context makes one settings value available to several screens without manually passing it through every component. It is not a database.

As later milestones need them, add calculations to `src/domain/` and progress access to `src/storage/`. Keep those modules independent of screen rendering. A future backend adapter can implement the same content/progress operations with Supabase. Do not add empty layers just to fill this diagram.

```text
Screens → components + content + settings
Later: screens → learning operations → rules + storage
Later: storage → local database or Supabase
```

## Design and accessibility

Use a natural orange for primary actions, navy and sky blue for supporting emphasis, ivory/white surfaces, and dark neutral text. Centralize values in the theme so the designer can adjust the app without searching every screen. Orange and blue decoration must not replace written states or labels.

Use readable text, generous spacing, large touch areas, meaningful button labels, screen-reader descriptions where needed, and visible keyboard focus on web. Let content reflow on phone, tablet, and desktop. Preview labels should remain visible near sample content and invented statistics.

## Data model

The following describes the entity contracts and their intended growth. `src/domain/models.ts` declares a small starting shape for each entity; content versions, recorded learning-day keys, target snapshots, and expanded lesson sections are future additions. Only the subset needed to show sample content and save settings operates in the shell. Defining an entity does not mean its feature has been implemented.

| Entity            | Purpose and key fields                                                                                                                                            | Relationships                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `User`            | Learner identity: `id`, later an authentication ID and creation timestamp. No real account exists in the shell.                                                   | Owns settings, sessions, attempts, and progress.                                                                                           |
| `UserSettings`    | `userId`, `dailyVocabularyTarget`, English interface language, and IANA `timeZone`; later review preferences and schema version.                                  | One settings record per learner; the shell persists only a smaller versioned daily-target object.                                          |
| `VocabularyItem`  | Stable `id`, `wordType`, Dutch text, English meaning, CEFR level, examples, tags, content version, and optional dataset ID.                                       | Shared curriculum content; personal progress references its ID.                                                                            |
| `GrammarTopic`    | Stable `id`, title, CEFR level, category, prerequisite topic IDs, and content version.                                                                            | Groups one or more lessons; progress refers to the topic or its assessable objectives.                                                     |
| `Lesson`          | `id`, title, level, `contentType`, `contentItemIds`, and expected duration; later objective and ordered sections.                                                 | Groups vocabulary or grammar content; may be resumed through a learning session. Sample grammar sections currently live on `GrammarTopic`. |
| `Question`        | `id`, `relatedItemId`, prompt, question kind, options, correct answer, and explanation; later typed content references, more answer formats, and content version. | Tests a vocabulary item or grammar objective. The shell starts with multiple-choice sample questions.                                      |
| `LearningSession` | `id`, `userId`, type, ordered item IDs, current position, state, start/completion timestamps, and target snapshot.                                                | Groups study activity and attempts; supports resume later.                                                                                 |
| `TestAttempt`     | Immutable `id`, `userId`, session ID, question ID/version, submitted answer, correctness, attempt timestamp, and study-day key.                                   | Provides the evidence used by progress and statistics.                                                                                     |
| `ReviewItem`      | `id`, `userProgressId`, `scheduledFor`, `consecutiveCorrectReviews`, `skipCount`, and optional last review/skip timestamps.                                       | One active scheduling record per learner and assessable learning item; reaches user/content identity through progress.                     |
| `UserProgress`    | `id`, `userId`, `learningItemId`, `contentType`, durable `state`, attempt/mistake totals, and optional first-studied/latest-attempt timestamps.                   | A summary of one learner's history; never changes shared curriculum. Later completion metadata can extend it.                              |
| `ImportedDataset` | `id`, name, source, schema version, imported timestamp, item counts, included levels, and status.                                                                 | Identifies imported content for provenance, validation, and careful removal.                                                               |

The starting progress contract uses `contentType` with `learningItemId`, so it does not assume every item is a word. When adding more reference-bearing records, a reusable typed reference such as `{ kind: 'vocabulary', id: '...' }` or `{ kind: 'grammar', id: '...' }` can keep this relationship explicit. The eventual database must enforce valid references; the storage design will be chosen before the database is built.

Raw attempts will be the source of truth for correctness. Counts stored in `UserProgress` will be derived summaries and must be updated consistently, not separately by multiple screens. `UserProgress` owns durable mastery state. `ReviewItem` owns scheduling fields so there is only one authoritative due date and consecutive-review counter. A combined read view can show these facts together.

### Vocabulary-specific data

`wordType` selects a dedicated shape, with common fields shared across all items:

- **Noun:** article (`de` or `het`) when known, optional `een`, plural, and diminutive.
- **Verb:** infinitive, regularity, separability, auxiliary (`hebben`, `zijn`, or a documented choice), past participle, and supported conjugation groups. Persons and forms are included only when meaningful and verified.
- **Adjective:** base form, optional inflected form, comparative, and superlative.
- **Other:** adverb, pronoun, preposition, conjunction, numeral, particle, expression, or phrase with relevant examples and notes.

A noun must not be required to have a past participle, and a verb must not be required to have an article. Missing optional information should be omitted from the display. Verb constructions can later include present, simple past, perfect, pluperfect, future, future perfect, conditional, and conditional perfect. Do not generate forms to fill empty tables. The subjunctive belongs in an optional advanced topic if validated content calls for it.

## Future date and learning-day rules — not implemented

Save actual event times as UTC timestamps. Also record the IANA study timezone used for the event, such as `Europe/Amsterdam`, and a calendar day key calculated in that timezone. A fixed offset such as `+01:00` is insufficient because daylight saving time changes it.

Use the device timezone as the initial study timezone when real tracking is introduced. Persist it instead of silently moving past activity when a learner travels. An explicit timezone change applies to future events; historical study-day keys remain unchanged. Calculate day boundaries with timezone-aware calendar operations. Compare instants as timestamps, not inconsistent date strings; do not use `toISOString().slice(0, 10)` to decide a local learning day or add a fixed 24 hours to advance a local calendar day.

Proposed daily rules:

1. Take a snapshot of the chosen vocabulary target when the first new-learning session begins that day. A later settings change affects the next day, so lowering the setting does not retroactively complete a day.
2. Count distinct newly studied words after their study step completes. Looking at a preview or repeating the same word does not add another new word. “Studied” does not mean “mastered.”
3. A qualifying study day requires either the day's new-vocabulary target or a completed due-review session containing at least five distinct due items. When fewer than five items are due at the session start, completing all of them qualifies. A session with zero due items does not qualify. Correctness is tracked separately; an honest completed review can qualify despite mistakes.
4. Count a calendar day at most once. An open app, preview navigation, or an abandoned session does not qualify. Grammar activity can qualify later only after its own meaningful completion rule is defined.
5. The current streak includes contiguous qualifying local dates ending today; before today's work is complete, keep yesterday's continuing streak visible. If neither today nor yesterday qualifies, the current streak is zero. Longest streak is the longest contiguous run of qualifying dates.

Statistics will use the same recorded study-day keys: a week starts on Monday; month and year follow the study calendar. Lifetime/recent accuracy are correct graded attempts divided by all graded attempts, with “No answers yet” for a zero denominator. Count first-studied distinct vocabulary for “words learned,” and show mastery as a separate measure. Recent accuracy should identify its window, initially proposed as the latest 20 graded attempts.

## Future review rules — not implemented

Keep one configurable schedule, initially `[1, 3, 7, 14, 30]` calendar days. An incorrect answer resets consecutive correct scheduled reviews to zero, increases total mistakes, and schedules the item for the next study-calendar day. Following the first through fourth correct scheduled reviews, schedule the next review 3, 7, 14, and 30 days later respectively. The fifth consecutive correct scheduled review marks the item mastered. A later incorrect assessed answer returns it to learning with the counter at zero.

Only one eligible scheduled review per item in a review session can advance its counter. Early practice and retries in the same session must not advance mastery; repeated submissions must not create duplicate attempts. This prevents clearing five reviews immediately. The due instant should be the start of the scheduled local study date converted to UTC, so the number means calendar days rather than a fixed number of hours.

Use durable states `new`, `learning`, and `mastered`. Derive **due** from a learning item's next review timestamp, and represent **reviewing** in the active session. This avoids saving contradictory states such as mastered and due at the same time. A studied item awaiting its initial test is learning without a due date; an initial correct test schedules practice and does not grant mastery.

A skip is an explicit learner action on a due review set, not opening the app or crossing midnight. Increment each included due item's skip count once per distinct skip action, capped at five, without deleting it or moving its due date forward. Prevent double-tap duplicate actions. When any unresolved overdue item reaches five skips, keep the entire app and review accessible, but require that overdue review before starting new vocabulary or grammar. A completed graded scheduled review resets that item's skip count; an incorrect answer remains in learning and receives its new due date. This proposal needs UI and logic tests before release.

## Future level estimation — not implemented

An app estimate is not an official CEFR assessment. Do not infer a meaningful level from this shell's sample words or invented statistics.

An initial configurable proposal for a **validated, versioned curriculum** is:

```text
level completion score =
  0.40 × vocabulary mastery proportion
+ 0.30 × grammar topics completed with passed tests proportion
+ 0.20 × recent test accuracy at this level
+ 0.10 × recent scheduled-review accuracy at this level
```

Proportions use values from 0 to 1. Accuracy initially uses the latest 20 eligible attempts of the relevant kind and level. Suggest marking a level complete at a score of at least 0.80, with both vocabulary and grammar coverage at least 0.70 and both accuracy measures at least 0.75. Require 20 test attempts and 10 scheduled-review attempts at a level before making a completion judgment. Treat missing evidence as insufficient evidence, not as passing or zero accuracy.

The displayed estimated level would be the highest consecutively completed level; progress toward the next level uses that next level's score. Until A1 completion has adequate evidence, display “Building A1 foundations” with “Estimated level: not enough evidence yet.” Completion thresholds, weighting, curriculum denominators, and labels remain tentative product choices. They need educational validation and must not be calculated over an arbitrary partial import as if it were a complete CEFR curriculum. Keep this calculation outside the UI and test threshold and missing-data cases.

## Proposed CSV import contract — not implemented

Start with vocabulary CSV. Introduce grammar import separately because lessons and nested exercises do not fit a simple flat table well. Later JSON import can preserve the same typed records and use the same validation pipeline.

Use UTF-8 CSV, one vocabulary item per row, a header row, and standard CSV quoting. A proposed version 1 contract is:

| Field                                                        | Requirement                                                                                                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `item_id`                                                    | Required stable, nonempty ID; uniqueness checked within the dataset.                                                                     |
| `word_type`                                                  | Required supported enum, such as `noun`, `verb`, or `adjective`.                                                                         |
| `dutch`                                                      | Required display/base text. Noun articles are separate; verb text is the infinitive.                                                     |
| `english`                                                    | Required English translation.                                                                                                            |
| `cefr_level`                                                 | Required value in `A1`, `A2`, `B1`, `B2`, `C1`. A supplied label is not proof of validated placement.                                    |
| `example_dutch`, `example_english`                           | Optional paired fields; reject a half-filled pair.                                                                                       |
| `notes`, `tags`                                              | Optional notes and semicolon-separated tags.                                                                                             |
| `article`, `indefinite_article`, `plural`, `diminutive`      | Optional noun fields; article values restricted to `de`/`het`, indefinite article to `een`.                                              |
| `regularity`, `separability`, `auxiliary`, `past_participle` | Optional verb fields with documented enum values; unknown is allowed rather than guessed.                                                |
| `conjugations_json`                                          | Optional verb-only JSON object of supported construction/person keys. This is an advanced field; validate it and CSV-quote it correctly. |
| `inflected_form`, `comparative`, `superlative`               | Optional adjective fields.                                                                                                               |

The import dialogue will collect dataset name, source, and schema version rather than repeating those values in every row. Internal IDs should include dataset identity so identical source IDs from unrelated datasets do not collide. Reimport should initially report duplicates for explicit resolution; do not silently overwrite content or learner history.

```csv
item_id,word_type,dutch,english,cefr_level,article,plural,example_dutch,example_english
sample-house,noun,huis,house,A1,het,huizen,Ik woon in een huis.,I live in a house.
```

Validate field names, row counts, enums, unique IDs, required fields, paired examples, type-specific fields, and size limits. Reject unrelated type-specific data instead of silently discarding it. Report row/column errors, show record counts and a preview, then require confirmation before applying the validated import. Treat text as data and do not evaluate spreadsheet formulas. No partial import should happen without an explicit future policy.

Imported dataset removal must show its scope and require confirmation. Preserve unrelated progress. If referenced content is removed, archive its identifying data or keep a snapshot for historical attempts; implement and test that policy before enabling deletion.

## Tentative A1–C1 curriculum outline

This is a planning outline for organizing software, not an official CEFR syllabus. Topic order and level placement need qualified review. The shell contains only a few identifiable sample records, not the complete curriculum below.

| Level | Possible grammar groups                                                                                                              | Possible vocabulary situations                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| A1    | Articles, personal pronouns, present tense, basic questions, simple word order, basic negation, introductory adjective endings.      | Introductions, home, numbers, common objects, everyday actions.                             |
| A2    | Perfect tense, common past forms, modal and separable verbs, inversion, conjunctions, comparative forms, common prepositions.        | Shopping, travel, routines, appointments, describing experiences.                           |
| B1    | Subordinate and relative clauses, broader past narration, future constructions, conditional introduction, pronoun reference.         | Work, study, opinions, plans, practical problem solving.                                    |
| B2    | Passive constructions, pluperfect, conditional perfect, nuanced connectors, complex word order, register and sentence variation.     | Discussion, argument, media, abstract topics, professional situations.                      |
| C1    | Advanced syntax, nuance and emphasis, formal structures, idiomatic usage, complex discourse, rare forms only in appropriate context. | Extended argument, specialized texts, precise expression, cultural and professional nuance. |

Separate these three concerns: the software permits levels and topic categories; a curriculum defines progression; educational content supplies verified explanations and questions. Improving any one should not require rewriting the other two.

## Reliability and later security

Bundle the sample content locally so the preview screens do not require a content server. Local settings must expose storage loading/errors sensibly and avoid overwriting a saved value before initial loading completes. Local storage can be cleared by the user or browser; it is not a cloud backup.

Before real accounts, introduce explicit schemas and migrations for progress, meaningful persistence tests, and safe handling of corrupted data. When Supabase is added, keep secrets outside source control, use secure auth storage suited to each platform, and enforce per-user access in PostgreSQL/Supabase Row Level Security. A client-side screen check is not authorization. Collect only necessary learning data; no third-party tracking is part of this milestone.
