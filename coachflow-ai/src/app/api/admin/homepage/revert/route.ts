import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("homepage_content_drafts")
    .update({ content: {}, published_updated_at: null, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}

