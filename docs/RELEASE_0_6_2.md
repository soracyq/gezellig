# Gezellig 0.6.2

Daily-goal celebrations, practical B1/B2 learning order, and smoother Review controls are now included in the Windows release.

- Celebrate your daily vocabulary target and first newly completed grammar lesson with a quiet offline chime, once per local day.
- Learn B1/B2 vocabulary in a more useful everyday order. Existing imports, word IDs and learning history stay intact.
- Press Enter to check an answer or continue Review, and open Google Translate to listen to Dutch pronunciation.
- View the installed version and manually check GitHub for updates in About Gezellig.
- Clearer button hover feedback; fixes for delayed celebration audio and custom vocabulary being skipped by Continue Learning.

## Install or update on Windows

Close Gezellig, run **Gezellig-0.6.2-Setup.exe**, then reopen the existing shortcut. The installer retains the existing desktop learning profile. If you previously installed a development build numbered 0.6.2, run this final installer once as well; update checks compare version numbers. About should then show **You're up to date** when you check for updates.

The Windows x64 installer is unsigned. No Node.js, terminal or Codex installation is needed. SHA256SUMS.txt provides checksums for the downloadable assets. macOS is not included in this release.

## Included study files

- B1 vocabulary: 1,500 entries, CSV and Excel.
- B2 vocabulary: 2,000 entries, CSV and Excel.
- B1 grammar: 36 lessons, CSV.
- B2 grammar: 36 lessons, CSV.

Choose either CSV or Excel for each vocabulary level and import one file at a time. The files retain their existing content and schema; the app applies the learning order after import. Source attributions and reuse terms accompany the vocabulary and are included in B1_B2_VOCABULARY_SOURCES.md. Frequency-derived ordering attribution is bundled with the application.

## Validation

153 automated tests passed. Production browser and packaged Windows tests cover imports, saved progress, goal celebrations and audio, vocabulary ordering, Review controls, About/update checks, and grammar completion without viewport jumps. See [the audit report](https://github.com/soracyq/gezellig/blob/main/docs/AUDIT_0_6_2.md) for details.
