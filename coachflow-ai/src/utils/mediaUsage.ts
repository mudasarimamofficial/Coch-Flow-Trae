import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

function safeJsonStringify(v: unknown) {
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

export async function computeMediaUsage(bucket: string) {
  const supabase = createServiceSupabaseClient();
  const [{ data: home }, { data: homeDraft }, { data: pages }] = await Promise.all([
    supabase.from("homepage_content").select("content").eq("id", 1).maybeSingle(),
    supabase.from("homepage_content_drafts").select("content").eq("id", 1).maybeSingle(),
    supabase.from("site_pages").select("id, slug, draft_content, published_content").limit(500),
  ]);

  const homeStr = safeJsonStringify(home?.content ?? {});
  const homeDraftStr = safeJsonStringify(homeDraft?.content ?? {});

  const pageStrings = (pages ?? []).map((p: any) => ({
    id: String(p.id),
    slug: String(p.slug),
    draft: safeJsonStringify(p.draft_content ?? {}),
    published: safeJsonStringify(p.published_content ?? {}),
  }));

  return {
    isUsed(path: string) {
      const encodedPath = path
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");
      const candidates = [
        path,
        `/storage/v1/object/${bucket}/${path}`,
        `/storage/v1/object/public/${bucket}/${path}`,
        `/api/public/media/${encodedPath}?bucket=${encodeURIComponent(bucket)}`,
      ];
      const hasCandidate = (s: string) => candidates.some((c) => s.includes(c));

      if (hasCandidate(homeStr)) return { used: true, locations: ["homepage_published"] };
      if (hasCandidate(homeDraftStr)) return { used: true, locations: ["homepage_draft"] };

      const hits: string[] = [];
      for (const p of pageStrings) {
        if (hasCandidate(p.draft)) hits.push(`page:${p.slug}:draft`);
        if (hasCandidate(p.published)) hits.push(`page:${p.slug}:published`);
        if (hits.length >= 10) break;
      }
      if (hits.length) return { used: true, locations: hits };
      return { used: false, locations: [] as string[] };
    },
  };
}

