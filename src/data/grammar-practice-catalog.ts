// Prepared from existing lesson content. Rebuild with scripts/build-grammar-practice.cjs.
import type { GrammarPracticeEntry } from "../domain/grammarPractice.ts";
export const grammarPracticeCatalog: Record<string, GrammarPracticeEntry> = {
  "a1-basic-sentences": {
    source: {
      objective: "Build a short statement with a subject and a verb.",
      rules: [
        "Start a simple statement with subject + finite verb, then add the remaining information.",
      ],
      examples: [
        {
          dutch: "Ik woon hier.",
          english: "I live here.",
        },
        {
          dutch: "De bus komt vandaag.",
          english: "The bus is coming today.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt: "Choose the missing form:\nIk ___ hier.\nI live here.",
        correctAnswer: "woon",
        acceptedAnswers: [],
        explanation:
          "Start a simple statement with subject + finite verb, then add the remaining information.",
        hint: "",
        options: ["woon", "woont", "wonen"],
        id: "a1-basic-sentences:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe bus ___ vandaag.\nThe bus is coming today.",
        correctAnswer: "komt",
        acceptedAnswers: [],
        explanation:
          "Start a simple statement with subject + finite verb, then add the remaining information.",
        hint: "Use komen with de bus.",
        id: "a1-basic-sentences:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I live here.",
        correctAnswer: "Ik woon hier.",
        acceptedAnswers: [],
        explanation:
          "Start a simple statement with subject + finite verb, then add the remaining information.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["hier.", "Ik", "woon"],
        id: "a1-basic-sentences:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I live here.",
        correctAnswer: "Ik woon hier.",
        acceptedAnswers: [],
        explanation:
          "Start a simple statement with subject + finite verb, then add the remaining information.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-basic-sentences:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The bus is coming today.",
        correctAnswer: "De bus komt vandaag.",
        acceptedAnswers: [],
        explanation:
          "Start a simple statement with subject + finite verb, then add the remaining information.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-basic-sentences:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-subject-pronouns": {
    source: {
      objective:
        "Choose a subject pronoun for the speaker, listener or another person.",
      rules: [
        "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
      ],
      examples: [
        {
          dutch: "Zij woont hier.",
          english: "She lives here.",
        },
        {
          dutch: "Zij wonen hier.",
          english: "They live here.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt: "Choose the missing form:\n___ woont hier.\nShe lives here.",
        correctAnswer: "Zij",
        acceptedAnswers: [],
        explanation:
          "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
        hint: "",
        options: ["Wij", "Jullie", "Zij"],
        id: "a1-subject-pronouns:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt: "Complete the sentence:\n___ wonen hier.\nThey live here.",
        correctAnswer: "Zij",
        acceptedAnswers: ["Ze"],
        explanation:
          "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
        hint: "Use zij or ze for they.",
        id: "a1-subject-pronouns:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Wij] woont hier.\nShe lives here.",
        correctAnswer: "Zij woont hier.",
        acceptedAnswers: ["Ze woont hier."],
        explanation:
          "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-subject-pronouns:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "She lives here.",
        correctAnswer: "Zij woont hier.",
        acceptedAnswers: ["Ze woont hier."],
        explanation:
          "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-subject-pronouns:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "They live here.",
        correctAnswer: "Zij wonen hier.",
        acceptedAnswers: ["Ze wonen hier."],
        explanation:
          "Use ik, jij/je, u, hij, zij/ze or het for a singular subject; use wij/we, jullie or zij/ze for a plural subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-subject-pronouns:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-present-zijn": {
    source: {
      objective:
        "Use present forms of zijn to describe identity, location and condition.",
      rules: [
        "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
      ],
      examples: [
        {
          dutch: "Ik ben vandaag thuis.",
          english: "I am at home today.",
        },
        {
          dutch: "De kinderen zijn moe.",
          english: "The children are tired.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ vandaag thuis.\nI am at home today.",
        correctAnswer: "ben",
        acceptedAnswers: [],
        explanation:
          "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
        hint: "",
        options: ["zijn", "ben", "is"],
        id: "a1-present-zijn:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe kinderen ___ moe.\nThe children are tired.",
        correctAnswer: "zijn",
        acceptedAnswers: [],
        explanation:
          "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
        hint: "Use zijn with the plural subject.",
        id: "a1-present-zijn:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk [is] vandaag thuis.\nI am at home today.",
        correctAnswer: "Ik ben vandaag thuis.",
        acceptedAnswers: [],
        explanation:
          "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-present-zijn:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am at home today.",
        correctAnswer: "Ik ben vandaag thuis.",
        acceptedAnswers: [],
        explanation:
          "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-zijn:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The children are tired.",
        correctAnswer: "De kinderen zijn moe.",
        acceptedAnswers: [],
        explanation:
          "Learn ben, bent, is and zijn as the present forms of zijn; match the form to the subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-zijn:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-infinitives-stems": {
    source: {
      objective: "Find the written stem of common regular Dutch verbs.",
      rules: [
        "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
      ],
      examples: [
        {
          dutch: "Ik woon in een klein huis.",
          english: "I live in a small house.",
        },
        {
          dutch: "Ik reis met de trein.",
          english: "I travel by train.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ in een klein huis.\nI live in a small house.",
        correctAnswer: "woon",
        acceptedAnswers: [],
        explanation:
          "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
        hint: "",
        options: ["woon", "won", "woont"],
        id: "a1-infinitives-stems:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk ___ met de trein.\nI travel by train.",
        correctAnswer: "reis",
        acceptedAnswers: [],
        explanation:
          "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
        hint: "Write the stem of reizen.",
        id: "a1-infinitives-stems:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk [won] in een klein huis.\nI live in a small house.",
        correctAnswer: "Ik woon in een klein huis.",
        acceptedAnswers: [],
        explanation:
          "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-infinitives-stems:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I live in a small house.",
        correctAnswer: "Ik woon in een klein huis.",
        acceptedAnswers: [],
        explanation:
          "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-infinitives-stems:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I travel by train.",
        correctAnswer: "Ik reis met de trein.",
        acceptedAnswers: [],
        explanation:
          "Remove -en, preserve the vowel sound, avoid doubled final consonants, and change final v/z to f/s where necessary.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-infinitives-stems:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-present-regular": {
    source: {
      objective:
        "Form regular present-tense verbs for singular and plural subjects.",
      rules: [
        "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
      ],
      examples: [
        {
          dutch: "Mijn broer werkt in een winkel.",
          english: "My brother works in a shop.",
        },
        {
          dutch: "Wij wonen naast het station.",
          english: "We live beside the station.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nMijn broer ___ in een winkel.\nMy brother works in a shop.",
        correctAnswer: "werkt",
        acceptedAnswers: [],
        explanation:
          "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
        hint: "",
        options: ["werk", "werken", "werkt"],
        id: "a1-present-regular:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWij ___ naast het station.\nWe live beside the station.",
        correctAnswer: "wonen",
        acceptedAnswers: [],
        explanation:
          "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
        hint: "Use wonen with wij.",
        id: "a1-present-regular:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nMijn broer [werk] in een winkel.\nMy brother works in a shop.",
        correctAnswer: "Mijn broer werkt in een winkel.",
        acceptedAnswers: [],
        explanation:
          "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-present-regular:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "My brother works in a shop.",
        correctAnswer: "Mijn broer werkt in een winkel.",
        acceptedAnswers: [],
        explanation:
          "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-regular:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We live beside the station.",
        correctAnswer: "Wij wonen naast het station.",
        acceptedAnswers: ["We wonen naast het station."],
        explanation:
          "Regular present: ik uses the stem; other singular subjects normally add -t to the stem; plural subjects use the infinitive. Do not double a final t.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-regular:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-present-common-irregulars": {
    source: {
      objective: "Use the present forms of hebben, gaan, komen and doen.",
      rules: [
        "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
      ],
      examples: [
        {
          dutch: "Mijn zus heeft een nieuwe fiets.",
          english: "My sister has a new bicycle.",
        },
        {
          dutch: "Wij gaan naar huis.",
          english: "We are going home.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nMijn zus ___ een nieuwe fiets.\nMy sister has a new bicycle.",
        correctAnswer: "heeft",
        acceptedAnswers: [],
        explanation:
          "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
        hint: "",
        options: ["hebben", "heeft", "heb"],
        id: "a1-present-common-irregulars:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWij ___ naar huis.\nWe are going home.",
        correctAnswer: "gaan",
        acceptedAnswers: [],
        explanation:
          "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
        hint: "Use gaan with wij.",
        id: "a1-present-common-irregulars:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nMijn zus [heb] een nieuwe fiets.\nMy sister has a new bicycle.",
        correctAnswer: "Mijn zus heeft een nieuwe fiets.",
        acceptedAnswers: [],
        explanation:
          "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-present-common-irregulars:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "My sister has a new bicycle.",
        correctAnswer: "Mijn zus heeft een nieuwe fiets.",
        acceptedAnswers: [],
        explanation:
          "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-common-irregulars:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We are going home.",
        correctAnswer: "Wij gaan naar huis.",
        acceptedAnswers: ["We gaan naar huis."],
        explanation:
          "Learn heb/hebt/heeft/hebben, ga/gaat/gaan, kom/komt/komen and doe/doet/doen as complete present patterns.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-present-common-irregulars:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-yes-no-questions": {
    source: {
      objective: "Turn a simple statement into a yes/no question.",
      rules: [
        "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
      ],
      examples: [
        {
          dutch: "Werk je vandaag?",
          english: "Are you working today?",
        },
        {
          dutch: "Heeft u een afspraak?",
          english: "Do you have an appointment?",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ je vandaag?\nAre you working today?",
        correctAnswer: "Werk",
        acceptedAnswers: [],
        explanation:
          "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
        hint: "",
        options: ["Werk", "Werkt", "Werken"],
        id: "a1-yes-no-questions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ u een afspraak?\nDo you have an appointment?",
        correctAnswer: "Heeft",
        acceptedAnswers: [],
        explanation:
          "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
        hint: "Use hebben with u.",
        id: "a1-yes-no-questions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Are you working today?",
        correctAnswer: "Werk je vandaag?",
        acceptedAnswers: ["Werk jij vandaag?"],
        explanation:
          "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
        hint: "Keep the lesson's wording. Begin with “Werk”.",
        chunks: ["vandaag?", "Werk", "je"],
        id: "a1-yes-no-questions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Are you working today?",
        correctAnswer: "Werk je vandaag?",
        acceptedAnswers: ["Werk jij vandaag?"],
        explanation:
          "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-yes-no-questions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Do you have an appointment?",
        correctAnswer: "Heeft u een afspraak?",
        acceptedAnswers: [],
        explanation:
          "Yes/no question: finite verb + subject + remaining information. Drop only the added present -t before subject jij/je.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-yes-no-questions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-question-words": {
    source: {
      objective: "Ask for specific information using Dutch question words.",
      rules: [
        "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
      ],
      examples: [
        {
          dutch: "Wanneer begint de les?",
          english: "When does the lesson start?",
        },
        {
          dutch: "Welk boek lees je?",
          english: "Which book are you reading?",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ begint de les?\nWhen does the lesson start?",
        correctAnswer: "Wanneer",
        acceptedAnswers: [],
        explanation:
          "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
        hint: "",
        options: ["Wie", "Wat", "Wanneer"],
        id: "a1-question-words:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ boek lees je?\nWhich book are you reading?",
        correctAnswer: "Welk",
        acceptedAnswers: [],
        explanation:
          "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
        hint: "Use the form of which that belongs with boek.",
        id: "a1-question-words:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: When does the lesson start?",
        correctAnswer: "Wanneer begint de les?",
        acceptedAnswers: [],
        explanation:
          "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
        hint: "Keep the lesson's wording. Begin with “Wanneer”.",
        chunks: ["de", "les?", "Wanneer", "begint"],
        id: "a1-question-words:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "When does the lesson start?",
        correctAnswer: "Wanneer begint de les?",
        acceptedAnswers: [],
        explanation:
          "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-question-words:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Which book are you reading?",
        correctAnswer: "Welk boek lees je?",
        acceptedAnswers: [],
        explanation:
          "Usually use question phrase + finite verb + subject. If the question word is the subject, follow it directly with its verb.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-question-words:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-verb-second": {
    source: {
      objective:
        "Start a statement with time or place while keeping Dutch verb-second order.",
      rules: [
        "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
      ],
      examples: [
        {
          dutch: "Vandaag werkt mijn moeder thuis.",
          english: "Today my mother is working at home.",
        },
        {
          dutch: "Na de les ga ik naar huis.",
          english: "After the lesson I am going home.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nVandaag ___ mijn moeder thuis.\nToday my mother is working at home.",
        correctAnswer: "werkt",
        acceptedAnswers: [],
        explanation:
          "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
        hint: "",
        options: ["werken", "werkt", "werk"],
        id: "a1-verb-second:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nNa de les ___ ik naar huis.\nAfter the lesson I am going home.",
        correctAnswer: "ga",
        acceptedAnswers: [],
        explanation:
          "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
        hint: "Use gaan with ik after the opening phrase.",
        id: "a1-verb-second:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Today my mother is working at home.",
        correctAnswer: "Vandaag werkt mijn moeder thuis.",
        acceptedAnswers: [],
        explanation:
          "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
        hint: "Keep the lesson's wording. Begin with “Vandaag”.",
        chunks: ["mijn", "moeder", "thuis.", "Vandaag", "werkt"],
        id: "a1-verb-second:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Today my mother is working at home.",
        correctAnswer: "Vandaag werkt mijn moeder thuis.",
        acceptedAnswers: [],
        explanation:
          "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-verb-second:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "After the lesson I am going home.",
        correctAnswer: "Na de les ga ik naar huis.",
        acceptedAnswers: [],
        explanation:
          "Fronted phrase + finite verb + subject + rest. Count sentence parts, not individual words.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-verb-second:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-articles": {
    source: {
      objective:
        "Choose a definite or indefinite article with a familiar Dutch noun.",
      rules: [
        "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
      ],
      examples: [
        {
          dutch: "Ik koop een boek.",
          english: "I am buying a book.",
        },
        {
          dutch: "De boeken liggen op de tafel.",
          english: "The books are on the table.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk koop ___ boek.\nI am buying a book.",
        correctAnswer: "een",
        acceptedAnswers: [],
        explanation:
          "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
        hint: "",
        options: ["een", "het", "de"],
        id: "a1-articles:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ boeken liggen op de tafel.\nThe books are on the table.",
        correctAnswer: "De",
        acceptedAnswers: [],
        explanation:
          "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
        hint: "Use the definite plural article.",
        id: "a1-articles:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk koop [het] boek.\nI am buying a book.",
        correctAnswer: "Ik koop een boek.",
        acceptedAnswers: [],
        explanation:
          "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-articles:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am buying a book.",
        correctAnswer: "Ik koop een boek.",
        acceptedAnswers: [],
        explanation:
          "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-articles:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The books are on the table.",
        correctAnswer: "De boeken liggen op de tafel.",
        acceptedAnswers: [],
        explanation:
          "Singular definite: learned de or het. Singular indefinite count noun: een. Definite plural: de; indefinite plural usually no article.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-articles:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-noun-plurals": {
    source: {
      objective: "Form and recognise common Dutch noun plurals.",
      rules: [
        "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
      ],
      examples: [
        {
          dutch: "Ik zie twee auto's.",
          english: "I see two cars.",
        },
        {
          dutch: "De kinderen lezen boeken.",
          english: "The children are reading books.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt: "Choose the missing form:\nIk zie twee ___.\nI see two cars.",
        correctAnswer: "auto's",
        acceptedAnswers: [],
        explanation:
          "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
        hint: "",
        options: ["auto", "autoen", "auto's"],
        id: "a1-noun-plurals:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe kinderen lezen ___.\nThe children are reading books.",
        correctAnswer: "boeken",
        acceptedAnswers: [],
        explanation:
          "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
        hint: "Write the plural of boek.",
        id: "a1-noun-plurals:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk zie twee [auto].\nI see two cars.",
        correctAnswer: "Ik zie twee auto's.",
        acceptedAnswers: [],
        explanation:
          "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-noun-plurals:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I see two cars.",
        correctAnswer: "Ik zie twee auto's.",
        acceptedAnswers: [],
        explanation:
          "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-noun-plurals:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The children are reading books.",
        correctAnswer: "De kinderen lezen boeken.",
        acceptedAnswers: [],
        explanation:
          "Common plurals use -en or -s, with spelling changes where needed; all definite plural nouns take de.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-noun-plurals:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-diminutives": {
    source: {
      objective:
        "Recognise common diminutives and choose their article and plural.",
      rules: [
        "A singular diminutive takes het; its plural normally ends in -s and takes de.",
      ],
      examples: [
        {
          dutch: "We hebben een tafeltje bij het raam.",
          english: "We have a small table by the window.",
        },
        {
          dutch: "De huisjes zijn wit.",
          english: "The little houses are white.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe hebben een ___ bij het raam.\nWe have a small table by the window.",
        correctAnswer: "tafeltje",
        acceptedAnswers: [],
        explanation:
          "A singular diminutive takes het; its plural normally ends in -s and takes de.",
        hint: "",
        options: ["tafeltjen", "tafeltje", "tafelje"],
        id: "a1-diminutives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe ___ zijn wit.\nThe little houses are white.",
        correctAnswer: "huisjes",
        acceptedAnswers: [],
        explanation:
          "A singular diminutive takes het; its plural normally ends in -s and takes de.",
        hint: "Write the plural diminutive of huis.",
        id: "a1-diminutives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe hebben een [tafelje] bij het raam.\nWe have a small table by the window.",
        correctAnswer: "We hebben een tafeltje bij het raam.",
        acceptedAnswers: [],
        explanation:
          "A singular diminutive takes het; its plural normally ends in -s and takes de.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-diminutives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We have a small table by the window.",
        correctAnswer: "We hebben een tafeltje bij het raam.",
        acceptedAnswers: [],
        explanation:
          "A singular diminutive takes het; its plural normally ends in -s and takes de.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-diminutives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The little houses are white.",
        correctAnswer: "De huisjes zijn wit.",
        acceptedAnswers: [],
        explanation:
          "A singular diminutive takes het; its plural normally ends in -s and takes de.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-diminutives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-demonstratives": {
    source: {
      objective: "Choose deze, die, dit or dat before a noun.",
      rules: [
        "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
      ],
      examples: [
        {
          dutch: "Deze fiets is nieuw.",
          english: "This bicycle is new.",
        },
        {
          dutch: "Dat huis is groot.",
          english: "That house is big.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ fiets is nieuw.\nThis bicycle is new.",
        correctAnswer: "Deze",
        acceptedAnswers: [],
        explanation:
          "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
        hint: "",
        options: ["Deze", "Dit", "Dat"],
        id: "a1-demonstratives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ huis is groot.\nThat house is big.",
        correctAnswer: "Dat",
        acceptedAnswers: [],
        explanation:
          "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
        hint: "Use the form of that belonging with huis.",
        id: "a1-demonstratives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Dit] fiets is nieuw.\nThis bicycle is new.",
        correctAnswer: "Deze fiets is nieuw.",
        acceptedAnswers: [],
        explanation:
          "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-demonstratives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "This bicycle is new.",
        correctAnswer: "Deze fiets is nieuw.",
        acceptedAnswers: [],
        explanation:
          "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-demonstratives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "That house is big.",
        correctAnswer: "Dat huis is groot.",
        acceptedAnswers: [],
        explanation:
          "Use deze/die with singular de-words and all plurals; use dit/dat with singular het-words.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-demonstratives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-possessives": {
    source: {
      objective: "Choose a possessive determiner, including ons and onze.",
      rules: [
        "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
      ],
      examples: [
        {
          dutch: "Ons huis is klein.",
          english: "Our house is small.",
        },
        {
          dutch: "Onze buren hebben een hond.",
          english: "Our neighbours have a dog.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ huis is klein.\nOur house is small.",
        correctAnswer: "Ons",
        acceptedAnswers: [],
        explanation:
          "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
        hint: "",
        options: ["Onze", "Onz", "Ons"],
        id: "a1-possessives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ buren hebben een hond.\nOur neighbours have a dog.",
        correctAnswer: "Onze",
        acceptedAnswers: [],
        explanation:
          "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
        hint: "Write our before a plural noun.",
        id: "a1-possessives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Onze] huis is klein.\nOur house is small.",
        correctAnswer: "Ons huis is klein.",
        acceptedAnswers: [],
        explanation:
          "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-possessives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Our house is small.",
        correctAnswer: "Ons huis is klein.",
        acceptedAnswers: [],
        explanation:
          "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-possessives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Our neighbours have a dog.",
        correctAnswer: "Onze buren hebben een hond.",
        acceptedAnswers: [],
        explanation:
          "A possessive replaces the article; our is ons with a singular het-word and onze with de-words and plurals.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-possessives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-adjective-position": {
    source: {
      objective:
        "Distinguish an adjective before a noun from an adjective after zijn.",
      rules: [
        "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
      ],
      examples: [
        {
          dutch: "De mooie tuin is groot.",
          english: "The beautiful garden is big.",
        },
        {
          dutch: "De kamers zijn klein.",
          english: "The rooms are small.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDe ___ tuin is groot.\nThe beautiful garden is big.",
        correctAnswer: "mooie",
        acceptedAnswers: [],
        explanation:
          "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
        hint: "",
        options: ["moois", "mooie", "mooi"],
        id: "a1-adjective-position:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe kamers zijn ___.\nThe rooms are small.",
        correctAnswer: "klein",
        acceptedAnswers: [],
        explanation:
          "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
        hint: "Use klein after zijn.",
        id: "a1-adjective-position:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDe [mooi] tuin is groot.\nThe beautiful garden is big.",
        correctAnswer: "De mooie tuin is groot.",
        acceptedAnswers: [],
        explanation:
          "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-adjective-position:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "The beautiful garden is big.",
        correctAnswer: "De mooie tuin is groot.",
        acceptedAnswers: [],
        explanation:
          "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-adjective-position:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The rooms are small.",
        correctAnswer: "De kamers zijn klein.",
        acceptedAnswers: [],
        explanation:
          "An adjective before a noun may take -e; an adjective used as a description after zijn has no agreement ending.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-adjective-position:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-adjective-endings": {
    source: {
      objective:
        "Apply the basic -e pattern before de-words, het-words and plurals.",
      rules: [
        "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
      ],
      examples: [
        {
          dutch: "We hebben een kleine tuin.",
          english: "We have a small garden.",
        },
        {
          dutch: "Dit kleine huis heeft een groot raam.",
          english: "This small house has a large window.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe hebben een ___ tuin.\nWe have a small garden.",
        correctAnswer: "kleine",
        acceptedAnswers: [],
        explanation:
          "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
        hint: "",
        options: ["kleine", "klein", "kleins"],
        id: "a1-adjective-endings:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDit kleine huis heeft een ___ raam.\nThis small house has a large window.",
        correctAnswer: "groot",
        acceptedAnswers: [],
        explanation:
          "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
        hint: "Use groot after een before the het-word raam.",
        id: "a1-adjective-endings:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe hebben een [klein] tuin.\nWe have a small garden.",
        correctAnswer: "We hebben een kleine tuin.",
        acceptedAnswers: [],
        explanation:
          "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-adjective-endings:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We have a small garden.",
        correctAnswer: "We hebben een kleine tuin.",
        acceptedAnswers: [],
        explanation:
          "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-adjective-endings:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "This small house has a large window.",
        correctAnswer: "Dit kleine huis heeft een groot raam.",
        acceptedAnswers: [],
        explanation:
          "Normally add -e before a noun; omit it for an indefinite singular het-word, as in een groot huis or koud water.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-adjective-endings:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-negation-geen": {
    source: {
      objective: "Negate indefinite noun phrases with geen.",
      rules: [
        "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
      ],
      examples: [
        {
          dutch: "Ik heb geen auto.",
          english: "I do not have a car.",
        },
        {
          dutch: "We drinken geen melk.",
          english: "We do not drink milk.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb ___ auto.\nI do not have a car.",
        correctAnswer: "geen",
        acceptedAnswers: [],
        explanation:
          "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
        hint: "",
        options: ["niet", "niets", "geen"],
        id: "a1-negation-geen:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe drinken ___ melk.\nWe do not drink milk.",
        correctAnswer: "geen",
        acceptedAnswers: [],
        explanation:
          "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
        hint: "Negate the indefinite noun melk.",
        id: "a1-negation-geen:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk heb [niet] auto.\nI do not have a car.",
        correctAnswer: "Ik heb geen auto.",
        acceptedAnswers: [],
        explanation:
          "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-negation-geen:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I do not have a car.",
        correctAnswer: "Ik heb geen auto.",
        acceptedAnswers: [],
        explanation:
          "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-negation-geen:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We do not drink milk.",
        correctAnswer: "We drinken geen melk.",
        acceptedAnswers: [],
        explanation:
          "Use geen before an indefinite noun phrase that would otherwise have een or no article.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-negation-geen:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-negation-niet": {
    source: {
      objective: "Place niet in short sentences and distinguish it from geen.",
      rules: [
        "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
      ],
      examples: [
        {
          dutch: "De winkel is niet open.",
          english: "The shop is not open.",
        },
        {
          dutch: "Ik ken die man niet.",
          english: "I do not know that man.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDe winkel is ___ open.\nThe shop is not open.",
        correctAnswer: "niet",
        acceptedAnswers: [],
        explanation:
          "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
        hint: "",
        options: ["niets", "niet", "geen"],
        id: "a1-negation-niet:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk ken die man ___.\nI do not know that man.",
        correctAnswer: "niet",
        acceptedAnswers: [],
        explanation:
          "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
        hint: "Negate knowing this definite person.",
        id: "a1-negation-niet:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: The shop is not open.",
        correctAnswer: "De winkel is niet open.",
        acceptedAnswers: [],
        explanation:
          "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
        hint: "Keep the lesson's wording. Begin with “De”.",
        chunks: ["is", "niet", "open.", "De", "winkel"],
        id: "a1-negation-niet:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "The shop is not open.",
        correctAnswer: "De winkel is niet open.",
        acceptedAnswers: [],
        explanation:
          "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-negation-niet:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I do not know that man.",
        correctAnswer: "Ik ken die man niet.",
        acceptedAnswers: [],
        explanation:
          "Use niet for actions, descriptions and definite references; place it before a denied adjective or location phrase and commonly after a definite direct object.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-negation-niet:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-object-pronouns": {
    source: {
      objective:
        "Replace a person or thing receiving an action with an object pronoun.",
      rules: [
        "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
      ],
      examples: [
        {
          dutch: "Mijn buurman helpt me.",
          english: "My neighbour helps me.",
        },
        {
          dutch: "Deze brief is voor jou.",
          english: "This letter is for you.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nMijn buurman helpt ___.\nMy neighbour helps me.",
        correctAnswer: "me",
        acceptedAnswers: [],
        explanation:
          "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
        hint: "",
        options: ["me", "ik", "mijn"],
        id: "a1-object-pronouns:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDeze brief is voor ___.\nThis letter is for you.",
        correctAnswer: "jou",
        acceptedAnswers: ["je"],
        explanation:
          "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
        hint: "Use the object form for you after voor.",
        id: "a1-object-pronouns:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nMijn buurman helpt [ik].\nMy neighbour helps me.",
        correctAnswer: "Mijn buurman helpt me.",
        acceptedAnswers: ["Mijn buurman helpt mij."],
        explanation:
          "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-object-pronouns:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "My neighbour helps me.",
        correctAnswer: "Mijn buurman helpt me.",
        acceptedAnswers: ["Mijn buurman helpt mij."],
        explanation:
          "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-object-pronouns:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "This letter is for you.",
        correctAnswer: "Deze brief is voor jou.",
        acceptedAnswers: [],
        explanation:
          "Use object forms such as mij, jou and ons as objects and after prepositions referring to people.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-object-pronouns:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-place-prepositions": {
    source: {
      objective:
        "Describe a simple location or destination with common prepositions.",
      rules: [
        "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
      ],
      examples: [
        {
          dutch: "De tas ligt onder de tafel.",
          english: "The bag is under the table.",
        },
        {
          dutch: "We gaan naar het station.",
          english: "We are going to the station.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDe tas ligt ___ de tafel.\nThe bag is under the table.",
        correctAnswer: "onder",
        acceptedAnswers: [],
        explanation:
          "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
        hint: "",
        options: ["naar", "tot", "onder"],
        id: "a1-place-prepositions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe gaan ___ het station.\nWe are going to the station.",
        correctAnswer: "naar",
        acceptedAnswers: [],
        explanation:
          "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
        hint: "Supply the destination preposition.",
        id: "a1-place-prepositions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDe tas ligt [naar] de tafel.\nThe bag is under the table.",
        correctAnswer: "De tas ligt onder de tafel.",
        acceptedAnswers: [],
        explanation:
          "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-place-prepositions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "The bag is under the table.",
        correctAnswer: "De tas ligt onder de tafel.",
        acceptedAnswers: [],
        explanation:
          "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-place-prepositions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We are going to the station.",
        correctAnswer: "We gaan naar het station.",
        acceptedAnswers: [],
        explanation:
          "Use a location preposition for where something is and naar for a destination; learn conventional phrases such as thuis and naar huis.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-place-prepositions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-time-prepositions": {
    source: {
      objective:
        "Introduce clock times, days and longer periods with suitable prepositions.",
      rules: [
        "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
      ],
      examples: [
        {
          dutch: "De les begint op dinsdag om half negen.",
          english: "The lesson starts on Tuesday at half past eight.",
        },
        {
          dutch: "Ik werk van negen tot vijf.",
          english: "I work from nine to five.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDe les begint ___ dinsdag om half negen.\nThe lesson starts on Tuesday at half past eight.",
        correctAnswer: "op",
        acceptedAnswers: [],
        explanation:
          "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
        hint: "",
        options: ["in", "op", "om"],
        id: "a1-time-prepositions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk werk van negen ___ vijf.\nI work from nine to five.",
        correctAnswer: "tot",
        acceptedAnswers: [],
        explanation:
          "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
        hint: "Complete van negen ... vijf.",
        id: "a1-time-prepositions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDe les begint [om] dinsdag om half negen.\nThe lesson starts on Tuesday at half past eight.",
        correctAnswer: "De les begint op dinsdag om half negen.",
        acceptedAnswers: [],
        explanation:
          "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-time-prepositions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "The lesson starts on Tuesday at half past eight.",
        correctAnswer: "De les begint op dinsdag om half negen.",
        acceptedAnswers: [],
        explanation:
          "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-time-prepositions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I work from nine to five.",
        correctAnswer: "Ik werk van negen tot vijf.",
        acceptedAnswers: [],
        explanation:
          "Use om with clock times, op with days and dates, and in with months, years and seasons; vandaag and morgen normally need no preposition.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-time-prepositions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-time-manner-place": {
    source: {
      objective:
        "Build a neutral sentence containing time, manner and place information.",
      rules: [
        "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
      ],
      examples: [
        {
          dutch: "Ik ga morgen met de trein naar Leiden.",
          english: "I am going to Leiden by train tomorrow.",
        },
        {
          dutch: "Morgen ga ik met de trein naar Leiden.",
          english: "Tomorrow I am going to Leiden by train.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ morgen met de trein naar Leiden.\nI am going to Leiden by train tomorrow.",
        correctAnswer: "ga",
        acceptedAnswers: [],
        explanation:
          "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
        hint: "",
        options: ["ga", "gaat", "gaan"],
        id: "a1-time-manner-place:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nMorgen ___ ik met de trein naar Leiden.\nTomorrow I am going to Leiden by train.",
        correctAnswer: "ga",
        acceptedAnswers: [],
        explanation:
          "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
        hint: "Use gaan with ik after morgen.",
        id: "a1-time-manner-place:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am going to Leiden by train tomorrow.",
        correctAnswer: "Ik ga morgen met de trein naar Leiden.",
        acceptedAnswers: [],
        explanation:
          "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["morgen", "met", "de", "trein", "naar", "Leiden.", "Ik", "ga"],
        id: "a1-time-manner-place:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am going to Leiden by train tomorrow.",
        correctAnswer: "Ik ga morgen met de trein naar Leiden.",
        acceptedAnswers: [],
        explanation:
          "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-time-manner-place:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Tomorrow I am going to Leiden by train.",
        correctAnswer: "Morgen ga ik met de trein naar Leiden.",
        acceptedAnswers: [],
        explanation:
          "A useful neutral pattern is subject + finite verb + time + manner + place; a fronted time phrase triggers inversion.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-time-manner-place:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-modals-ability-permission": {
    source: {
      objective:
        "Use kunnen and mogen with an infinitive to express ability and permission.",
      rules: [
        "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
      ],
      examples: [
        {
          dutch: "Ik kan goed zwemmen.",
          english: "I can swim well.",
        },
        {
          dutch: "Mag ik hier zitten?",
          english: "May I sit here?",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ goed zwemmen.\nI can swim well.",
        correctAnswer: "kan",
        acceptedAnswers: [],
        explanation:
          "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
        hint: "",
        options: ["kunt", "kunnen", "kan"],
        id: "a1-modals-ability-permission:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt: "Complete the sentence:\n___ ik hier zitten?\nMay I sit here?",
        correctAnswer: "Mag",
        acceptedAnswers: [],
        explanation:
          "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
        hint: "Use mogen to ask permission.",
        id: "a1-modals-ability-permission:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I can swim well.",
        correctAnswer: "Ik kan goed zwemmen.",
        acceptedAnswers: [],
        explanation:
          "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["goed", "zwemmen.", "Ik", "kan"],
        id: "a1-modals-ability-permission:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I can swim well.",
        correctAnswer: "Ik kan goed zwemmen.",
        acceptedAnswers: [],
        explanation:
          "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-modals-ability-permission:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "May I sit here?",
        correctAnswer: "Mag ik hier zitten?",
        acceptedAnswers: [],
        explanation:
          "Use finite kunnen or mogen plus an infinitive without te; the infinitive normally closes a simple main clause.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-modals-ability-permission:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-modals-obligation-wishes": {
    source: {
      objective: "Express an obligation or a wish with moeten and willen.",
      rules: [
        "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
      ],
      examples: [
        {
          dutch: "We moeten vandaag werken.",
          english: "We have to work today.",
        },
        {
          dutch: "Zij wil Nederlands leren.",
          english: "She wants to learn Dutch.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe ___ vandaag werken.\nWe have to work today.",
        correctAnswer: "moeten",
        acceptedAnswers: [],
        explanation:
          "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
        hint: "",
        options: ["moetens", "moeten", "moet"],
        id: "a1-modals-obligation-wishes:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZij ___ Nederlands leren.\nShe wants to learn Dutch.",
        correctAnswer: "wil",
        acceptedAnswers: [],
        explanation:
          "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
        hint: "Use willen with zij (she).",
        id: "a1-modals-obligation-wishes:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe [moet] vandaag werken.\nWe have to work today.",
        correctAnswer: "We moeten vandaag werken.",
        acceptedAnswers: ["Wij moeten vandaag werken."],
        explanation:
          "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-modals-obligation-wishes:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We have to work today.",
        correctAnswer: "We moeten vandaag werken.",
        acceptedAnswers: ["Wij moeten vandaag werken."],
        explanation:
          "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-modals-obligation-wishes:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She wants to learn Dutch.",
        correctAnswer: "Zij wil Nederlands leren.",
        acceptedAnswers: ["Ze wil Nederlands leren."],
        explanation:
          "Use finite moeten or willen with a final infinitive without te; hij/zij wil has no added -t.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-modals-obligation-wishes:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-separable-present": {
    source: {
      objective:
        "Separate the prefix of a common separable verb in a present-tense main clause.",
      rules: [
        "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
      ],
      examples: [
        {
          dutch: "Ik sta om zeven uur op.",
          english: "I get up at seven o'clock.",
        },
        {
          dutch: "We moeten vroeg opstaan.",
          english: "We have to get up early.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk sta om zeven uur ___.\nI get up at seven o'clock.",
        correctAnswer: "op",
        acceptedAnswers: [],
        explanation:
          "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
        hint: "",
        options: ["op", "opstaan", "opsta"],
        id: "a1-separable-present:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe moeten vroeg ___.\nWe have to get up early.",
        correctAnswer: "opstaan",
        acceptedAnswers: [],
        explanation:
          "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
        hint: "Use the infinitive of opstaan after moeten.",
        id: "a1-separable-present:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I get up at seven o'clock.",
        correctAnswer: "Ik sta om zeven uur op.",
        acceptedAnswers: [],
        explanation:
          "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["om", "zeven", "uur", "op.", "Ik", "sta"],
        id: "a1-separable-present:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I get up at seven o'clock.",
        correctAnswer: "Ik sta om zeven uur op.",
        acceptedAnswers: [],
        explanation:
          "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-separable-present:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We have to get up early.",
        correctAnswer: "We moeten vroeg opstaan.",
        acceptedAnswers: [],
        explanation:
          "Split a separable finite verb in a main clause, but keep its infinitive together after a modal.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-separable-present:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-imperative": {
    source: {
      objective: "Form a short instruction or request using the imperative.",
      rules: [
        "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
      ],
      examples: [
        {
          dutch: "Lees de tekst, alsjeblieft.",
          english: "Read the text, please.",
        },
        {
          dutch: "Doe de deur dicht.",
          english: "Close the door.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ de tekst, alsjeblieft.\nRead the text, please.",
        correctAnswer: "Lees",
        acceptedAnswers: [],
        explanation:
          "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
        hint: "",
        options: ["Leest", "Lezen", "Lees"],
        id: "a1-imperative:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt: "Complete the sentence:\n___ de deur dicht.\nClose the door.",
        correctAnswer: "Doe",
        acceptedAnswers: [],
        explanation:
          "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
        hint: "Write the imperative of doen.",
        id: "a1-imperative:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Leest] de tekst, alsjeblieft.\nRead the text, please.",
        correctAnswer: "Lees de tekst, alsjeblieft.",
        acceptedAnswers: [],
        explanation:
          "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-imperative:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Read the text, please.",
        correctAnswer: "Lees de tekst, alsjeblieft.",
        acceptedAnswers: [],
        explanation:
          "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-imperative:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Close the door.",
        correctAnswer: "Doe de deur dicht.",
        acceptedAnswers: [],
        explanation:
          "Use the stem without a subject for an ordinary imperative; use wees for zijn and split separable verbs.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-imperative:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-coordination": {
    source: {
      objective: "Join two main clauses with en, maar, of or want.",
      rules: [
        "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
      ],
      examples: [
        {
          dutch: "Ik blijf thuis, want ik ben moe.",
          english: "I am staying home because I am tired.",
        },
        {
          dutch: "Ik werk vandaag, maar morgen ben ik vrij.",
          english: "I am working today, but tomorrow I am off.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk blijf thuis, ___ ik ben moe.\nI am staying home because I am tired.",
        correctAnswer: "want",
        acceptedAnswers: [],
        explanation:
          "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
        hint: "",
        options: ["dat", "want", "omdat"],
        id: "a1-coordination:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk werk vandaag, ___ morgen ben ik vrij.\nI am working today, but tomorrow I am off.",
        correctAnswer: "maar",
        acceptedAnswers: [],
        explanation:
          "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
        hint: "Use the coordinating conjunction meaning but.",
        id: "a1-coordination:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am staying home because I am tired.",
        correctAnswer: "Ik blijf thuis, want ik ben moe.",
        acceptedAnswers: [],
        explanation:
          "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["thuis,", "want", "ik", "ben", "moe.", "Ik", "blijf"],
        id: "a1-coordination:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am staying home because I am tired.",
        correctAnswer: "Ik blijf thuis, want ik ben moe.",
        acceptedAnswers: [],
        explanation:
          "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-coordination:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I am working today, but tomorrow I am off.",
        correctAnswer: "Ik werk vandaag, maar morgen ben ik vrij.",
        acceptedAnswers: [],
        explanation:
          "En, maar, of and want join clauses without changing each clause's main-clause verb-second pattern.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-coordination:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-existential-er": {
    source: {
      objective:
        "Introduce the existence of a person or thing with er is or er zijn.",
      rules: [
        "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
      ],
      examples: [
        {
          dutch: "Er is een supermarkt in deze straat.",
          english: "There is a supermarket in this street.",
        },
        {
          dutch: "Zijn er vrije stoelen?",
          english: "Are there any available chairs?",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nEr ___ een supermarkt in deze straat.\nThere is a supermarket in this street.",
        correctAnswer: "is",
        acceptedAnswers: [],
        explanation:
          "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
        hint: "",
        options: ["is", "zijn", "ben"],
        id: "a1-existential-er:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZijn ___ vrije stoelen?\nAre there any available chairs?",
        correctAnswer: "er",
        acceptedAnswers: [],
        explanation:
          "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
        hint: "Supply the word that introduces the presence of chairs.",
        id: "a1-existential-er:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nEr [zijn] een supermarkt in deze straat.\nThere is a supermarket in this street.",
        correctAnswer: "Er is een supermarkt in deze straat.",
        acceptedAnswers: [],
        explanation:
          "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-existential-er:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "There is a supermarket in this street.",
        correctAnswer: "Er is een supermarkt in deze straat.",
        acceptedAnswers: [],
        explanation:
          "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-existential-er:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Are there any available chairs?",
        correctAnswer: "Zijn er vrije stoelen?",
        acceptedAnswers: [],
        explanation:
          "Use er is with a singular thing and er zijn with plural things when introducing their presence.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-existential-er:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-perfect-introduction": {
    source: {
      objective:
        "Recognise and build a simple perfect-tense sentence with an auxiliary and a participle.",
      rules: [
        "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
      ],
      examples: [
        {
          dutch: "Ik heb gisteren gewerkt.",
          english: "I worked yesterday.",
        },
        {
          dutch: "Heb je vandaag gewerkt?",
          english: "Have you worked today?",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb gisteren ___.\nI worked yesterday.",
        correctAnswer: "gewerkt",
        acceptedAnswers: [],
        explanation:
          "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
        hint: "",
        options: ["werken", "gewerk", "gewerkt"],
        id: "a1-perfect-introduction:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nHeb je vandaag ___?\nHave you worked today?",
        correctAnswer: "gewerkt",
        acceptedAnswers: [],
        explanation:
          "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
        hint: "Supply the participle of werken.",
        id: "a1-perfect-introduction:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I worked yesterday.",
        correctAnswer: "Ik heb gisteren gewerkt.",
        acceptedAnswers: [],
        explanation:
          "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["gisteren", "gewerkt.", "Ik", "heb"],
        id: "a1-perfect-introduction:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I worked yesterday.",
        correctAnswer: "Ik heb gisteren gewerkt.",
        acceptedAnswers: [],
        explanation:
          "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-introduction:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Have you worked today?",
        correctAnswer: "Heb je vandaag gewerkt?",
        acceptedAnswers: [],
        explanation:
          "Form the perfect with finite hebben or zijn plus a past participle; put the participle near the end of a simple main clause.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-introduction:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-perfect-regular": {
    source: {
      objective: "Form regular past participles with ge- and -t or -d.",
      rules: [
        "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
      ],
      examples: [
        {
          dutch: "We hebben in Utrecht gewoond.",
          english: "We lived in Utrecht.",
        },
        {
          dutch: "Ik heb gisteren gekookt.",
          english: "I cooked yesterday.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe hebben in Utrecht ___.\nWe lived in Utrecht.",
        correctAnswer: "gewoond",
        acceptedAnswers: [],
        explanation:
          "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
        hint: "",
        options: ["gewoon", "gewoond", "gewoont"],
        id: "a1-perfect-regular:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk heb gisteren ___.\nI cooked yesterday.",
        correctAnswer: "gekookt",
        acceptedAnswers: [],
        explanation:
          "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
        hint: "Supply the participle of koken.",
        id: "a1-perfect-regular:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe hebben in Utrecht [gewoont].\nWe lived in Utrecht.",
        correctAnswer: "We hebben in Utrecht gewoond.",
        acceptedAnswers: [],
        explanation:
          "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-perfect-regular:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We lived in Utrecht.",
        correctAnswer: "We hebben in Utrecht gewoond.",
        acceptedAnswers: [],
        explanation:
          "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-regular:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I cooked yesterday.",
        correctAnswer: "Ik heb gisteren gekookt.",
        acceptedAnswers: [],
        explanation:
          "For an ordinary regular verb, use ge- + correctly spelled stem + t/d; choose t/d before the standalone stem's v-to-f or z-to-s change.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-regular:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-perfect-common-irregulars": {
    source: {
      objective:
        "Use frequent irregular participles with their basic auxiliary choices.",
      rules: [
        "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
      ],
      examples: [
        {
          dutch: "We hebben samen gegeten.",
          english: "We ate together.",
        },
        {
          dutch: "Zij is naar huis gegaan.",
          english: "She went home.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe hebben samen ___.\nWe ate together.",
        correctAnswer: "gegeten",
        acceptedAnswers: [],
        explanation:
          "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
        hint: "",
        options: ["gegeten", "geëet", "gegeten heb"],
        id: "a1-perfect-common-irregulars:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt: "Complete the sentence:\nZij is naar huis ___.\nShe went home.",
        correctAnswer: "gegaan",
        acceptedAnswers: [],
        explanation:
          "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
        hint: "Supply the participle of gaan.",
        id: "a1-perfect-common-irregulars:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe hebben samen [geëet].\nWe ate together.",
        correctAnswer: "We hebben samen gegeten.",
        acceptedAnswers: [],
        explanation:
          "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-perfect-common-irregulars:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We ate together.",
        correctAnswer: "We hebben samen gegeten.",
        acceptedAnswers: [],
        explanation:
          "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-common-irregulars:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She went home.",
        correctAnswer: "Zij is naar huis gegaan.",
        acceptedAnswers: [],
        explanation:
          "Memorise common irregular participles with their auxiliary: heb gegeten, heb gezien, ben gegaan and ben geweest.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-common-irregulars:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a1-perfect-separable": {
    source: {
      objective:
        "Form a perfect-tense sentence with a familiar separable verb.",
      rules: [
        "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
      ],
      examples: [
        {
          dutch: "Ik ben om zeven uur opgestaan.",
          english: "I got up at seven o'clock.",
        },
        {
          dutch: "We hebben de keuken schoongemaakt.",
          english: "We cleaned the kitchen.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ben om zeven uur ___.\nI got up at seven o'clock.",
        correctAnswer: "opgestaan",
        acceptedAnswers: [],
        explanation:
          "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
        hint: "",
        options: ["geopstaan", "opgestaand", "opgestaan"],
        id: "a1-perfect-separable:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe hebben de keuken ___.\nWe cleaned the kitchen.",
        correctAnswer: "schoongemaakt",
        acceptedAnswers: [],
        explanation:
          "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
        hint: "Supply the participle of schoonmaken.",
        id: "a1-perfect-separable:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk ben om zeven uur [geopstaan].\nI got up at seven o'clock.",
        correctAnswer: "Ik ben om zeven uur opgestaan.",
        acceptedAnswers: [],
        explanation:
          "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a1-perfect-separable:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I got up at seven o'clock.",
        correctAnswer: "Ik ben om zeven uur opgestaan.",
        acceptedAnswers: [],
        explanation:
          "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-separable:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We cleaned the kitchen.",
        correctAnswer: "We hebben de keuken schoongemaakt.",
        acceptedAnswers: [],
        explanation:
          "For common separable verbs, insert ge after the separable prefix and write the complete participle as one word.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a1-perfect-separable:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-main-clause-order": {
    source: {
      objective:
        "Place known objects and frequency adverbs inside a longer main clause.",
      rules: [
        "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
      ],
      examples: [
        {
          dutch: "Ik heb het boek gisteren gelezen.",
          english: "I read the book yesterday.",
        },
        {
          dutch: "Morgen wil ik een nieuwe fiets kopen.",
          english: "Tomorrow I want to buy a new bicycle.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb het boek gisteren ___.\nI read the book yesterday.",
        correctAnswer: "gelezen",
        acceptedAnswers: [],
        explanation:
          "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
        hint: "",
        options: ["geleest", "gelezen", "lezen"],
        id: "a2-main-clause-order:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nMorgen wil ik een nieuwe fiets ___.\nTomorrow I want to buy a new bicycle.",
        correctAnswer: "kopen",
        acceptedAnswers: [],
        explanation:
          "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
        hint: "Use kopen after wil.",
        id: "a2-main-clause-order:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I read the book yesterday.",
        correctAnswer: "Ik heb het boek gisteren gelezen.",
        acceptedAnswers: [],
        explanation:
          "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["het", "boek", "gisteren", "gelezen.", "Ik", "heb"],
        id: "a2-main-clause-order:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I read the book yesterday.",
        correctAnswer: "Ik heb het boek gisteren gelezen.",
        acceptedAnswers: [],
        explanation:
          "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-main-clause-order:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Tomorrow I want to buy a new bicycle.",
        correctAnswer: "Morgen wil ik een nieuwe fiets kopen.",
        acceptedAnswers: [],
        explanation:
          "Keep finite and non-finite verb positions stable; place unstressed or already-known objects early and fit adverbs inside the bracket.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-main-clause-order:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-object-pronoun-order": {
    source: {
      objective:
        "Place unstressed objects and distinguish practical ze from formal hen and hun.",
      rules: [
        "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
      ],
      examples: [
        {
          dutch: "Ik geef het hem morgen.",
          english: "I will give it to him tomorrow.",
        },
        {
          dutch: "Ik heb ze gisteren gezien.",
          english: "I saw them yesterday.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk geef het ___ morgen.\nI will give it to him tomorrow.",
        correctAnswer: "hem",
        acceptedAnswers: [],
        explanation:
          "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
        hint: "",
        options: ["hem", "hij", "zijn"],
        id: "a2-object-pronoun-order:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk heb ___ gisteren gezien.\nI saw them yesterday.",
        correctAnswer: "ze",
        acceptedAnswers: [],
        explanation:
          "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
        hint: "Use ze for the plural direct object them.",
        id: "a2-object-pronoun-order:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I will give it to him tomorrow.",
        correctAnswer: "Ik geef het hem morgen.",
        acceptedAnswers: [],
        explanation:
          "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["het", "hem", "morgen.", "Ik", "geef"],
        id: "a2-object-pronoun-order:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I will give it to him tomorrow.",
        correctAnswer: "Ik geef het hem morgen.",
        acceptedAnswers: [],
        explanation:
          "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-object-pronoun-order:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I saw them yesterday.",
        correctAnswer: "Ik heb ze gisteren gezien.",
        acceptedAnswers: [],
        explanation:
          "Place unstressed pronouns early; formal hen is a direct or prepositional object, while hun is an indirect object without a preposition.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-object-pronoun-order:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-reflexive-verbs": {
    source: {
      objective:
        "Choose the reflexive pronoun that matches the subject of an everyday verb.",
      rules: [
        "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
      ],
      examples: [
        {
          dutch: "Ik voel me vandaag goed.",
          english: "I feel well today.",
        },
        {
          dutch: "Jullie vergissen je.",
          english: "You are mistaken.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk voel ___ vandaag goed.\nI feel well today.",
        correctAnswer: "me",
        acceptedAnswers: [],
        explanation:
          "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
        hint: "",
        options: ["ik", "mijn", "me"],
        id: "a2-reflexive-verbs:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nJullie vergissen ___.\nYou are mistaken.",
        correctAnswer: "je",
        acceptedAnswers: [],
        explanation:
          "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
        hint: "Use the reflexive pronoun that agrees with jullie.",
        id: "a2-reflexive-verbs:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk voel [ik] vandaag goed.\nI feel well today.",
        correctAnswer: "Ik voel me vandaag goed.",
        acceptedAnswers: ["Ik voel mij vandaag goed."],
        explanation:
          "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-reflexive-verbs:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I feel well today.",
        correctAnswer: "Ik voel me vandaag goed.",
        acceptedAnswers: ["Ik voel mij vandaag goed."],
        explanation:
          "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-reflexive-verbs:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "You are mistaken.",
        correctAnswer: "Jullie vergissen je.",
        acceptedAnswers: [],
        explanation:
          "Match the reflexive pronoun to the subject; use zich for third-person singular and plural, and normally je with jullie.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-reflexive-verbs:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-possessive-extensions": {
    source: {
      objective:
        "Express ownership with van plus a pronoun and with a person's name.",
      rules: [
        "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
      ],
      examples: [
        {
          dutch: "Deze jas is van mij.",
          english: "This coat is mine.",
        },
        {
          dutch: "Dat is Anna's fiets.",
          english: "That is Anna's bicycle.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDeze jas is van ___.\nThis coat is mine.",
        correctAnswer: "mij",
        acceptedAnswers: [],
        explanation:
          "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
        hint: "",
        options: ["mijn", "mij", "ik"],
        id: "a2-possessive-extensions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDat is ___ fiets.\nThat is Anna's bicycle.",
        correctAnswer: "Anna's",
        acceptedAnswers: [],
        explanation:
          "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
        hint: "Write the possessive of Anna.",
        id: "a2-possessive-extensions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDeze jas is van [ik].\nThis coat is mine.",
        correctAnswer: "Deze jas is van mij.",
        acceptedAnswers: [],
        explanation:
          "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-possessive-extensions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "This coat is mine.",
        correctAnswer: "Deze jas is van mij.",
        acceptedAnswers: [],
        explanation:
          "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-possessive-extensions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "That is Anna's bicycle.",
        correctAnswer: "Dat is Anna's fiets.",
        acceptedAnswers: [],
        explanation:
          "Use van + object pronoun after zijn for ownership; name possessives follow Dutch spelling rules, as in Piets fiets and Anna's boek.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-possessive-extensions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-demonstrative-extensions": {
    source: {
      objective:
        "Use standalone die/dat and distinguish them from identification with dit zijn.",
      rules: [
        "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
      ],
      examples: [
        {
          dutch: "Welke jas bedoel je? Die is van mij.",
          english: "Which coat do you mean? That one is mine.",
        },
        {
          dutch: "Dit zijn mijn buren.",
          english: "These are my neighbours.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWelke jas bedoel je? ___ is van mij.\nWhich coat do you mean? That one is mine.",
        correctAnswer: "Die",
        acceptedAnswers: [],
        explanation:
          "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
        hint: "",
        options: ["Die", "Dit", "Dat"],
        id: "a2-demonstrative-extensions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ zijn mijn buren.\nThese are my neighbours.",
        correctAnswer: "Dit",
        acceptedAnswers: [],
        explanation:
          "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
        hint: "Use dit when introducing these people.",
        id: "a2-demonstrative-extensions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWelke jas bedoel je? [Dit] is van mij.\nWhich coat do you mean? That one is mine.",
        correctAnswer: "Welke jas bedoel je? Die is van mij.",
        acceptedAnswers: [],
        explanation:
          "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-demonstrative-extensions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Which coat do you mean? That one is mine.",
        correctAnswer: "Welke jas bedoel je? Die is van mij.",
        acceptedAnswers: [],
        explanation:
          "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-demonstrative-extensions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "These are my neighbours.",
        correctAnswer: "Dit zijn mijn buren.",
        acceptedAnswers: [],
        explanation:
          "Standalone reference normally follows the noun's de/het and number; identifying dit/dat zijn can introduce a plural noun phrase.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-demonstrative-extensions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-adjective-extensions": {
    source: {
      objective:
        "Apply adjective spelling changes and recognise common exceptions to the basic -e pattern.",
      rules: [
        "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
      ],
      examples: [
        {
          dutch: "We hebben een houten tafel.",
          english: "We have a wooden table.",
        },
        {
          dutch: "De grote kamer heeft witte muren.",
          english: "The large room has white walls.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe hebben een ___ tafel.\nWe have a wooden table.",
        correctAnswer: "houten",
        acceptedAnswers: [],
        explanation:
          "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
        hint: "",
        options: ["houtene", "houte", "houten"],
        id: "a2-adjective-extensions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDe grote kamer heeft ___ muren.\nThe large room has white walls.",
        correctAnswer: "witte",
        acceptedAnswers: [],
        explanation:
          "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
        hint: "Use wit before the plural noun muren.",
        id: "a2-adjective-extensions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe hebben een [houtene] tafel.\nWe have a wooden table.",
        correctAnswer: "We hebben een houten tafel.",
        acceptedAnswers: [],
        explanation:
          "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-adjective-extensions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We have a wooden table.",
        correctAnswer: "We hebben een houten tafel.",
        acceptedAnswers: [],
        explanation:
          "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-adjective-extensions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The large room has white walls.",
        correctAnswer: "De grote kamer heeft witte muren.",
        acceptedAnswers: [],
        explanation:
          "Preserve pronunciation when adding -e; material adjectives ending in -en stay unchanged, and fixed role expressions must be learned individually.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-adjective-extensions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-quantities": {
    source: {
      objective:
        "Choose quantity words with singular, plural and uncountable nouns.",
      rules: [
        "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
      ],
      examples: [
        {
          dutch: "Elke leerling heeft genoeg tijd.",
          english: "Every student has enough time.",
        },
        {
          dutch: "Sommige winkels zijn op zondag open.",
          english: "Some shops are open on Sundays.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ leerling heeft genoeg tijd.\nEvery student has enough time.",
        correctAnswer: "Elke",
        acceptedAnswers: [],
        explanation:
          "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
        hint: "",
        options: ["Elken", "Elke", "Elk"],
        id: "a2-quantities:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ winkels zijn op zondag open.\nSome shops are open on Sundays.",
        correctAnswer: "Sommige",
        acceptedAnswers: [],
        explanation:
          "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
        hint: "Write some before a plural noun.",
        id: "a2-quantities:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Elk] leerling heeft genoeg tijd.\nEvery student has enough time.",
        correctAnswer: "Elke leerling heeft genoeg tijd.",
        acceptedAnswers: [],
        explanation:
          "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-quantities:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Every student has enough time.",
        correctAnswer: "Elke leerling heeft genoeg tijd.",
        acceptedAnswers: [],
        explanation:
          "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-quantities:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Some shops are open on Sundays.",
        correctAnswer: "Sommige winkels zijn op zondag open.",
        acceptedAnswers: [],
        explanation:
          "Use plural agreement with alle/sommige plus plural nouns; use singular agreement with elk/ieder and choose -e according to de or het.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-quantities:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-niet-scope": {
    source: {
      objective:
        "Use niet to deny a whole action or contrast one part of a longer sentence.",
      rules: [
        "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
      ],
      examples: [
        {
          dutch: "Ik heb hem gisteren niet gezien.",
          english: "I did not see him yesterday.",
        },
        {
          dutch: "Ik kom niet vandaag, maar morgen.",
          english: "I am coming tomorrow, not today.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb hem gisteren ___ gezien.\nI did not see him yesterday.",
        correctAnswer: "niet",
        acceptedAnswers: [],
        explanation:
          "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
        hint: "",
        options: ["niet", "geen", "niets"],
        id: "a2-niet-scope:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk kom ___ vandaag, maar morgen.\nI am coming tomorrow, not today.",
        correctAnswer: "niet",
        acceptedAnswers: [],
        explanation:
          "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
        hint: "Put the negation before the time being corrected.",
        id: "a2-niet-scope:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I did not see him yesterday.",
        correctAnswer: "Ik heb hem gisteren niet gezien.",
        acceptedAnswers: [],
        explanation:
          "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["hem", "gisteren", "niet", "gezien.", "Ik", "heb"],
        id: "a2-niet-scope:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I did not see him yesterday.",
        correctAnswer: "Ik heb hem gisteren niet gezien.",
        acceptedAnswers: [],
        explanation:
          "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-niet-scope:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I am coming tomorrow, not today.",
        correctAnswer: "Ik kom niet vandaag, maar morgen.",
        acceptedAnswers: [],
        explanation:
          "Neutral niet commonly follows definite objects and precedes final verbs; contrastive niet stands before the element being corrected.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-niet-scope:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-negative-words": {
    source: {
      objective:
        "Negate people, things, places and frequency with a single suitable negative word.",
      rules: [
        "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
      ],
      examples: [
        {
          dutch: "Niemand is thuis.",
          english: "Nobody is at home.",
        },
        {
          dutch: "Ik werk nooit op zondag.",
          english: "I never work on Sundays.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt: "Choose the missing form:\n___ is thuis.\nNobody is at home.",
        correctAnswer: "Niemand",
        acceptedAnswers: [],
        explanation:
          "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
        hint: "",
        options: ["Geen", "Niet", "Niemand"],
        id: "a2-negative-words:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk werk ___ op zondag.\nI never work on Sundays.",
        correctAnswer: "nooit",
        acceptedAnswers: [],
        explanation:
          "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
        hint: "Write the negative time word never.",
        id: "a2-negative-words:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\n[Geen] is thuis.\nNobody is at home.",
        correctAnswer: "Niemand is thuis.",
        acceptedAnswers: [],
        explanation:
          "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-negative-words:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Nobody is at home.",
        correctAnswer: "Niemand is thuis.",
        acceptedAnswers: [],
        explanation:
          "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-negative-words:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I never work on Sundays.",
        correctAnswer: "Ik werk nooit op zondag.",
        acceptedAnswers: [],
        explanation:
          "Niemand, niets, nergens and nooit already express negation; do not add niet for the same ordinary negative meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-negative-words:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-not-yet-no-longer": {
    source: {
      objective:
        "Distinguish something that has not happened yet from something that has stopped being true.",
      rules: [
        "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
      ],
      examples: [
        {
          dutch: "Ik heb nog niet gegeten.",
          english: "I have not eaten yet.",
        },
        {
          dutch: "Zij woont hier niet meer.",
          english: "She does not live here anymore.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb ___ gegeten.\nI have not eaten yet.",
        correctAnswer: "nog niet",
        acceptedAnswers: [],
        explanation:
          "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
        hint: "",
        options: ["niet nog", "nog niet", "niet meer"],
        id: "a2-not-yet-no-longer:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZij woont hier ___.\nShe does not live here anymore.",
        correctAnswer: "niet meer",
        acceptedAnswers: [],
        explanation:
          "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
        hint: "Write no longer.",
        id: "a2-not-yet-no-longer:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk heb [niet meer] gegeten.\nI have not eaten yet.",
        correctAnswer: "Ik heb nog niet gegeten.",
        acceptedAnswers: [],
        explanation:
          "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-not-yet-no-longer:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I have not eaten yet.",
        correctAnswer: "Ik heb nog niet gegeten.",
        acceptedAnswers: [],
        explanation:
          "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-not-yet-no-longer:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She does not live here anymore.",
        correctAnswer: "Zij woont hier niet meer.",
        acceptedAnswers: [],
        explanation:
          "Use nog niet/nog geen for not yet and niet meer/geen ... meer for a situation that is no longer true.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-not-yet-no-longer:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-omdat": {
    source: {
      objective:
        "Give a reason with omdat and put a single finite verb at the end of its clause.",
      rules: [
        "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
      ],
      examples: [
        {
          dutch: "Ik blijf thuis omdat ik ziek ben.",
          english: "I am staying home because I am ill.",
        },
        {
          dutch: "We nemen de bus omdat het regent.",
          english: "We are taking the bus because it is raining.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk blijf thuis ___ ik ziek ben.\nI am staying home because I am ill.",
        correctAnswer: "omdat",
        acceptedAnswers: [],
        explanation:
          "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
        hint: "",
        options: ["omdat", "want", "maar"],
        id: "a2-omdat:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe nemen de bus ___ het regent.\nWe are taking the bus because it is raining.",
        correctAnswer: "omdat",
        acceptedAnswers: [],
        explanation:
          "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
        hint: "Use the subordinating conjunction because.",
        id: "a2-omdat:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am staying home because I am ill.",
        correctAnswer: "Ik blijf thuis omdat ik ziek ben.",
        acceptedAnswers: [],
        explanation:
          "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["thuis", "omdat", "ik", "ziek", "ben.", "Ik", "blijf"],
        id: "a2-omdat:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am staying home because I am ill.",
        correctAnswer: "Ik blijf thuis omdat ik ziek ben.",
        acceptedAnswers: [],
        explanation:
          "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-omdat:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We are taking the bus because it is raining.",
        correctAnswer: "We nemen de bus omdat het regent.",
        acceptedAnswers: [],
        explanation:
          "After omdat, a clause with one verb places its finite verb at the end; after want, keep main-clause verb-second order.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-omdat:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-dat-clauses": {
    source: {
      objective:
        "Report a thought, belief or piece of knowledge with a dat clause.",
      rules: [
        "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
      ],
      examples: [
        {
          dutch: "Ik denk dat de winkel open is.",
          english: "I think that the shop is open.",
        },
        {
          dutch: "Zij zegt dat haar broer in Delft woont.",
          english: "She says that her brother lives in Delft.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk denk dat de winkel open ___.\nI think that the shop is open.",
        correctAnswer: "is",
        acceptedAnswers: [],
        explanation:
          "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
        hint: "",
        options: ["zijn", "ben", "is"],
        id: "a2-dat-clauses:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZij zegt dat haar broer in Delft ___.\nShe says that her brother lives in Delft.",
        correctAnswer: "woont",
        acceptedAnswers: [],
        explanation:
          "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
        hint: "Use wonen with haar broer in the subordinate clause.",
        id: "a2-dat-clauses:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I think that the shop is open.",
        correctAnswer: "Ik denk dat de winkel open is.",
        acceptedAnswers: [],
        explanation:
          "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["dat", "de", "winkel", "open", "is.", "Ik", "denk"],
        id: "a2-dat-clauses:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I think that the shop is open.",
        correctAnswer: "Ik denk dat de winkel open is.",
        acceptedAnswers: [],
        explanation:
          "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-dat-clauses:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She says that her brother lives in Delft.",
        correctAnswer: "Zij zegt dat haar broer in Delft woont.",
        acceptedAnswers: [],
        explanation:
          "Use dat to introduce the content after denken, weten or zeggen, and put the subordinate clause's single finite verb last.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-dat-clauses:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-als-wanneer": {
    source: {
      objective:
        "Use als or wanneer for conditions and repeated or future times.",
      rules: [
        "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
      ],
      examples: [
        {
          dutch: "We gaan wandelen als het droog is.",
          english: "We will go for a walk if it is dry.",
        },
        {
          dutch: "Ik bel je wanneer ik thuis ben.",
          english: "I will call you when I am home.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe gaan wandelen ___ het droog is.\nWe will go for a walk if it is dry.",
        correctAnswer: "als",
        acceptedAnswers: [],
        explanation:
          "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
        hint: "",
        options: ["maar", "als", "want"],
        id: "a2-als-wanneer:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk bel je ___ ik thuis ben.\nI will call you when I am home.",
        correctAnswer: "wanneer",
        acceptedAnswers: [],
        explanation:
          "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
        hint: "Use wanneer for the time connection.",
        id: "a2-als-wanneer:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: We will go for a walk if it is dry.",
        correctAnswer: "We gaan wandelen als het droog is.",
        acceptedAnswers: [],
        explanation:
          "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
        hint: "Keep the lesson's wording. Begin with “We”.",
        chunks: ["wandelen", "als", "het", "droog", "is.", "We", "gaan"],
        id: "a2-als-wanneer:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We will go for a walk if it is dry.",
        correctAnswer: "We gaan wandelen als het droog is.",
        acceptedAnswers: [],
        explanation:
          "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-als-wanneer:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I will call you when I am home.",
        correctAnswer: "Ik bel je wanneer ik thuis ben.",
        acceptedAnswers: [],
        explanation:
          "Use als for a condition or repeated/future time and wanneer for a time connection, with subordinate verb-final order.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-als-wanneer:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-fronted-subclauses": {
    source: {
      objective:
        "Start with a subordinate clause and invert the following main clause correctly.",
      rules: [
        "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
      ],
      examples: [
        {
          dutch: "Omdat ik ziek ben, blijf ik thuis.",
          english: "Because I am ill, I am staying home.",
        },
        {
          dutch: "Als het regent, nemen we de bus.",
          english: "If it rains, we will take the bus.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nOmdat ik ziek ben, ___ ik thuis.\nBecause I am ill, I am staying home.",
        correctAnswer: "blijf",
        acceptedAnswers: [],
        explanation:
          "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
        hint: "",
        options: ["blijf", "blijft", "blijven"],
        id: "a2-fronted-subclauses:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nAls het regent, ___ we de bus.\nIf it rains, we will take the bus.",
        correctAnswer: "nemen",
        acceptedAnswers: [],
        explanation:
          "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
        hint: "Use nemen with we after the opening clause.",
        id: "a2-fronted-subclauses:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Because I am ill, I am staying home.",
        correctAnswer: "Omdat ik ziek ben, blijf ik thuis.",
        acceptedAnswers: [],
        explanation:
          "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
        hint: "Keep the lesson's wording. Begin with “Omdat”.",
        chunks: ["ziek", "ben,", "blijf", "ik", "thuis.", "Omdat", "ik"],
        id: "a2-fronted-subclauses:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Because I am ill, I am staying home.",
        correctAnswer: "Omdat ik ziek ben, blijf ik thuis.",
        acceptedAnswers: [],
        explanation:
          "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-fronted-subclauses:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "If it rains, we will take the bus.",
        correctAnswer: "Als het regent, nemen we de bus.",
        acceptedAnswers: [],
        explanation:
          "An opening subordinate clause fills position one; follow it with the main finite verb and then the main subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-fronted-subclauses:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-terwijl-voordat": {
    source: {
      objective:
        "Link simultaneous actions with terwijl and an earlier action with voordat.",
      rules: [
        "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
      ],
      examples: [
        {
          dutch: "Ik kook terwijl jij de tafel dekt.",
          english: "I cook while you set the table.",
        },
        {
          dutch: "Voordat ik eet, was ik mijn handen.",
          english: "Before I eat, I wash my hands.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk kook ___ jij de tafel dekt.\nI cook while you set the table.",
        correctAnswer: "terwijl",
        acceptedAnswers: [],
        explanation:
          "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
        hint: "",
        options: ["want", "maar", "terwijl"],
        id: "a2-terwijl-voordat:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ ik eet, was ik mijn handen.\nBefore I eat, I wash my hands.",
        correctAnswer: "Voordat",
        acceptedAnswers: [],
        explanation:
          "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
        hint: "Write before at the start of the subordinate clause.",
        id: "a2-terwijl-voordat:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I cook while you set the table.",
        correctAnswer: "Ik kook terwijl jij de tafel dekt.",
        acceptedAnswers: [],
        explanation:
          "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["terwijl", "jij", "de", "tafel", "dekt.", "Ik", "kook"],
        id: "a2-terwijl-voordat:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I cook while you set the table.",
        correctAnswer: "Ik kook terwijl jij de tafel dekt.",
        acceptedAnswers: [],
        explanation:
          "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-terwijl-voordat:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Before I eat, I wash my hands.",
        correctAnswer: "Voordat ik eet, was ik mijn handen.",
        acceptedAnswers: [],
        explanation:
          "Use terwijl for simultaneous actions and voordat for before; both take subordinate order and trigger inversion when their clause comes first.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-terwijl-voordat:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-perfect-auxiliaries": {
    source: {
      objective:
        "Choose hebben or zijn for common activity, directed-motion and change-of-state meanings.",
      rules: [
        "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
      ],
      examples: [
        {
          dutch: "Ik heb een uur gefietst.",
          english: "I cycled for an hour.",
        },
        {
          dutch: "Ik ben naar huis gefietst.",
          english: "I cycled home.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ een uur gefietst.\nI cycled for an hour.",
        correctAnswer: "heb",
        acceptedAnswers: [],
        explanation:
          "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
        hint: "",
        options: ["bent", "heb", "ben"],
        id: "a2-perfect-auxiliaries:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk ___ naar huis gefietst.\nI cycled home.",
        correctAnswer: "ben",
        acceptedAnswers: [],
        explanation:
          "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
        hint: "Choose the auxiliary for movement toward home.",
        id: "a2-perfect-auxiliaries:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk [ben] een uur gefietst.\nI cycled for an hour.",
        correctAnswer: "Ik heb een uur gefietst.",
        acceptedAnswers: [],
        explanation:
          "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-perfect-auxiliaries:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I cycled for an hour.",
        correctAnswer: "Ik heb een uur gefietst.",
        acceptedAnswers: [],
        explanation:
          "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-perfect-auxiliaries:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I cycled home.",
        correctAnswer: "Ik ben naar huis gefietst.",
        acceptedAnswers: [],
        explanation:
          "Use hebben for many activities and zijn for many directed movements or changes of state; learn the auxiliary for the verb's particular meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-perfect-auxiliaries:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-participle-prefixes": {
    source: {
      objective:
        "Recognise inseparable prefixes and distinguish them from ordinary verbs ending in -eren.",
      rules: [
        "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
      ],
      examples: [
        {
          dutch: "Hij heeft in België gestudeerd.",
          english: "He studied in Belgium.",
        },
        {
          dutch: "We hebben de rekening betaald.",
          english: "We paid the bill.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nHij heeft in België ___.\nHe studied in Belgium.",
        correctAnswer: "gestudeerd",
        acceptedAnswers: [],
        explanation:
          "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
        hint: "",
        options: ["gestudeerd", "studeerd", "gestudeert"],
        id: "a2-participle-prefixes:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe hebben de rekening ___.\nWe paid the bill.",
        correctAnswer: "betaald",
        acceptedAnswers: [],
        explanation:
          "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
        hint: "Supply the participle of betalen.",
        id: "a2-participle-prefixes:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nHij heeft in België [studeerd].\nHe studied in Belgium.",
        correctAnswer: "Hij heeft in België gestudeerd.",
        acceptedAnswers: [],
        explanation:
          "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-participle-prefixes:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "He studied in Belgium.",
        correctAnswer: "Hij heeft in België gestudeerd.",
        acceptedAnswers: [],
        explanation:
          "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-participle-prefixes:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We paid the bill.",
        correctAnswer: "We hebben de rekening betaald.",
        acceptedAnswers: [],
        explanation:
          "Common unstressed inseparable prefixes block an extra ge-; ordinary -eren verbs such as studeren still form participles with ge-.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-participle-prefixes:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-perfect-subclauses": {
    source: {
      objective:
        "Place a perfect-tense auxiliary and participle together at the end of a subordinate clause.",
      rules: [
        "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
      ],
      examples: [
        {
          dutch: "Ik ben moe omdat ik hard heb gewerkt.",
          english: "I am tired because I have worked hard.",
        },
        {
          dutch: "Ik weet dat zij de rekening betaald heeft.",
          english: "I know that she has paid the bill.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ben moe omdat ik hard ___ gewerkt.\nI am tired because I have worked hard.",
        correctAnswer: "heb",
        acceptedAnswers: [],
        explanation:
          "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
        hint: "",
        options: ["hebt", "heeft", "heb"],
        id: "a2-perfect-subclauses:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk weet dat zij de rekening betaald ___.\nI know that she has paid the bill.",
        correctAnswer: "heeft",
        acceptedAnswers: [],
        explanation:
          "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
        hint: "Use hebben with zij (she).",
        id: "a2-perfect-subclauses:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am tired because I have worked hard.",
        correctAnswer: "Ik ben moe omdat ik hard heb gewerkt.",
        acceptedAnswers: ["Ik ben moe omdat ik hard gewerkt heb."],
        explanation:
          "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: ["moe", "omdat", "ik", "hard", "heb", "gewerkt.", "Ik", "ben"],
        id: "a2-perfect-subclauses:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am tired because I have worked hard.",
        correctAnswer: "Ik ben moe omdat ik hard heb gewerkt.",
        acceptedAnswers: ["Ik ben moe omdat ik hard gewerkt heb."],
        explanation:
          "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-perfect-subclauses:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I know that she has paid the bill.",
        correctAnswer: "Ik weet dat zij de rekening betaald heeft.",
        acceptedAnswers: [
          "Ik weet dat zij de rekening heeft betaald.",
          "Ik weet dat ze de rekening betaald heeft.",
          "Ik weet dat ze de rekening heeft betaald.",
        ],
        explanation:
          "In a simple perfect subordinate clause, put auxiliary and participle at the end; both heb gewerkt and gewerkt heb are standard orders.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-perfect-subclauses:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-past-zijn-hebben": {
    source: {
      objective:
        "Describe past states and possession with was, waren, had and hadden.",
      rules: [
        "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
      ],
      examples: [
        {
          dutch: "Gisteren was ik ziek.",
          english: "I was ill yesterday.",
        },
        {
          dutch: "We hadden weinig tijd.",
          english: "We had little time.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nGisteren ___ ik ziek.\nI was ill yesterday.",
        correctAnswer: "was",
        acceptedAnswers: [],
        explanation:
          "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
        hint: "",
        options: ["wast", "was", "waren"],
        id: "a2-past-zijn-hebben:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe ___ weinig tijd.\nWe had little time.",
        correctAnswer: "hadden",
        acceptedAnswers: [],
        explanation:
          "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
        hint: "Use the simple past of hebben with we.",
        id: "a2-past-zijn-hebben:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nGisteren [waren] ik ziek.\nI was ill yesterday.",
        correctAnswer: "Gisteren was ik ziek.",
        acceptedAnswers: [],
        explanation:
          "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-past-zijn-hebben:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I was ill yesterday.",
        correctAnswer: "Gisteren was ik ziek.",
        acceptedAnswers: [],
        explanation:
          "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-zijn-hebben:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We had little time.",
        correctAnswer: "We hadden weinig tijd.",
        acceptedAnswers: [],
        explanation:
          "Use singular was/had and plural waren/hadden for simple past states or possession, following the usual finite-verb positions.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-zijn-hebben:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-past-regular": {
    source: {
      objective:
        "Form regular simple-past verbs with -te/-de and plural -ten/-den.",
      rules: [
        "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
      ],
      examples: [
        {
          dutch: "Ik wachtte op de bus.",
          english: "I waited for the bus.",
        },
        {
          dutch: "Vroeger woonden we in Delft.",
          english: "We used to live in Delft.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ___ op de bus.\nI waited for the bus.",
        correctAnswer: "wachtte",
        acceptedAnswers: [],
        explanation:
          "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
        hint: "",
        options: ["wachtte", "wachte", "wachtde"],
        id: "a2-past-regular:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nVroeger ___ we in Delft.\nWe used to live in Delft.",
        correctAnswer: "woonden",
        acceptedAnswers: [],
        explanation:
          "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
        hint: "Use the plural simple past of wonen.",
        id: "a2-past-regular:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk [wachte] op de bus.\nI waited for the bus.",
        correctAnswer: "Ik wachtte op de bus.",
        acceptedAnswers: [],
        explanation:
          "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-past-regular:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I waited for the bus.",
        correctAnswer: "Ik wachtte op de bus.",
        acceptedAnswers: [],
        explanation:
          "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-regular:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We used to live in Delft.",
        correctAnswer: "Vroeger woonden we in Delft.",
        acceptedAnswers: [],
        explanation:
          "Regular simple past uses stem + te/de in the singular and ten/den in the plural, retaining doubled t or d where the full ending requires it.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-regular:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-past-irregular": {
    source: {
      objective:
        "Use frequent irregular past verbs and past modals in short everyday sentences.",
      rules: [
        "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
      ],
      examples: [
        {
          dutch: "We gingen gisteren naar de markt.",
          english: "We went to the market yesterday.",
        },
        {
          dutch: "Ik kon vannacht niet slapen.",
          english: "I could not sleep last night.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWe ___ gisteren naar de markt.\nWe went to the market yesterday.",
        correctAnswer: "gingen",
        acceptedAnswers: [],
        explanation:
          "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
        hint: "",
        options: ["ging", "gaanden", "gingen"],
        id: "a2-past-irregular:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk ___ vannacht niet slapen.\nI could not sleep last night.",
        correctAnswer: "kon",
        acceptedAnswers: [],
        explanation:
          "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
        hint: "Use the singular simple past of kunnen.",
        id: "a2-past-irregular:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nWe [ging] gisteren naar de markt.\nWe went to the market yesterday.",
        correctAnswer: "We gingen gisteren naar de markt.",
        acceptedAnswers: [],
        explanation:
          "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-past-irregular:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "We went to the market yesterday.",
        correctAnswer: "We gingen gisteren naar de markt.",
        acceptedAnswers: [],
        explanation:
          "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-irregular:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I could not sleep last night.",
        correctAnswer: "Ik kon vannacht niet slapen.",
        acceptedAnswers: [],
        explanation:
          "Memorise irregular singular/plural past pairs; a past modal such as kon or moest still takes an infinitive without te.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-irregular:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-past-choices": {
    source: {
      objective:
        "Choose a useful past form for an event report or a background description.",
      rules: [
        "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
      ],
      examples: [
        {
          dutch: "Ik heb een jas gekocht, want mijn oude jas was kapot.",
          english: "I bought a coat because my old coat was damaged.",
        },
        {
          dutch: "Toen ik jong was, woonde ik in een dorp.",
          english: "When I was young, I lived in a village.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk heb een jas gekocht, want mijn oude jas ___ kapot.\nI bought a coat because my old coat was damaged.",
        correctAnswer: "was",
        acceptedAnswers: [],
        explanation:
          "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
        hint: "",
        options: ["wast", "was", "waren"],
        id: "a2-past-choices:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nToen ik jong was, ___ ik in een dorp.\nWhen I was young, I lived in a village.",
        correctAnswer: "woonde",
        acceptedAnswers: [],
        explanation:
          "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
        hint: "Use the singular simple past of wonen.",
        id: "a2-past-choices:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt:
          "Arrange the words: I bought a coat because my old coat was damaged.",
        correctAnswer: "Ik heb een jas gekocht, want mijn oude jas was kapot.",
        acceptedAnswers: [],
        explanation:
          "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: [
          "een",
          "jas",
          "gekocht,",
          "want",
          "mijn",
          "oude",
          "jas",
          "was",
          "kapot.",
          "Ik",
          "heb",
        ],
        id: "a2-past-choices:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I bought a coat because my old coat was damaged.",
        correctAnswer: "Ik heb een jas gekocht, want mijn oude jas was kapot.",
        acceptedAnswers: [],
        explanation:
          "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-choices:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "When I was young, I lived in a village.",
        correctAnswer: "Toen ik jong was, woonde ik in een dorp.",
        acceptedAnswers: [],
        explanation:
          "Use the perfect as a practical default for reporting an event and the simple past for many states or narrative backgrounds, while recognising substantial overlap.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-past-choices:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-nadat": {
    source: {
      objective:
        "Use nadat with a completed first action before a present or future main action.",
      rules: [
        "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
      ],
      examples: [
        {
          dutch: "Nadat ik heb gegeten, ga ik wandelen.",
          english: "After I have eaten, I will go for a walk.",
        },
        {
          dutch: "We drinken koffie nadat we de keuken hebben schoongemaakt.",
          english: "We will drink coffee after we have cleaned the kitchen.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ ik heb gegeten, ga ik wandelen.\nAfter I have eaten, I will go for a walk.",
        correctAnswer: "Nadat",
        acceptedAnswers: [],
        explanation:
          "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
        hint: "",
        options: ["Nadat", "Want", "Maar"],
        id: "a2-nadat:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe drinken koffie nadat we de keuken ___ schoongemaakt.\nWe will drink coffee after we have cleaned the kitchen.",
        correctAnswer: "hebben",
        acceptedAnswers: [],
        explanation:
          "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
        hint: "Use hebben with we in the perfect clause.",
        id: "a2-nadat:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: After I have eaten, I will go for a walk.",
        correctAnswer: "Nadat ik heb gegeten, ga ik wandelen.",
        acceptedAnswers: [],
        explanation:
          "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
        hint: "Keep the lesson's wording. Begin with “Nadat”.",
        chunks: ["heb", "gegeten,", "ga", "ik", "wandelen.", "Nadat", "ik"],
        id: "a2-nadat:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "After I have eaten, I will go for a walk.",
        correctAnswer: "Nadat ik heb gegeten, ga ik wandelen.",
        acceptedAnswers: [],
        explanation:
          "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-nadat:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We will drink coffee after we have cleaned the kitchen.",
        correctAnswer:
          "We drinken koffie nadat we de keuken hebben schoongemaakt.",
        acceptedAnswers: [],
        explanation:
          "For a present/future sequence, nadat + a perfect clause presents a completed first action before the main action.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-nadat:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-future-plans": {
    source: {
      objective:
        "Describe a future arrangement with the present or gaan plus an infinitive.",
      rules: [
        "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
      ],
      examples: [
        {
          dutch: "Morgen werk ik thuis.",
          english: "I am working from home tomorrow.",
        },
        {
          dutch: "We gaan vanavond pasta maken.",
          english: "We are going to make pasta this evening.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nMorgen ___ ik thuis.\nI am working from home tomorrow.",
        correctAnswer: "werk",
        acceptedAnswers: [],
        explanation:
          "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
        hint: "",
        options: ["werkt", "werken", "werk"],
        id: "a2-future-plans:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe gaan vanavond pasta ___.\nWe are going to make pasta this evening.",
        correctAnswer: "maken",
        acceptedAnswers: [],
        explanation:
          "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
        hint: "Use maken after gaan.",
        id: "a2-future-plans:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am working from home tomorrow.",
        correctAnswer: "Morgen werk ik thuis.",
        acceptedAnswers: [],
        explanation:
          "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
        hint: "Keep the lesson's wording. Begin with “Morgen”.",
        chunks: ["ik", "thuis.", "Morgen", "werk"],
        id: "a2-future-plans:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am working from home tomorrow.",
        correctAnswer: "Morgen werk ik thuis.",
        acceptedAnswers: [],
        explanation:
          "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-future-plans:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We are going to make pasta this evening.",
        correctAnswer: "We gaan vanavond pasta maken.",
        acceptedAnswers: [],
        explanation:
          "Use the present plus future time for arrangements, or finite gaan + an infinitive without te for a plan or upcoming action.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-future-plans:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-future-zullen": {
    source: {
      objective: "Use zullen for a simple offer, suggestion or prediction.",
      rules: [
        "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
      ],
      examples: [
        {
          dutch: "Zal ik de deur openen?",
          english: "Shall I open the door?",
        },
        {
          dutch: "Het zal morgen regenen.",
          english: "It will probably rain tomorrow.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ ik de deur openen?\nShall I open the door?",
        correctAnswer: "Zal",
        acceptedAnswers: [],
        explanation:
          "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
        hint: "",
        options: ["Zalt", "Zal", "Zullen"],
        id: "a2-future-zullen:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nHet zal morgen ___.\nIt will probably rain tomorrow.",
        correctAnswer: "regenen",
        acceptedAnswers: [],
        explanation:
          "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
        hint: "Use regenen after zal.",
        id: "a2-future-zullen:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Shall I open the door?",
        correctAnswer: "Zal ik de deur openen?",
        acceptedAnswers: [],
        explanation:
          "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
        hint: "Keep the lesson's wording. Begin with “Zal”.",
        chunks: ["de", "deur", "openen?", "Zal", "ik"],
        id: "a2-future-zullen:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Shall I open the door?",
        correctAnswer: "Zal ik de deur openen?",
        acceptedAnswers: [],
        explanation:
          "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-future-zullen:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "It will probably rain tomorrow.",
        correctAnswer: "Het zal morgen regenen.",
        acceptedAnswers: [],
        explanation:
          "Use zullen + an infinitive without te for offers, shared suggestions and predictions; zal ik and zullen we are useful question patterns.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-future-zullen:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-zou": {
    source: {
      objective:
        "Use zou or zouden for a polite request or a simple imagined situation.",
      rules: [
        "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
      ],
      examples: [
        {
          dutch: "Zou u mij helpen, alstublieft?",
          english: "Would you help me, please?",
        },
        {
          dutch: "Als ik meer tijd had, zou ik vaker koken.",
          english: "If I had more time, I would cook more often.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\n___ u mij helpen, alstublieft?\nWould you help me, please?",
        correctAnswer: "Zou",
        acceptedAnswers: [],
        explanation:
          "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
        hint: "",
        options: ["Zou", "Zouden", "Zout"],
        id: "a2-zou:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nAls ik meer tijd had, ___ ik vaker koken.\nIf I had more time, I would cook more often.",
        correctAnswer: "zou",
        acceptedAnswers: [],
        explanation:
          "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
        hint: "Use zou with ik in the main clause.",
        id: "a2-zou:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Would you help me, please?",
        correctAnswer: "Zou u mij helpen, alstublieft?",
        acceptedAnswers: [],
        explanation:
          "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
        hint: "Keep the lesson's wording. Begin with “Zou”.",
        chunks: ["mij", "helpen,", "alstublieft?", "Zou", "u"],
        id: "a2-zou:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Would you help me, please?",
        correctAnswer: "Zou u mij helpen, alstublieft?",
        acceptedAnswers: [],
        explanation:
          "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-zou:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "If I had more time, I would cook more often.",
        correctAnswer: "Als ik meer tijd had, zou ik vaker koken.",
        acceptedAnswers: [],
        explanation:
          "Use singular zou or plural zouden with an infinitive for polite requests and simple would meanings; a fronted condition still triggers inversion.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-zou:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-te-infinitives": {
    source: {
      objective:
        "Use te with common infinitive-taking verbs, including hoeven in negative sentences.",
      rules: [
        "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
      ],
      examples: [
        {
          dutch: "Ik probeer elke dag te lezen.",
          english: "I try to read every day.",
        },
        {
          dutch: "Je hoeft morgen niet te werken.",
          english: "You do not have to work tomorrow.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk probeer elke dag ___ lezen.\nI try to read every day.",
        correctAnswer: "te",
        acceptedAnswers: [],
        explanation:
          "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
        hint: "",
        options: ["om", "aan", "te"],
        id: "a2-te-infinitives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nJe hoeft morgen niet ___ werken.\nYou do not have to work tomorrow.",
        correctAnswer: "te",
        acceptedAnswers: [],
        explanation:
          "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
        hint: "Supply the infinitive marker after hoeven.",
        id: "a2-te-infinitives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk probeer elke dag [om] lezen.\nI try to read every day.",
        correctAnswer: "Ik probeer elke dag te lezen.",
        acceptedAnswers: [],
        explanation:
          "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-te-infinitives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I try to read every day.",
        correctAnswer: "Ik probeer elke dag te lezen.",
        acceptedAnswers: [],
        explanation:
          "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-te-infinitives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "You do not have to work tomorrow.",
        correctAnswer: "Je hoeft morgen niet te werken.",
        acceptedAnswers: [],
        explanation:
          "Learn which first verb requires te: proberen and beginnen do; common modals such as moeten do not; hoeven normally uses te with a negative or restrictive meaning.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-te-infinitives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-om-te": {
    source: {
      objective:
        "Explain the purpose of an action with om ... te and an infinitive.",
      rules: [
        "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
      ],
      examples: [
        {
          dutch: "Ik ga naar de winkel om brood te kopen.",
          english: "I am going to the shop to buy bread.",
        },
        {
          dutch: "We nemen de trein om tijd te besparen.",
          english: "We are taking the train to save time.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk ga naar de winkel ___ brood te kopen.\nI am going to the shop to buy bread.",
        correctAnswer: "om",
        acceptedAnswers: [],
        explanation:
          "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
        hint: "",
        options: ["voor", "om", "want"],
        id: "a2-om-te:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nWe nemen de trein om tijd ___ besparen.\nWe are taking the train to save time.",
        correctAnswer: "te",
        acceptedAnswers: [],
        explanation:
          "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
        hint: "Supply the infinitive marker in the purpose clause.",
        id: "a2-om-te:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: I am going to the shop to buy bread.",
        correctAnswer: "Ik ga naar de winkel om brood te kopen.",
        acceptedAnswers: [],
        explanation:
          "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: [
          "naar",
          "de",
          "winkel",
          "om",
          "brood",
          "te",
          "kopen.",
          "Ik",
          "ga",
        ],
        id: "a2-om-te:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am going to the shop to buy bread.",
        correctAnswer: "Ik ga naar de winkel om brood te kopen.",
        acceptedAnswers: [],
        explanation:
          "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-om-te:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "We are taking the train to save time.",
        correctAnswer: "We nemen de trein om tijd te besparen.",
        acceptedAnswers: [],
        explanation:
          "For a purpose with an understood actor, use om + other information + te + infinitive, without adding a finite verb or a separate subject.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-om-te:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-separable-clause-forms": {
    source: {
      objective:
        "Choose the joined or split form of a separable verb across three familiar clause patterns.",
      rules: [
        "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
      ],
      examples: [
        {
          dutch: "Ik weet dat de trein om acht uur aankomt.",
          english: "I know that the train arrives at eight o'clock.",
        },
        {
          dutch: "Ik probeer mijn moeder op te bellen.",
          english: "I am trying to phone my mother.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk weet dat de trein om acht uur ___.\nI know that the train arrives at eight o'clock.",
        correctAnswer: "aankomt",
        acceptedAnswers: [],
        explanation:
          "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
        hint: "",
        options: ["aankomt", "komt aan", "aankomen"],
        id: "a2-separable-clause-forms:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk probeer mijn moeder ___.\nI am trying to phone my mother.",
        correctAnswer: "op te bellen",
        acceptedAnswers: [],
        explanation:
          "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
        hint: "Place te inside the separable verb opbellen.",
        id: "a2-separable-clause-forms:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt:
          "Arrange the words: I know that the train arrives at eight o'clock.",
        correctAnswer: "Ik weet dat de trein om acht uur aankomt.",
        acceptedAnswers: [],
        explanation:
          "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
        hint: "Keep the lesson's wording. Begin with “Ik”.",
        chunks: [
          "dat",
          "de",
          "trein",
          "om",
          "acht",
          "uur",
          "aankomt.",
          "Ik",
          "weet",
        ],
        id: "a2-separable-clause-forms:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I know that the train arrives at eight o'clock.",
        correctAnswer: "Ik weet dat de trein om acht uur aankomt.",
        acceptedAnswers: [],
        explanation:
          "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-separable-clause-forms:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I am trying to phone my mother.",
        correctAnswer: "Ik probeer mijn moeder op te bellen.",
        acceptedAnswers: [],
        explanation:
          "Split the finite verb in a main clause, join it at the end of a simple subordinate clause, and place te between prefix and infinitive base.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-separable-clause-forms:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-progressive": {
    source: {
      objective:
        "Describe an activity in progress with aan het or a common posture-verb construction.",
      rules: [
        "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
      ],
      examples: [
        {
          dutch: "Ik ben aan het koken.",
          english: "I am cooking.",
        },
        {
          dutch: "Zij zit een boek te lezen.",
          english: "She is sitting reading a book.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt: "Choose the missing form:\nIk ben ___ koken.\nI am cooking.",
        correctAnswer: "aan het",
        acceptedAnswers: [],
        explanation:
          "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
        hint: "",
        options: ["te", "om te", "aan het"],
        id: "a2-progressive:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZij zit een boek ___ lezen.\nShe is sitting reading a book.",
        correctAnswer: "te",
        acceptedAnswers: [],
        explanation:
          "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
        hint: "Supply the infinitive marker after zit.",
        id: "a2-progressive:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk ben [te] koken.\nI am cooking.",
        correctAnswer: "Ik ben aan het koken.",
        acceptedAnswers: [],
        explanation:
          "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-progressive:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am cooking.",
        correctAnswer: "Ik ben aan het koken.",
        acceptedAnswers: [],
        explanation:
          "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-progressive:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She is sitting reading a book.",
        correctAnswer: "Zij zit een boek te lezen.",
        acceptedAnswers: [],
        explanation:
          "Use zijn + aan het + infinitive for an activity in progress, or a suitable posture verb + te + infinitive.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-progressive:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-comparatives": {
    source: {
      objective:
        "Compare two things using -er, common irregular forms and dan or even ... als.",
      rules: [
        "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
      ],
      examples: [
        {
          dutch: "Deze fiets is goedkoper dan die fiets.",
          english: "This bicycle is cheaper than that bicycle.",
        },
        {
          dutch: "Mijn kamer is even groot als jouw kamer.",
          english: "My room is as big as your room.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDeze fiets is goedkoper ___ die fiets.\nThis bicycle is cheaper than that bicycle.",
        correctAnswer: "dan",
        acceptedAnswers: [],
        explanation:
          "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
        hint: "",
        options: ["dat", "dan", "als"],
        id: "a2-comparatives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nMijn kamer is even groot ___ jouw kamer.\nMy room is as big as your room.",
        correctAnswer: "als",
        acceptedAnswers: [],
        explanation:
          "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
        hint: "Complete the equality pattern even groot ... .",
        id: "a2-comparatives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDeze fiets is goedkoper [als] die fiets.\nThis bicycle is cheaper than that bicycle.",
        correctAnswer: "Deze fiets is goedkoper dan die fiets.",
        acceptedAnswers: [],
        explanation:
          "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-comparatives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "This bicycle is cheaper than that bicycle.",
        correctAnswer: "Deze fiets is goedkoper dan die fiets.",
        acceptedAnswers: [],
        explanation:
          "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-comparatives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "My room is as big as your room.",
        correctAnswer: "Mijn kamer is even groot als jouw kamer.",
        acceptedAnswers: [],
        explanation:
          "Use a comparative such as groter or beter with dan; use even + the base adjective + als for equality.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-comparatives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-superlatives": {
    source: {
      objective:
        "Identify the highest degree using -st/-ste and common irregular superlatives.",
      rules: [
        "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
      ],
      examples: [
        {
          dutch: "Dit is de goedkoopste fiets in de winkel.",
          english: "This is the cheapest bicycle in the shop.",
        },
        {
          dutch: "Van deze drie kamers is deze het grootst.",
          english: "Of these three rooms, this one is the biggest.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDit is de ___ fiets in de winkel.\nThis is the cheapest bicycle in the shop.",
        correctAnswer: "goedkoopste",
        acceptedAnswers: [],
        explanation:
          "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
        hint: "",
        options: ["goedkoopste", "goedkoopst", "goedkoper"],
        id: "a2-superlatives:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nVan deze drie kamers is deze het ___.\nOf these three rooms, this one is the biggest.",
        correctAnswer: "grootst",
        acceptedAnswers: [],
        explanation:
          "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
        hint: "Use groot after het in a predicate superlative.",
        id: "a2-superlatives:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nDit is de [goedkoopst] fiets in de winkel.\nThis is the cheapest bicycle in the shop.",
        correctAnswer: "Dit is de goedkoopste fiets in de winkel.",
        acceptedAnswers: [],
        explanation:
          "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-superlatives:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "This is the cheapest bicycle in the shop.",
        correctAnswer: "Dit is de goedkoopste fiets in de winkel.",
        acceptedAnswers: [],
        explanation:
          "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-superlatives:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "Of these three rooms, this one is the biggest.",
        correctAnswer: "Van deze drie kamers is deze het grootst.",
        acceptedAnswers: [],
        explanation:
          "Use -ste before a noun, as in het grootste huis, and commonly het + -st after a verb, as in dit huis is het grootst.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-superlatives:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-relative-die-dat": {
    source: {
      objective:
        "Identify a noun using a short relative clause with die or dat.",
      rules: [
        "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
      ],
      examples: [
        {
          dutch: "De vrouw die hier woont, is mijn buurvrouw.",
          english: "The woman who lives here is my neighbour.",
        },
        {
          dutch: "Het boek dat ik lees, is interessant.",
          english: "The book that I am reading is interesting.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nDe vrouw ___ hier woont, is mijn buurvrouw.\nThe woman who lives here is my neighbour.",
        correctAnswer: "die",
        acceptedAnswers: [],
        explanation:
          "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
        hint: "",
        options: ["dat", "dit", "die"],
        id: "a2-relative-die-dat:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nHet boek ___ ik lees, is interessant.\nThe book that I am reading is interesting.",
        correctAnswer: "dat",
        acceptedAnswers: [],
        explanation:
          "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
        hint: "Choose the relative pronoun for the singular het-word boek.",
        id: "a2-relative-die-dat:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: The woman who lives here is my neighbour.",
        correctAnswer: "De vrouw die hier woont, is mijn buurvrouw.",
        acceptedAnswers: [],
        explanation:
          "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
        hint: "Keep the lesson's wording. Begin with “De”.",
        chunks: [
          "die",
          "hier",
          "woont,",
          "is",
          "mijn",
          "buurvrouw.",
          "De",
          "vrouw",
        ],
        id: "a2-relative-die-dat:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "The woman who lives here is my neighbour.",
        correctAnswer: "De vrouw die hier woont, is mijn buurvrouw.",
        acceptedAnswers: [],
        explanation:
          "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-relative-die-dat:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The book that I am reading is interesting.",
        correctAnswer: "Het boek dat ik lees, is interessant.",
        acceptedAnswers: [],
        explanation:
          "Relative die refers to de-words and plurals; relative dat refers to singular het-words, with the clause's finite verb at the end.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-relative-die-dat:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-indirect-questions": {
    source: {
      objective:
        "Embed a yes/no or question-word question using subordinate order.",
      rules: [
        "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
      ],
      examples: [
        {
          dutch: "Weet u waar het station is?",
          english: "Do you know where the station is?",
        },
        {
          dutch: "Ik weet niet of de winkel open is.",
          english: "I do not know whether the shop is open.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nWeet u ___ het station is?\nDo you know where the station is?",
        correctAnswer: "waar",
        acceptedAnswers: [],
        explanation:
          "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
        hint: "",
        options: ["wat", "waar", "of"],
        id: "a2-indirect-questions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk weet niet ___ de winkel open is.\nI do not know whether the shop is open.",
        correctAnswer: "of",
        acceptedAnswers: [],
        explanation:
          "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
        hint: "Use whether for an indirect yes/no question.",
        id: "a2-indirect-questions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt: "Arrange the words: Do you know where the station is?",
        correctAnswer: "Weet u waar het station is?",
        acceptedAnswers: [],
        explanation:
          "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
        hint: "Keep the lesson's wording. Begin with “Weet”.",
        chunks: ["waar", "het", "station", "is?", "Weet", "u"],
        id: "a2-indirect-questions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Do you know where the station is?",
        correctAnswer: "Weet u waar het station is?",
        acceptedAnswers: [],
        explanation:
          "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-indirect-questions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I do not know whether the shop is open.",
        correctAnswer: "Ik weet niet of de winkel open is.",
        acceptedAnswers: [],
        explanation:
          "Keep the question word, or use of for whether, then apply subordinate word order inside the embedded question.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-indirect-questions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-fixed-prepositions": {
    source: {
      objective:
        "Use a small set of common verbs with their conventional prepositions.",
      rules: [
        "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
      ],
      examples: [
        {
          dutch: "Ik wacht op de bus.",
          english: "I am waiting for the bus.",
        },
        {
          dutch: "Zij luistert naar haar docent.",
          english: "She is listening to her teacher.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk wacht ___ de bus.\nI am waiting for the bus.",
        correctAnswer: "op",
        acceptedAnswers: [],
        explanation:
          "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
        hint: "",
        options: ["op", "naar", "voor"],
        id: "a2-fixed-prepositions:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nZij luistert ___ haar docent.\nShe is listening to her teacher.",
        correctAnswer: "naar",
        acceptedAnswers: [],
        explanation:
          "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
        hint: "Supply the preposition belonging with luisteren.",
        id: "a2-fixed-prepositions:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk wacht [naar] de bus.\nI am waiting for the bus.",
        correctAnswer: "Ik wacht op de bus.",
        acceptedAnswers: [],
        explanation:
          "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-fixed-prepositions:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I am waiting for the bus.",
        correctAnswer: "Ik wacht op de bus.",
        acceptedAnswers: [],
        explanation:
          "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-fixed-prepositions:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "She is listening to her teacher.",
        correctAnswer: "Zij luistert naar haar docent.",
        acceptedAnswers: [],
        explanation:
          "Learn a verb's fixed preposition with its meaning and retain that preposition before a noun or person object pronoun.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-fixed-prepositions:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-er-place": {
    source: {
      objective: "Refer back to a known place with unstressed er.",
      rules: [
        "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
      ],
      examples: [
        {
          dutch: "Ken je Delft? Ik woon er.",
          english: "Do you know Delft? I live there.",
        },
        {
          dutch: "Dat is onze school. Ik werk er op maandag.",
          english: "That is our school. I work there on Mondays.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nKen je Delft? Ik woon ___.\nDo you know Delft? I live there.",
        correctAnswer: "er",
        acceptedAnswers: [],
        explanation:
          "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
        hint: "",
        options: ["het", "hem", "er"],
        id: "a2-er-place:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDat is onze school. Ik w___k er op maandag.\nThat is our school. I work there on Mondays.",
        correctAnswer: "er",
        acceptedAnswers: [],
        explanation:
          "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
        hint: "Refer back to the known place with er.",
        id: "a2-er-place:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nKen je Delft? Ik woon [het].\nDo you know Delft? I live there.",
        correctAnswer: "Ken je Delft? Ik woon er.",
        acceptedAnswers: [],
        explanation:
          "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-er-place:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "Do you know Delft? I live there.",
        correctAnswer: "Ken je Delft? Ik woon er.",
        acceptedAnswers: [],
        explanation:
          "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-er-place:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "That is our school. I work there on Mondays.",
        correctAnswer: "Dat is onze school. Ik werk er op maandag.",
        acceptedAnswers: [],
        explanation:
          "Use unstressed locative er to refer back to a known place, and daar when pointing to or contrasting a place more strongly.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-er-place:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-er-quantity": {
    source: {
      objective:
        "Use er with a number instead of repeating an understood counted noun.",
      rules: [
        "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
      ],
      examples: [
        {
          dutch: "Hoeveel fietsen heb je? Ik heb er twee.",
          english: "How many bicycles do you have? I have two.",
        },
        {
          dutch: "Deze appels zijn lekker. Ik wil er drie kopen.",
          english: "These apples are tasty. I want to buy three.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nHoeveel fietsen heb je? Ik heb ___ twee.\nHow many bicycles do you have? I have two.",
        correctAnswer: "er",
        acceptedAnswers: [],
        explanation:
          "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
        hint: "",
        options: ["ze", "er", "het"],
        id: "a2-er-quantity:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nDeze appels zijn lekk___. Ik wil er drie kopen.\nThese apples are tasty. I want to buy three.",
        correctAnswer: "er",
        acceptedAnswers: [],
        explanation:
          "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
        hint: "Supply the word used with a number when the counted noun is omitted.",
        id: "a2-er-quantity:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nHoeveel fietsen heb je? Ik heb [het] twee.\nHow many bicycles do you have? I have two.",
        correctAnswer: "Hoeveel fietsen heb je? Ik heb er twee.",
        acceptedAnswers: [],
        explanation:
          "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-er-quantity:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "How many bicycles do you have? I have two.",
        correctAnswer: "Hoeveel fietsen heb je? Ik heb er twee.",
        acceptedAnswers: [],
        explanation:
          "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-er-quantity:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "These apples are tasty. I want to buy three.",
        correctAnswer: "Deze appels zijn lekker. Ik wil er drie kopen.",
        acceptedAnswers: [],
        explanation:
          "When omitting a known counted noun, use er with its number or geen: ik heb er twee; ik heb er geen.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-er-quantity:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-duration": {
    source: {
      objective:
        "Distinguish an ongoing duration, a starting point, a past interval and a future interval.",
      rules: [
        "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
      ],
      examples: [
        {
          dutch: "Ik woon hier al twee jaar.",
          english: "I have lived here for two years.",
        },
        {
          dutch: "Over twee weken begint de cursus.",
          english: "The course starts in two weeks.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk woon hier ___ twee jaar.\nI have lived here for two years.",
        correctAnswer: "al",
        acceptedAnswers: [],
        explanation:
          "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
        hint: "",
        options: ["al", "over", "geleden"],
        id: "a2-duration:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\n___ twee weken begint de cursus.\nThe course starts in two weeks.",
        correctAnswer: "Over",
        acceptedAnswers: [],
        explanation:
          "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
        hint: "Write in before a future interval.",
        id: "a2-duration:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk woon hier [over] twee jaar.\nI have lived here for two years.",
        correctAnswer: "Ik woon hier al twee jaar.",
        acceptedAnswers: [],
        explanation:
          "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-duration:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I have lived here for two years.",
        correctAnswer: "Ik woon hier al twee jaar.",
        acceptedAnswers: [],
        explanation:
          "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-duration:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "The course starts in two weeks.",
        correctAnswer: "Over twee weken begint de cursus.",
        acceptedAnswers: [],
        explanation:
          "Use the present with al + duration or sinds + starting point for an ongoing situation; use amount + geleden for ago and over + amount for a future interval.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-duration:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-linking-adverbs": {
    source: {
      objective:
        "Connect ideas with daarom or toch while preserving main-clause inversion.",
      rules: [
        "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
      ],
      examples: [
        {
          dutch: "Het regent. Daarom neem ik de bus.",
          english: "It is raining. That is why I am taking the bus.",
        },
        {
          dutch: "Ik ben moe. Toch ga ik naar de les.",
          english: "I am tired. Nevertheless, I am going to the lesson.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nHet regent. ___ neem ik de bus.\nIt is raining. That is why I am taking the bus.",
        correctAnswer: "Daarom",
        acceptedAnswers: [],
        explanation:
          "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
        hint: "",
        options: ["Omdat", "Want", "Daarom"],
        id: "a2-linking-adverbs:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nIk ben moe. ___ ga ik naar de les.\nI am tired. Nevertheless, I am going to the lesson.",
        correctAnswer: "Toch",
        acceptedAnswers: [],
        explanation:
          "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
        hint: "Write nevertheless as the opening linking adverb.",
        id: "a2-linking-adverbs:practice:2",
        sortOrder: 2,
      },
      {
        kind: "ordering",
        prompt:
          "Arrange the words: It is raining. That is why I am taking the bus.",
        correctAnswer: "Het regent. Daarom neem ik de bus.",
        acceptedAnswers: [],
        explanation:
          "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
        hint: "Keep the lesson's wording. Begin with “Het”.",
        chunks: ["Daarom", "neem", "ik", "de", "bus.", "Het", "regent."],
        id: "a2-linking-adverbs:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "It is raining. That is why I am taking the bus.",
        correctAnswer: "Het regent. Daarom neem ik de bus.",
        acceptedAnswers: [],
        explanation:
          "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-linking-adverbs:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "I am tired. Nevertheless, I am going to the lesson.",
        correctAnswer: "Ik ben moe. Toch ga ik naar de les.",
        acceptedAnswers: [],
        explanation:
          "Opening daarom or toch fills the first position and requires main-clause inversion; coordinating maar does not fill that position.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-linking-adverbs:practice:5",
        sortOrder: 5,
      },
    ],
  },
  "a2-something-adjective": {
    source: {
      objective:
        "Describe something or nothing using iets/niets/wat followed by an adjective with -s.",
      rules: [
        "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
      ],
      examples: [
        {
          dutch: "Ik wil iets leuks doen.",
          english: "I want to do something fun.",
        },
        {
          dutch: "Er is niets nieuws.",
          english: "There is nothing new.",
        },
      ],
    },
    exercises: [
      {
        kind: "multiple-choice",
        prompt:
          "Choose the missing form:\nIk wil iets ___ doen.\nI want to do something fun.",
        correctAnswer: "leuks",
        acceptedAnswers: [],
        explanation:
          "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
        hint: "",
        options: ["leuk", "leuks", "leuke"],
        id: "a2-something-adjective:practice:1",
        sortOrder: 1,
      },
      {
        kind: "fill-blank",
        prompt:
          "Complete the sentence:\nEr is niets ___.\nThere is nothing new.",
        correctAnswer: "nieuws",
        acceptedAnswers: [],
        explanation:
          "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
        hint: "Use nieuw after niets without a noun.",
        id: "a2-something-adjective:practice:2",
        sortOrder: 2,
      },
      {
        kind: "correction",
        prompt:
          "Correct the marked form only:\nIk wil iets [leuke] doen.\nI want to do something fun.",
        correctAnswer: "Ik wil iets leuks doen.",
        acceptedAnswers: [],
        explanation:
          "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
        hint: "Write the complete corrected sentence. Keep the other words.",
        id: "a2-something-adjective:practice:3",
        sortOrder: 3,
      },
      {
        kind: "translation",
        prompt: "I want to do something fun.",
        correctAnswer: "Ik wil iets leuks doen.",
        acceptedAnswers: [],
        explanation:
          "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-something-adjective:practice:4",
        sortOrder: 4,
      },
      {
        kind: "translation",
        prompt: "There is nothing new.",
        correctAnswer: "Er is niets nieuws.",
        acceptedAnswers: [],
        explanation:
          "In common noun-free phrases after iets, niets or wat, add -s to an ordinary adjective: iets leuks, niets nieuws, wat lekkers.",
        hint: "Translate into Dutch using the wording and grammar from this lesson's example.",
        id: "a2-something-adjective:practice:5",
        sortOrder: 5,
      },
    ],
  },
};
