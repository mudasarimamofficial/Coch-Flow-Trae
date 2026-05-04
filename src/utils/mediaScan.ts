const HOMEPAGE_BUCKET_PUBLIC_MARKER = "/storage/v1/object/public/homepage/";

export type MediaUsageOrigin = "homepage_published" | "homepage_draft" | "pages_published" | "pages_draft";

export type MediaUsage = {
  origins: Set<MediaUsageOrigin>;
  examples: string[];
};

function normalizePath(p: string) {
  const v = String(p || "").trim().replaceAll("\\", "/");
  if (!v) return null;
  if (v.startsWith("/")) return v.slice(1);
  return v;
}

function extractPathFromPublicUrl(url: string) {
  const u = String(url || "");
  const idx = u.indexOf(HOMEPAGE_BUCKET_PUBLIC_MARKER);
  if (idx < 0) return null;
  const raw = u.slice(idx + HOMEPAGE_BUCKET_PUBLIC_MARKER.length);
  const untilQuery = raw.split("?")[0] || "";
  try {
    return normalizePath(decodeURIComponent(untilQuery));
  } catch {
    return normalizePath(untilQuery);
  }
}

function note(map: Map<string, MediaUsage>, path: string, origin: MediaUsageOrigin, example: string) {
  const p = normalizePath(path);
  if (!p) return;
  const existing = map.get(p) || { origins: new Set<MediaUsageOrigin>(), examples: [] };
  existing.origins.add(origin);
  if (existing.examples.length < 6 && example && !existing.examples.includes(example)) {
    existing.examples.push(example);
  }
  map.set(p, existing);
}

function scanString(map: Map<string, MediaUsage>, s: string, origin: MediaUsageOrigin) {
  const direct = extractPathFromPublicUrl(s);
  if (direct) note(map, direct, origin, s);

  const re = /https?:\/\/[^\s"'<>]+\/storage\/v1\/object\/public\/homepage\/[^\s"'<>]+/gi;
  const matches = s.match(re);
  if (!matches) return;
  for (const m of matches) {
    const p = extractPathFromPublicUrl(m);
    if (p) note(map, p, origin, m);
  }
}

export function scanValueForHomepageMediaUsage(value: unknown, origin: MediaUsageOrigin, out?: Map<string, MediaUsage>) {
  const map = out || new Map<string, MediaUsage>();

  const visit = (v: unknown) => {
    if (v == null) return;

    if (typeof v === "string") {
      scanString(map, v, origin);
      return;
    }

    if (typeof v !== "object") return;

    if (Array.isArray(v)) {
      for (const item of v) visit(item);
      return;
    }

    const obj = v as Record<string, unknown>;

    const rawPath = typeof obj.path === "string" ? obj.path : null;
    if (rawPath) note(map, rawPath, origin, rawPath);

    const rawUrl = typeof obj.url === "string" ? obj.url : null;
    if (rawUrl) scanString(map, rawUrl, origin);

    for (const key of Object.keys(obj)) {
      visit(obj[key]);
    }
  };

  visit(value);
  return map;
}

