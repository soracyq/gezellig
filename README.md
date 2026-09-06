# Dutchly

A calm Dutch-learning app with an English interface, designed for web, iOS, and Android. This first milestone is a working application shell with sample content, not a complete learning product or an official CEFR assessment.

## First milestone

Navigate between Home, Levels, Vocabulary, Grammar, Review, Statistics, and Settings. Explore small sample vocabulary and grammar collections, preview review questions, and change your daily vocabulary target. Dashboard and statistics figures are demonstration data. Learning sessions, grading, mastery, scheduling, importing, and accounts come in later milestones.

The project uses Expo SDK 57, React Native, React, TypeScript, and Expo Router. React context holds the settings preference and AsyncStorage saves it on the current device or browser. No backend, accounts, secrets, or tracking services are required.

## Development environment

Checked on Windows: Node.js 24.14.1, npm 11.11.0, and Git 2.53.0 are installed. Java and Android Debug Bridge were not found on PATH; they are unnecessary for browser development. A local iOS simulator requires a Mac. Use a physical device with a compatible Expo Go version, or configure a development build later, for mobile testing.

## Open the app

Open a PowerShell terminal in `D:\Codex\Project\Dutch Learning APP`. All commands below run in that folder.

1. Run `npm.cmd install` the first time, or after dependencies change. It downloads the project libraries into `node_modules` without changing your brief.
2. Run `npm.cmd run web`. This starts Expo's development server and opens the browser. The terminal prints the local address, normally `http://localhost:8081`.
3. Keep the terminal running while using the app. Press Ctrl+C in that terminal to stop the server.

On systems without PowerShell's script policy restrictions, `npm` works in place of `npm.cmd`.

For a phone, run `npm.cmd start`, install a compatible [Expo Go](https://expo.dev/go) version, and scan the terminal QR code while phone and computer share a network. Physical-device support has not yet been verified. `npm.cmd run android` requires an Android emulator or a connected configured device; `npm.cmd run ios` requires macOS and Xcode.

## Check the app

Run `npm.cmd run typecheck` to check TypeScript, `npm.cmd run lint` to check code quality, and `npm.cmd test` to check implemented data and settings rules. Run `npm.cmd run export:web` to generate the production web bundle in `dist`. These checks do not publish anything.

Run `npm.cmd run format:check` to check formatting. `npm.cmd run format` reformats the source and documentation for readability; it changes files but not the intended app behavior. See [verification results](docs/VERIFICATION.md) for completed browser checks and remaining limitations.

In the browser, visit all seven navigation areas, filter the vocabulary, open a word and grammar lesson preview, reveal a review answer, and change the daily target under Settings. Reload to confirm that the target is remembered. Reduce the browser width to check the phone layout. Demonstration activity figures should remain unchanged by previews.

## Where to make changes

- `src/app/`: screen addresses and shared router layout.
- `src/screens/`: the seven main screens.
- `src/components/`: reusable buttons, cards, navigation, and illustration.
- `src/theme/tokens.ts`: colors, spacing, type, and corner sizes.
- `src/domain/models.ts`: content and learner data definitions.
- `src/data/sample-content.ts`: small, explicitly labelled sample curriculum.
- `src/state/SettingsProvider.tsx`: shared daily-target preference.
- `src/storage/settings.ts`: settings validation and persistence boundary.
- `tests/`: checks for implemented rules.
- `docs/`: architecture, screen map, and staged roadmap.

Read [DECISIONS.md](DECISIONS.md), [the architecture](docs/ARCHITECTURE.md), and [the roadmap](docs/ROADMAP.md) for rationale and planned features. Future rules in these files are proposals, not claims of implemented behavior.

## Configuration later

No environment file is needed now. When Supabase is introduced, add a documented `.env.example` containing placeholders and a local ignored `.env`. Expo variables prefixed `EXPO_PUBLIC_` are visible in the app: only public project URLs and publishable client keys belong there. Server-only credentials must remain on the server. User authorization will be enforced through Supabase policies, not just screen visibility.

## Sample content and limitations

The sample words and two grammar topics demonstrate the software structure. Their level assignments are provisional. A qualified curriculum review and validated imports are needed before release. Browser settings remain on one browser/device; there is no cloud synchronization. Cached development code is not a guaranteed offline-installed web app.

## Technical references

[Expo project setup](https://docs.expo.dev/get-started/create-a-project/) and [Expo Router installation](https://docs.expo.dev/router/installation/) were checked when selecting the compatible SDK packages. Package versions are locked in `package-lock.json` for repeatable installs.
