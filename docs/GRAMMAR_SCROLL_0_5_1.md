# Dutchly 0.5.1 — Grammar sorting and scroll preservation

Completing a lesson saves the existing completion event, changes its status to Completed, and immediately places it after incomplete lessons in the current level. Both groups retain their original `sort_order`. Completing lesson 02 in a four-lesson list produces 01, 03, 04, 02. The Not completed filter removes the completed lesson immediately.

The existing Grammar page layout, lesson numbers, curriculum and storage format are preserved.

## How screen position stays stable

`GrammarViewport` captures the page's scroll offset just before React changes the DOM, then restores it after the commit, before paint. Browser scroll anchoring is disabled for the Grammar page so it cannot follow a card to the end. There is no animated reorder or scroll-to-card action.

The completed card's opener is replaced so the modal's default focus restoration cannot focus that button at its new position. After dismissal, focus returns to a visible incomplete lesson using `preventScroll`, or to the page content if none is visible.

The guard applies to the browser and Electron Windows app. Native Android/iOS behavior has not been validated. If removing a card shortens the page below the current scroll offset at the very bottom, the browser necessarily clamps to its new maximum offset.

## Verification

The focused Playwright script checks immediate DOM ordering while the modal remains open, Completed status, exactly one saved completion, persistence after reload, and scroll position on every animation frame through completion and dismissal. It covers the four-lesson example, the middle of a long list with existing completions, the Not completed filter, and a narrow browser viewport. Dismissal uses X, Done and Escape.

```powershell
node --experimental-strip-types scripts/test-grammar-scroll.cjs
node --experimental-strip-types scripts/test-grammar-scroll.cjs --desktop
```

Reports are written to `test-results/grammar-scroll/`. The existing continuation/review regression script also checks completion with imported curriculum in All and Not completed, alongside Home, Review and route smoke checks.

Verified for this release: all four browser cases and all three packaged Windows cases passed with a maximum measured scroll movement of 0 pixels and no page errors. The browser continuation/review regression passed. All 115 unit tests, TypeScript, ESLint and formatting checks passed. Production export and Windows installer packaging succeeded; all 89 bundled web files match the tested export. Packaged app checks used an isolated test profile; the installer wizard was not run over the user's installation.

## Windows update

Close Dutchly and run `release/Dutchly-0.5.1-Setup.exe`. Reopen it from the existing shortcut. Imported content and saved learning history use the same local profile. Browser development users can restart `npm.cmd run web` and reload their existing browser tab.
