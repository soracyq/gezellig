import assert from "node:assert/strict";
import test from "node:test";
import {
  cefrLevels,
  grammarTopics,
  reviewQuestions,
  vocabularyItems,
} from "../src/data/sample-content.ts";

const contentItems = [...vocabularyItems, ...grammarTopics];
const allQuestions = [
  ...reviewQuestions,
  ...grammarTopics.flatMap((topic) => topic.questions),
];

test("sample content and question identifiers are unique and non-empty", () => {
  const allIds = [...contentItems, ...allQuestions].map((item) => item.id);
  assert.ok(contentItems.length > 0);
  assert.ok(allQuestions.length > 0);
  assert.ok(allIds.every((id) => id.trim().length > 0));
  assert.equal(new Set(allIds).size, allIds.length);
});

test("every multiple-choice question has one correct option and no duplicate options", () => {
  for (const question of allQuestions) {
    assert.equal(question.kind, "multiple-choice");
    assert.ok(question.options.length >= 2, question.id);
    assert.ok(
      question.options.every((option) => option.trim().length > 0),
      question.id,
    );
    assert.equal(
      new Set(question.options).size,
      question.options.length,
      question.id,
    );
    assert.equal(
      question.options.filter((option) => option === question.correctAnswer)
        .length,
      1,
      question.id,
    );
    assert.ok(question.explanation.trim().length > 0, question.id);
  }
});

test("question relationships and grammar prerequisites reference existing content", () => {
  const contentIds = new Set(contentItems.map((item) => item.id));
  const grammarIds = new Set(grammarTopics.map((topic) => topic.id));
  for (const question of allQuestions) {
    assert.ok(contentIds.has(question.relatedItemId), question.id);
  }
  for (const topic of grammarTopics) {
    assert.ok(
      topic.questions.every((question) => question.relatedItemId === topic.id),
      topic.id,
    );
    for (const prerequisiteId of topic.prerequisiteIds ?? []) {
      assert.ok(
        grammarIds.has(prerequisiteId),
        `${topic.id}: missing prerequisite`,
      );
      assert.notEqual(prerequisiteId, topic.id);
    }
  }
});

test("development content is marked as sample and includes English example translations", () => {
  for (const item of contentItems) {
    assert.equal(item.isSample, true, item.id);
    assert.ok(cefrLevels.includes(item.level), item.id);
  }
  const examples = [
    ...vocabularyItems.map((item) => item.example),
    ...grammarTopics.flatMap((topic) => topic.examples),
  ];
  for (const example of examples) {
    assert.ok(example.dutch.trim().length > 0);
    assert.ok(example.english.trim().length > 0);
  }
});
