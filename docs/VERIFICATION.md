# First milestone verification

Verified on Windows on 6 September 2026. The result is a local application shell with labelled sample content and saved daily-target settings.

## Automated checks

- TypeScript checking and ESLint passed.
- All 13 unit tests passed: sample-data integrity, coherent demonstration statistics, accepted target values, safe loading, damaged-storage recovery, and settings persistence failures.
- Prettier formatting check passed.
- Expo's dependency compatibility check passed.
- Production web export passed with all seven main routes and the missing-page fallback.
- JavaScript bundles for both iOS and Android exported successfully. This checks compilation, not installation or device behavior.

## Browser checks

Automated in a fresh Chrome browser profile using Playwright. Desktop navigation and responsive navigation at 390 px and 360 px widths were exercised, including the menu in an 844 × 390 landscape viewport.

- All seven areas opened through their navigation links.
- Home's continue action opened the sample vocabulary preview.
- Dutch/English search, word-type filters, noun details, verb forms, and empty higher-level collections worked.
- Grammar examples and the sample practice explanation opened correctly.
- Review answers could be revealed and hidden; moving to the next sample cleared the previous answer.
- Level selection and the statistics period selector worked.
- A changed daily target survived a browser reload. Deliberately damaged test settings produced a recovery message and were not overwritten until a target was explicitly chosen.
- Preview actions created no learner-progress records.
- The missing-page screen returned to Home. Its deliberate HTTP 404 is expected.
- No unexpected browser JavaScript or console errors remained after fixes.

Screenshots were inspected for desktop and phone layouts. Link-wrapper styling, narrow filter rows, the phone grammar introduction, and the short-screen menu were corrected during verification. Keyboard focus has a visible outline. Screenshots and temporary browser scripts are kept in ignored `test-results/`, not in the application bundle.

## Remaining limits

Physical iOS/Android device testing, native builds, comprehensive screen-reader testing, production deployment, and guaranteed offline web installation remain unverified. The unit suite does not test future learning/review algorithms because they are not implemented in this milestone.

The dependency audit reports 13 moderate transitive advisories in Expo's dependency tree, involving the native project-generation chain and URI decoding. There are no reported high or critical advisories. Evaluate compatible upstream updates before production deployment; an automatic forced downgrade of Expo was not applied.

The development tools can print a fallback React Native DevTools download warning on this Windows setup. Expo continued serving the app, and browser and platform-bundle checks succeeded. Node's test runner also prints a module-format notice; the test results pass.
