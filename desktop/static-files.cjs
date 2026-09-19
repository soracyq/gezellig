const fs = require("node:fs/promises");
const path = require("node:path");
const { updateAPI } = require("./external-links.cjs");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${updateAPI}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join("; "),
};

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function isTemplatePath(pathname) {
  return /^\/templates\/(vocabulary|grammar)_(template|example)\.(csv|xlsx)$/.test(
    pathname,
  );
}

/** Resolve exported Expo routes without exposing paths outside the export. */
async function resolveStaticFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (
    !decoded.startsWith("/") ||
    /[\\\0:]/.test(decoded) ||
    decoded.split("/").includes("..")
  )
    return null;
  const absoluteRoot = path.resolve(root);
  const requested = path.resolve(absoluteRoot, `.${decoded}`);
  if (!isInside(absoluteRoot, requested)) return null;
  const candidates = decoded.endsWith("/")
    ? [path.join(requested, "index.html")]
    : [requested, `${requested}.html`, path.join(requested, "index.html")];
  for (const candidate of candidates) {
    try {
      const info = await fs.stat(candidate);
      if (!info.isFile()) continue;
      const real = await fs.realpath(candidate);
      const realRoot = await fs.realpath(absoluteRoot);
      if (!isInside(realRoot, real)) return null;
      return {
        path: real,
        size: info.size,
        contentType:
          mimeTypes[path.extname(real).toLowerCase()] ||
          "application/octet-stream",
      };
    } catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
    }
  }
  return null;
}

function responseHeaders(file, pathname) {
  const headers = {
    ...securityHeaders,
    "Content-Type": file.contentType,
    "Cache-Control": "no-cache",
  };
  if (isTemplatePath(pathname))
    headers["Content-Disposition"] =
      `attachment; filename="${path.posix.basename(pathname)}"`;
  return headers;
}

module.exports = {
  resolveStaticFile,
  responseHeaders,
  isTemplatePath,
  securityHeaders,
};
