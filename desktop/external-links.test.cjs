const assert = require("node:assert/strict");
const test = require("node:test");
const {
  isGoogleTranslateURL,
  isProjectURL,
  isUpdateAPI,
  updateAPI,
} = require("./external-links.cjs");
test("only exact Dutch-to-English Google Translate text URLs may open externally", () => {
  const valid =
    "https://translate.google.com/?sl=nl&tl=en&text=het%20huis&op=translate";
  assert.equal(isGoogleTranslateURL(valid), true);
  for (const url of [
    valid.replace("https:", "http:"),
    valid.replace("google.com", "google.com.evil.test"),
    valid.replace("https://", "https://user@"),
    valid + "&text=other",
    valid + "&next=https://evil.test",
    valid + "#redirect",
    valid.replace("sl=nl", "sl=en"),
    valid.replace("het%20huis", ""),
    "file:///C:/Windows/System32/cmd.exe",
    "javascript:alert(1)",
    "https://example.com",
  ])
    assert.equal(isGoogleTranslateURL(url), false, url);
});
test("only official project and release pages open externally", () => {
  for (const url of [
    "https://github.com/soracyq/gezellig",
    "https://github.com/soracyq/gezellig/releases/latest",
    "https://github.com/soracyq/gezellig/releases/tag/v0.6.1",
    "https://github.com/soracyq/gezellig/releases/tag/v1.0.0%2Bbuild",
  ])
    assert.equal(isProjectURL(url), true, url);
  for (const url of [
    "https://github.com/other/repo",
    "https://github.com/soracyq/gezellig/releases/download/v0.6.1/file.exe",
    "https://github.com.evil.test/soracyq/gezellig",
    "https://user@github.com/soracyq/gezellig",
    "http://github.com/soracyq/gezellig",
    "https://github.com/soracyq/gezellig?next=evil",
    "https://github.com/soracyq/gezellig#x",
    "https://github.com/soracyq/gezellig/releases/tag/a%2Fb",
    "file:///C:/Windows/notepad.exe",
  ])
    assert.equal(isProjectURL(url), false, url);
});
test("the desktop update network allowance is restricted to one endpoint", () => {
  assert.equal(isUpdateAPI(updateAPI), true);
  for (const url of [
    updateAPI + "?token=x",
    updateAPI + "/extra",
    updateAPI.replace("soracyq", "other"),
    updateAPI.replace("https:", "http:"),
    "https://api.github.com/user",
  ])
    assert.equal(isUpdateAPI(url), false);
});
