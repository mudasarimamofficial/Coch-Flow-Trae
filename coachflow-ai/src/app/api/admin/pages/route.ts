import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9\-]+$/),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("site_pages")
    .select("id, slug, title, status, updated_at, published_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items: data ?? [] }, { status: 200 });
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("site_pages")
    .insert({ slug: parsed.data.slug, title: parsed.data.title, status: "draft" })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message ?? "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 200 });
}

