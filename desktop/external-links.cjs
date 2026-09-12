/** Only this explicit Dutch-to-English text link may leave the renderer. */
function isGoogleTranslateURL(value) {
  try {
    const url = new URL(value);
    const keys = [...url.searchParams.keys()];
    return (
      url.origin === "https://translate.google.com" &&
      url.pathname === "/" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      keys.length === 4 &&
      new Set(keys).size === 4 &&
      keys.every((key) => ["sl", "tl", "text", "op"].includes(key)) &&
      url.searchParams.get("sl") === "nl" &&
      url.searchParams.get("tl") === "en" &&
      url.searchParams.get("op") === "translate" &&
      !!url.searchParams.get("text")?.trim() &&
      url.searchParams.get("text").length <= 500
    );
  } catch {
    return false;
  }
}
module.exports = { isGoogleTranslateURL };
