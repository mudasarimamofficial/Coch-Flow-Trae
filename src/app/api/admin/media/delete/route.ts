import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/serverAdminGate";
import { scanValueForHomepageMediaUsage, type MediaUsage } from "@/utils/mediaScan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  path: z.string().min(1).max(500),
  force: z.boolean().optional(),
});

function normalizePath(p: string) {
  const v = p.trim().replaceAll("\\", "/");
  return v.startsWith("/") ? v.slice(1) : v;
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const path = normalizePath(parsed.data.path);
  if (!path.includes("/")) {
    return NextResponse.json({ ok: false, message: "Invalid path" }, { status: 400 });
  }

  const force = Boolean(parsed.data.force);

  const usage = new Map<string, MediaUsage>();

  const pub = await gate.supabase.from("homepage_content").select("content").eq("id", 1).maybeSingle();
  if (!pub.error && pub.data?.content) {
    scanValueForHomepageMediaUsage(pub.data.content, "homepage_published", usage);
  }

  const draft = await gate.supabase.from("homepage_content_drafts").select("content").eq("id", 1).maybeSingle();
  if (!draft.error && draft.data?.content) {
    scanValueForHomepageMediaUsage(draft.data.content, "homepage_draft", usage);
  }

  const pages = await gate.supabase.from("site_pages").select("slug, draft_content, published_content");
  if (!pages.error && Array.isArray(pages.data)) {
    for (const row of pages.data as any[]) {
      scanValueForHomepageMediaUsage(row?.published_content, "pages_published", usage);
      scanValueForHomepageMediaUsage(row?.draft_content, "pages_draft", usage);
    }
  }

  const u = usage.get(path) || null;
  const origins = u ? Array.from(u.origins || []) : [];
  const examples = u ? Array.from(u.examples || []) : [];
  const usedInPublished = origins.includes("homepage_published") || origins.includes("pages_published");
  if (u && usedInPublished && !force) {
    return NextResponse.json(
      {
        ok: false,
        message: "Media is still referenced by published content",
        path,
        origins,
        examples,
      },
      { status: 409 },
    );
  }

  const del = await gate.supabase.storage.from("homepage").remove([path]);
  if (del.error) {
    return NextResponse.json({ ok: false, message: del.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path, deleted: true, origins }, { status: 200 });
}

