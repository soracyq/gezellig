// SemVer 2.0.0 precedence, including prereleases and ignored build metadata.
// Integer strings avoid losing precision for unusually large version numbers.
const numeric = /^(0|[1-9]\d*)$/;
function parseVersion(value: string) {
  const match =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/.exec(
      value,
    );
  if (!match) throw new Error("Invalid release version");
  const pre = match[4]?.split(".") ?? [];
  if (pre.some((part) => /^\d+$/.test(part) && !numeric.test(part)))
    throw new Error("Invalid prerelease version");
  return { core: match.slice(1, 4), pre };
}
const compareNumber = (a: string, b: string) =>
  a.length !== b.length
    ? Math.sign(a.length - b.length)
    : a === b
      ? 0
      : a > b
        ? 1
        : -1;
export function compareVersions(a: string, b: string) {
  const left = parseVersion(a),
    right = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    const order = compareNumber(left.core[i], right.core[i]);
    if (order) return order;
  }
  if (!left.pre.length || !right.pre.length)
    return left.pre.length === right.pre.length ? 0 : left.pre.length ? -1 : 1;
  for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i++) {
    const x = left.pre[i],
      y = right.pre[i];
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
    if (x === y) continue;
    if (numeric.test(x) && numeric.test(y)) return compareNumber(x, y);
    if (numeric.test(x) !== numeric.test(y)) return numeric.test(x) ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}

export type UpdateResult = {
  status: "current" | "available" | "ahead";
  version: string;
  url: string;
  summary: string;
  checkedAt: string;
};
export const networkMessage =
  "Unable to check for updates. Please check your internet connection and try again.";

export function releaseSummary(body: unknown) {
  if (typeof body !== "string") return "";
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_#]/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join("\n");
  return plain.length > 500 ? plain.slice(0, 497) + "…" : plain;
}

export async function checkForUpdates(
  version: string,
  repository: string,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<UpdateResult> {
  const repo = new URL(repository);
  if (
    repo.origin !== "https://github.com" ||
    !/^\/[\w-]+\/[\w.-]+$/.test(repo.pathname)
  )
    throw new Error("The update repository is not configured correctly.");
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, 10000);
  try {
    let response: Response;
    try {
      response = await fetcher(
        `https://api.github.com/repos${repo.pathname}/releases/latest`,
        {
          signal: controller.signal,
          credentials: "omit",
          redirect: "error",
          headers: { Accept: "application/vnd.github+json" },
        },
      );
    } catch {
      throw new Error(networkMessage);
    }
    if (response.status === 403 || response.status === 429)
      throw new Error(
        "GitHub is limiting update checks right now. Please wait a little and try again.",
      );
    if (response.status === 404)
      throw new Error(
        "No public release is available to check yet. Please try again later.",
      );
    if (!response.ok)
      throw new Error(
        "GitHub is unavailable right now. Please try again later.",
      );
    try {
      const data = await response.json();
      if (
        !data ||
        typeof data.tag_name !== "string" ||
        data.draft !== false ||
        data.prerelease !== false
      )
        throw new Error("Invalid release");
      const order = compareVersions(data.tag_name, version);
      return {
        status: order > 0 ? "available" : order === 0 ? "current" : "ahead",
        version: data.tag_name.replace(/^v/, ""),
        url: `${repository}/releases/tag/${encodeURIComponent(data.tag_name)}`,
        summary: releaseSummary(data.body),
        checkedAt: new Date().toISOString(),
      };
    } catch {
      throw new Error(
        "GitHub returned release information that could not be read. Please try again later.",
      );
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
