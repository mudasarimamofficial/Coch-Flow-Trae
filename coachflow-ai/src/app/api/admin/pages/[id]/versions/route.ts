import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const restoreSchema = z.object({
  versionId: z.number().int().positive(),
});

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("site_page_versions")
    .select("id, created_at, created_by")
    .eq("page_id", ctx.params.id)
    .order("id", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] }, { status: 200 });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = restoreSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data: v, error: vErr } = await supabase
    .from("site_page_versions")
    .select("content")
    .eq("page_id", ctx.params.id)
    .eq("id", parsed.data.versionId)
    .maybeSingle();

  if (vErr || !v) {
    return NextResponse.json({ ok: false, message: "Version not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("site_pages")
    .update({ draft_content: v.content, updated_at: new Date().toISOString() })
    .eq("id", ctx.params.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

