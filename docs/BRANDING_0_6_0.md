# Gezellig 0.6.0 — branding update

Dutchly is now Gezellig. This release changes branding only: the sidebar/header wordmark, browser and desktop titles, loading label, footer and About/version copy, app/package metadata, installer display name, and logo/icon assets. Existing learning behavior and curriculum are preserved.

## Visual identity and assets

A single tulip uses the existing warm orange petals, blue stem/leaf, soft peach tile and navy wordmark. The sidebar keeps its original dimensions and pairs a 35-pixel mark with a 27-pixel Gezellig label. The same mark appears in the mobile header and navigation drawer.

| Asset                         | Purpose                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `assets/icon.svg`             | Editable vector source, 64-unit viewBox                              |
| `assets/logo.svg`             | Tulip and Gezellig wordmark; Segoe UI with sans-serif fallback       |
| `assets/logo.png`             | 480 × 128 wordmark export                                            |
| `assets/icon.png`             | 1024 × 1024 app/sidebar source                                       |
| `assets/favicon.png`          | 48 × 48 source for Expo's exported favicon                           |
| `assets/gezellig.ico`         | Windows icon containing 16, 24, 32, 48, 64, 128 and 256-pixel images |
| `assets/mark.svg`             | Existing mark entry point, updated to the tulip                      |
| `public/brand/`               | Public SVG logo/icon and 192/512-pixel PNG manifest icons            |
| `public/manifest.webmanifest` | Gezellig display metadata and icon references                        |

`npm run build:brand` regenerates the exports from `assets/icon.svg`. It uses Sharp from the project's existing `.artifact-build/node_modules` development runtime junction. Generated assets are checked in, so normal application builds do not require that optional authoring runtime. The standalone SVG wordmark uses system typography; use the PNG for an identical rendering on machines without Segoe UI. The icon itself contains only vector paths.

The Windows build now edits executable resources while keeping signing disabled, so Explorer, shortcuts and executable properties receive the Gezellig icon and name. The desktop window also explicitly uses the matching PNG. Browser metadata includes the SVG favicon, Apple touch icon and web manifest. No offline service worker or unrelated application behavior was added.

## Compatibility names intentionally retained

These internal names are not new user-facing branding:

- `@dutchly/settings`, `@dutchly/curriculum/v1`, `@dutchly/activity/v1` and the featured-word key keep existing browser and desktop data accessible.
- `dutchly-local-data` retains the shared storage-lock identity.
- `dutchly://app` and the Expo `dutchly` scheme retain the desktop storage origin and existing links.
- `%APPDATA%\Dutchly` on Windows and `~/Library/Application Support/Dutchly` on macOS retain the existing profile location.
- `com.dutchly.learning` retains application/installer identity. Electron Builder derives the NSIS upgrade GUID from this ID; changing the product/package display names does not change that GUID.
- Optional `DUTCHLY_*` authoring/test environment variables remain compatible with existing developer setups.

The npm packages are now `gezellig` and `gezellig-desktop`, and the Expo slug is `gezellig`. The workspace directory is unchanged. Historical release reports, supplied prompts, curriculum provenance and third-party patch comments may still mention the former name; no source curriculum or speech engine was regenerated or renamed.

## Files changed

Branding implementation: `src/components/AppShell.tsx`, `src/app/+html.tsx`, `src/app/_layout.tsx`, `src/screens/SettingsScreen.tsx`, and `src/screens/StatisticsScreen.tsx`.

Configuration/build: root and desktop package manifests/lockfiles, `app.json`, `desktop/main.cjs`, `desktop/electron-builder.json`, `desktop/static-files.cjs`, `scripts/build-brand-assets.cjs`, preview/start scripts, and the assets listed above. Existing desktop test scripts now launch `Gezellig.exe`, and the Settings test expects the new About label.

Documentation: README, current desktop/import/architecture/pronunciation guides, public import instructions and speech notices. Historical release reports remain historical.

## Verification

All 115 existing unit tests passed, as did TypeScript, ESLint and the browser continuation/review regression. Browser branding checks visited all eight app routes, verified the Gezellig title and absence of the old name in rendered UI, loaded the six favicon/logo/manifest resources with correct response types, and exercised the mobile navigation menu. Logo layout and screenshots were checked at widths 360, 390, 768, 1440 and 1920 pixels.

Windows executable properties report ProductName, FileDescription and CompanyName as Gezellig, version 0.6.0. The tulip was extracted from the executable's embedded icon for visual inspection. Test reports and screenshots are under `test-results/branding/`.

The packaged Gezellig app reopened a profile created by the old Dutchly 0.5.2 executable, with curriculum, activity and settings byte-for-byte unchanged. Desktop branding checks passed for all eight routes, window/application titles and all six branding resources. Separate Windows UI checks passed for vocabulary/grammar CSV imports, Settings, reset cancellation/confirmation, Levels navigation and ordinary lesson dialogs. Both desktop runs used isolated profiles and reported no page errors. All 95 bundled web files match the tested export, and dependency lock entries are unchanged apart from the root package name/version. The Windows installer was built but its installation wizard was not run over the user's installation.

## Windows update

Close the running app and use `release/Gezellig-0.6.0-Setup.exe`. The unpacked executable is `release/win-unpacked/Gezellig.exe`. Reopen using the Gezellig shortcut after installation. Existing learner data uses the same profile and storage keys; do not rename or move that profile folder.

The installer remains unsigned. macOS packaging and native iOS/Android launch behavior were not tested in this Windows workspace.
