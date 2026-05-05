import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { isPlainObject } from "@/utils/json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const upsertDraftSchema = z.object({
  content: z.unknown(),
  published_updated_at: z
    .string()
    .refine((v) => Number.isFinite(Date.parse(v)), {
      message: "Invalid datetime",
    })
    .nullable()
    .optional(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const [{ data: published }, { data: draft }, { data: versions }] = await Promise.all([
    supabase.from("homepage_content").select("content, updated_at").eq("id", 1).maybeSingle(),
    supabase
      .from("homepage_content_drafts")
      .select("content, updated_at, published_updated_at")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("homepage_content_versions")
      .select("id, created_at, created_by")
      .eq("homepage_id", 1)
      .order("id", { ascending: false })
      .limit(25),
  ]);

  return NextResponse.json(
    {
      ok: true,
      published: published ?? null,
      draft: draft ?? null,
      versions: versions ?? [],
    },
    { status: 200 },
  );
}

export async function PUT(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = upsertDraftSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  const { data: published } = await supabase
    .from("homepage_content")
    .select("updated_at")
    .eq("id", 1)
    .maybeSingle();

  const baseline = parsed.data.published_updated_at ?? published?.updated_at ?? null;
  if (!isPlainObject(parsed.data.content)) {
    return NextResponse.json({ ok: false, message: "Content must be a JSON object" }, { status: 400 });
  }

  const { error } = await supabase
    .from("homepage_content_drafts")
    .upsert({
      id: 1,
      content: parsed.data.content,
      published_updated_at: baseline,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, published_updated_at: baseline }, { status: 200 });
}
