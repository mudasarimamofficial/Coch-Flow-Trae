import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  versionId: z.number().int().positive(),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data: v, error: vErr } = await supabase
    .from("homepage_content_versions")
    .select("content")
    .eq("id", parsed.data.versionId)
    .eq("homepage_id", 1)
    .maybeSingle();

  if (vErr || !v) {
    return NextResponse.json({ ok: false, message: "Version not found" }, { status: 404 });
  }

  const { data: published } = await supabase
    .from("homepage_content")
    .select("updated_at")
    .eq("id", 1)
    .maybeSingle();

  const { error } = await supabase.from("homepage_content_drafts").upsert({
    id: 1,
    content: v.content,
    published_updated_at: published?.updated_at ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

