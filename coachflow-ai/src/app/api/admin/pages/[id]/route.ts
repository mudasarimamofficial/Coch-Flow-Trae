import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { revalidatePath } from "next/cache";
import { isPlainObject } from "@/utils/json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateDraftSchema = z.object({
  draft_content: z.unknown(),
});

const publishSchema = z.object({
  publish: z.boolean(),
});

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("site_pages").select("*").eq("id", ctx.params.id).maybeSingle();
  if (error || !data) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, page: data }, { status: 200 });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = updateDraftSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  if (!isPlainObject(parsed.data.draft_content)) {
    return NextResponse.json({ ok: false, message: "Draft content must be a JSON object" }, { status: 400 });
  }

  const { error } = await supabase
    .from("site_pages")
    .update({ draft_content: parsed.data.draft_content, updated_at: new Date().toISOString() })
    .eq("id", ctx.params.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = publishSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("slug, draft_content, published_content")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (!page) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  if (parsed.data.publish) {
    const { error: versionError } = await supabase.from("site_page_versions").insert({
      page_id: ctx.params.id,
      kind: "published",
      content: isPlainObject(page.published_content) ? page.published_content : {},
      created_by: gate.admin.userId,
    });
    if (versionError) {
      return NextResponse.json({ ok: false, message: versionError.message }, { status: 500 });
    }

    const { error } = await supabase
      .from("site_pages")
      .update({
        published_content: isPlainObject(page.draft_content) ? page.draft_content : {},
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ctx.params.id);
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("site_pages")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", ctx.params.id);
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
  }

  revalidatePath(`/p/${page.slug}`);

  return NextResponse.json({ ok: true }, { status: 200 });
}
