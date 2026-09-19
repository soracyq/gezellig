# Gezellig B1/B2 vocabulary

The B1 files contain 1,500 entries; the B2 files contain 2,000. Each level's CSV and Excel workbook contain the same 20 import columns and the same records. Import either format, once per level. All entries have `is_sample=false`. No A1/A2 content or application logic was changed.

## Sources and reuse

These datasets combine original definitions and paired examples with adapted English Wiktionary definitions and attributed Dutch/English example pairs. Row-level attribution is retained in the existing `notes` column in both formats.

- **Wiktionary contributors:** definitions adapted from the Dutch entries of English Wiktionary, retrieved via the [Kaikki Dutch dictionary export](https://kaikki.org/dictionary/Dutch/) in September 2026. Each applicable row links to its entry and credits the contributors. Adapted definitions and examples specifically identified as Wiktionary examples are distributed under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). See [Wiktionary's copyright terms](https://en.wiktionary.org/wiki/Wiktionary:Copyrights); the linked entry's history identifies individual contributors. Definitions were selected, shortened or edited for this collection; grammatical facts were mapped to Gezellig's existing fields.
- **Tatoeba contributors:** example sentences use the [Tatoeba sentence and direct-translation exports](https://downloads.tatoeba.org/exports/) from September 2026. The applicable row names the Dutch and English authors and links to both sentence pages. These sentences retain their [Creative Commons Attribution 2.0 France](https://creativecommons.org/licenses/by/2.0/fr/) license. See [Tatoeba's terms](https://tatoeba.org/en/terms_of_use). Selection and pairing for this collection do not imply contributor endorsement.
- **Original material and compilation:** original definitions, examples, editorial replacements and the selection/arrangement contributed for Gezellig are provided under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/), attributed to the Gezellig vocabulary project. This does not replace the licenses of incorporated material or change the application's code license.

Keep the row attributions and this notice when redistributing the collection. The raw dictionary and sentence corpora are not included in the repository.

## Level placement and checks

B1 and B2 placement is an editorial learning progression, informed by everyday/professional usage and the existing A1/A2 selection. CEFR describes communicative proficiency; it does not prescribe one universal Dutch headword list. Some broadly useful words can be introduced at different levels in different courses. These files are not an official CEFR-certified list or a claim of independent teacher review of every entry.

Automated checks cover exact counts, normalized headword uniqueness across A1–B2, required fields, permitted levels, applicable morphology fields, identical CSV/Excel records and compatibility with Gezellig's importer. Blank noun plurals are explained in `notes` where the selected sense is normally uncountable or plural-only. These structural checks do not certify every linguistic judgment.

The browser import regression also checks fresh and existing learning history, metadata display and cross-format duplicate protection. Importing these files adds curriculum content without recording study or completion events.
