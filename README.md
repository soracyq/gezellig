# Gezellig · Your personal Dutch learning space

Gezellig 0.6.1 fixes imports when the selected content type does not match the file. Recognized vocabulary and grammar columns now select the matching preview automatically, with a visible notice before confirmation. See [the import fix and B1/B2 checks](docs/IMPORT_FIX_0_6_1.md). Existing learning data, the [Gezellig branding](docs/BRANDING_0_6_0.md), [grammar sorting](docs/GRAMMAR_SCROLL_0_5_1.md), [Home continuation and spaced review](docs/CONTINUE_REVIEW_0_5_0.md), and offline pronunciation are preserved.

You can browse A1–C1 content, study word details, complete lessons, submit practice answers, view your own statistics, and import CSV or Excel files. No account or paid service is needed. Everything is stored locally; there is no cloud synchronization.

## Download for Windows

Download **Gezellig-0.6.1-Setup.exe** from [GitHub Releases](https://github.com/soracyq/gezellig/releases/latest). Close any running Dutchly/Gezellig window, run the installer, and open Gezellig from the Start menu or desktop shortcut. Your existing desktop learning data is preserved. The release also includes `SHA256SUMS.txt` for verifying the installer.

The Windows x64 installer is unsigned. Installed users do not need Node.js, a terminal or Codex. The source-code downloads on GitHub are for developers; use the `.exe` asset to install the app.

## Test vocabulary import

1. Open **Import → Vocabulary import**.
2. Download **CSV example** or **XLSX example**. Keep the downloaded source file.
3. Select it under **Select a file to preview**. You should see four valid words: _tafel_, _leren_, _nieuw_ and _alstublieft_.
4. Choose **Confirm import (4)**. The success message reports four words imported; statistics stay unchanged.
5. Open **Vocabulary → A1**, search for `tafel`, and open it. The noun's article and plural are preserved. **Mark studied** records one word.
6. Import the other format of the same example. The four duplicate words are skipped; nothing is overwritten.

For your own content, download the blank template, retain the headers, and fill one word per row. Only `dutch`, `english`, `cefr_level` and `word_type` are required. Optional noun, verb and adjective fields apply only to the relevant type.

## Test grammar import

1. Open **Import → Grammar import**.
2. Download and select **CSV example** or **XLSX example**.
3. Preview two valid lessons, then choose **Confirm import (2)**.
4. Open **Grammar → A1** and open _A first look at niet_. Check its explanation, examples and translation.
5. **Practice** explains that this text-only lesson has no exercises. **Complete lesson** saves a real completion.
6. Import the other example format to check duplicate detection.

Grammar requires `cefr_level`, `title` and `explanation`. Existing lessons and their exercises are preserved. Full field definitions and troubleshooting are in [the import guide](docs/IMPORTS.md). The app also contains a **Show column guide** action.

## How progress works

The old demonstration statistics were never saved as learning history. They have been removed. A fresh activity journal starts at zero once; reopening, viewing content, previewing answers and importing do not reset or increase it.

- **Mark studied:** one unique word counted once until progress is reset.
- **Complete lesson:** one unique lesson counted once until reset.
- **Check answer:** records a real submitted answer and its correctness. Daily Review permits one answer per word/lesson per local day and stops at the Settings target; double-submitting does not add another attempt. Existing in-lesson practice remains separate.
- Accuracy is **Not available** before any answers. Recent accuracy uses the last 20 answers. Mistake items count unique items ever answered incorrectly; this is not a scheduled review queue.
- A study day requires **5 new words OR 1 completed lesson OR 5 distinct answered questions**. Streaks use consecutive local calendar dates. A streak ending yesterday stays active while you have today to continue it. Weeks start on Monday. Changing your daily word target does not rewrite past activity.
- Word study and lesson completion are self-reported study, not verified mastery. A CEFR estimate is not available yet.

## Daily Review and pronunciation

Review uses only marked-studied words, completed lessons or items with real prior answers. A new learner with a full imported curriculum sees **Nothing to review yet**. The existing Settings target is also the maximum number of mixed vocabulary/grammar Review questions for the local day. Fewer eligible items means fewer questions; unseen content never fills the gap. Submitted progress survives reopening, and increasing/decreasing the target preserves historical answers.

Vocabulary uses English-to-Dutch typing. Nouns require the article and rotate through stored singular/plural forms across days. Stored conjugations are used with a small checked set of English prompts; imported verbs without conjugations use infinitive translation. Grammar uses the lesson's existing paired examples, with multiline answers where needed. Deterministic grading tolerates case, whitespace and sentence-ending punctuation, while retaining spelling, accents and word order. It does not recognise arbitrary synonymous translations.

Due/overdue items come first, followed by weak and recently learned content. Five consecutive correct scheduled reviews establish the local mastery/recovery state. Correct early reinforcement does not advance the scheduled streak; an incorrect answer resets it. No unlimited mandatory session or answer-reveal preview remains in Review.

Open a vocabulary word and choose **Listen** for Dutch pronunciation. The app prefers an installed local Dutch voice and automatically uses a bundled Dutch speech engine when one is missing. Both work without an internet connection in the Windows app or local browser version. The built-in voice sounds synthetic; no Dutch voice installation or paid API is required. Listen records no learning activity, and **Mark studied** remains a separate action. Native Expo speech remains unsupported. See [local pronunciation and troubleshooting](docs/LOCAL_PRONUNCIATION.md).

See [the review improvement guide](docs/REVIEW_IMPROVEMENTS.md) for the audit, storage decisions, checks and manual steps.

**Settings → Reset learning progress → Confirm progress reset** clears only learning history and its derived statistics. Cancel leaves everything unchanged. The reset preserves words, lessons, imported datasets and your daily target. It cannot be undone.

Your data remains in this browser profile or desktop app profile. Keep source imports as backups. Clearing site/app storage, using a private browser window, or deleting the desktop profile can remove the local copy. Rebuilding source code does not intentionally clear saved data.
