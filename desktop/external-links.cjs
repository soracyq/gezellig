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
const { repository } = require("./project-info.json");
const repo = new URL(repository);
const updateAPI = `https://api.github.com/repos${repo.pathname}/releases/latest`;
function isProjectURL(value) {
  try {
    const url = new URL(value);
    if (
      url.origin !== repo.origin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return false;
    if (
      [
        repo.pathname,
        repo.pathname + "/",
        repo.pathname + "/releases",
        repo.pathname + "/releases/latest",
      ].includes(url.pathname)
    )
      return true;
    const prefix = repo.pathname + "/releases/tag/";
    return (
      url.pathname.startsWith(prefix) &&
      /^[\w.+-]+$/.test(decodeURIComponent(url.pathname.slice(prefix.length)))
    );
  } catch {
    return false;
  }
}
const isUpdateAPI = (value) => value === updateAPI;
module.exports = { isGoogleTranslateURL, isProjectURL, isUpdateAPI, updateAPI };
