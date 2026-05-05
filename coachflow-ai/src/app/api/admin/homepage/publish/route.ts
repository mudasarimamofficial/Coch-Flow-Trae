import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { revalidatePath } from "next/cache";
import { isPlainObject } from "@/utils/json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  force: z.boolean().optional(),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const [{ data: published }, { data: draft }] = await Promise.all([
    supabase.from("homepage_content").select("content, updated_at").eq("id", 1).maybeSingle(),
    supabase
      .from("homepage_content_drafts")
      .select("content, published_updated_at")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (!published || !draft) {
    return NextResponse.json({ ok: false, message: "Missing homepage rows" }, { status: 409 });
  }

  const baseline = draft.published_updated_at;
  const currentPublishedUpdatedAt = published.updated_at;
  const conflict = Boolean(baseline && currentPublishedUpdatedAt && baseline !== currentPublishedUpdatedAt);

  if (conflict && !parsed.data.force) {
    return NextResponse.json(
      {
        ok: false,
        message: "Publish conflict",
        conflict: true,
        baseline,
        currentPublishedUpdatedAt,
      },
      { status: 409 },
    );
  }

  const nextContent = isPlainObject(draft.content) ? draft.content : {};

  const { error: versionError } = await supabase.from("homepage_content_versions").insert({
    homepage_id: 1,
    content: published.content,
    created_by: gate.admin.userId,
  });
  if (versionError) {
    return NextResponse.json({ ok: false, message: versionError.message }, { status: 500 });
  }

  const nextUpdatedAt = new Date().toISOString();
  const { data: updated, error: publishError } = await supabase
    .from("homepage_content")
    .update({ content: nextContent, updated_at: nextUpdatedAt })
    .eq("id", 1)
    .eq("updated_at", currentPublishedUpdatedAt)
    .select("updated_at")
    .maybeSingle();
  if (publishError) {
    return NextResponse.json({ ok: false, message: publishError.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json(
      {
        ok: false,
        message: "Publish conflict",
        conflict: true,
        baseline,
        currentPublishedUpdatedAt,
      },
      { status: 409 },
    );
  }

  const { error: draftError } = await supabase
    .from("homepage_content_drafts")
    .update({ content: {}, published_updated_at: null, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (draftError) {
    return NextResponse.json({ ok: false, message: draftError.message, published: true }, { status: 500 });
  }

  revalidatePath("/");

  return NextResponse.json({ ok: true, updatedAt: updated.updated_at ?? nextUpdatedAt }, { status: 200 });
}
