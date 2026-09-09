# Dutchly · Your personal Dutch learning space

Dutchly 0.3.1 extends the existing Expo / React Native app with studied-only Daily Review, typed vocabulary and grammar translation, offline Dutch pronunciation and focused visual improvements. It retains vocabulary/grammar imports, local progress, the browser build and Electron desktop wrapper.

You can browse A1–C1 content, study word details, complete lessons, submit practice answers, view your own statistics, and import CSV or Excel files. No account or paid service is needed. Everything is stored locally; there is no cloud synchronization.

## Open the app again — Windows

You do not need Codex running. Open **Windows Terminal → PowerShell** and enter:

```powershell
Set-Location -LiteralPath 'D:\Codex\Project\Dutch Learning APP'
npm.cmd run web
```

The terminal prints the address, normally [http://localhost:8081](http://localhost:8081). Open it in Chrome or Edge if the browser does not open automatically. Keep the terminal open. **Ctrl+C** stops the server; closing Codex does not stop a server you started in your own Windows Terminal.

After the computer restarts, run those two commands again. You do not reinstall dependencies each time.

On a new computer or after downloading a fresh checkout, install Node.js 24, open a terminal in this project folder, and run `npm.cmd ci` once before starting. This installs the exact versions in `package-lock.json`. The `.cmd` suffix avoids PowerShell's script execution policy issue. On macOS/Linux, use `npm` instead of `npm.cmd`, and `cd` to your actual project location.

If port 8081 is in use, first try its browser address: an existing copy may already be running. Stop your old server with Ctrl+C if you still have its terminal. Alternatively:

```powershell
npm.cmd run web -- --port 8082
```

Use the same browser, address and port each time. `localhost:8081`, `127.0.0.1:4173`, another browser and the desktop app have separate storage. Changing address can look like a fresh account; return to the old address to find its data.

## Use the normal production browser version

Build it once after code changes, then run the small local web server:

```powershell
Set-Location -LiteralPath 'D:\Codex\Project\Dutch Learning APP'
npm.cmd run export:web
npm.cmd run preview:web
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). This serves the production files without Expo development tooling or Codex. Keep that terminal open while using it. Next time, only `npm.cmd run preview:web` is needed unless the code changed. If 4173 is occupied, use `npm.cmd run preview:web -- --port 4174` and open the printed address.

The production files are in `dist`. Do not double-click `dist/index.html`: browser routing, workers and local storage require the local server or an HTTPS host.

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

## Run or build the desktop version

Electron reuses the production website in its own window and saves data in a stable local profile. On this Windows computer:

```powershell
npm.cmd run desktop
```

That builds the web files and opens Dutchly. After a build exists, `npm.cmd run desktop:open` reopens it without rebuilding. To create the Windows installer:

```powershell
npm.cmd run build:desktop
```

The installer is `release/Dutchly-0.3.1-Setup.exe`; the unpacked app is `release/win-unpacked/Dutchly.exe`. Close the old app before installing the update. The existing desktop profile and imports remain in the same location. An installed app opens from its Start menu or desktop shortcut and needs neither Node, a terminal nor Codex. Learning and Dutch pronunciation work offline.

The Windows build is unsigned. macOS packaging is configured, but must be built and checked on a Mac; it has not been tested here. See [desktop instructions](docs/DESKTOP.md) for platform commands, storage location, signing and distribution limits.

## Hosting preparation

`netlify.toml` sets `npm run export:web` as the build command and `dist` as the publish directory. No site, account or deployment was created. For a static host, deploy the complete `dist` folder at the site root over HTTPS, preserve extensionless page routing, and serve `import-worker.js` and `/templates/` as files. Browser data stays per origin and does not transfer automatically to a hosted address. See [deployment notes](docs/DEPLOYMENT.md).

## Check and maintain the project

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run format:check
npm.cmd run export:web
```

The worker is generated automatically before `start`, `web` and `export:web`. Template downloads are checked-in static assets; you do not need spreadsheet authoring tools to run the app. The optional [template generator](scripts/create-templates.mjs) uses the same schema as the importer and requires the separate artifact-tool authoring runtime.

Source overview: `src/app` contains routes; `src/screens` contains the eight screens; `src/imports` handles parsing/validation/commit; `src/domain` holds models and activity calculations; `src/state` connects actions to storage; `desktop` contains the Electron wrapper. Read [architecture](docs/ARCHITECTURE.md), [phase decisions](docs/PHASE_2_PLAN.md) and [verification](docs/VERIFICATION.md).

Native iOS/Android file import and speech, cloud sync, backup/restore of learning history, dataset deletion and formal proficiency assessment remain future work. Daily review scheduling and five-correct item recovery are implemented, but do not certify CEFR ability. Phone layouts in a browser are supported; native devices have not been tested in this phase.
