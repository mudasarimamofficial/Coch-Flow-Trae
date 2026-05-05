export function resolvePublicMediaUrl(path: string, bucket?: string) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p) || p.startsWith("/api/public/media/")) return p;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const b = (bucket || process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "assets").trim();
  if (!b) return "";
  const cleanPath = p.replace(/^\/+/, "");

  if (p.startsWith("/storage/v1/object/") && base) {
    return `${base.replace(/\/+$/, "")}${p}`;
  }

  const encodedPath = cleanPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `/api/public/media/${encodedPath}?bucket=${encodeURIComponent(b)}`;
}

