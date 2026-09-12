const assert = require("node:assert/strict");
const test = require("node:test");
const { isGoogleTranslateURL } = require("./external-links.cjs");
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
