import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("homepage_content")
    .select("content, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: "Failed to load homepage" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, content: data.content, updatedAt: data.updated_at }, { status: 200 });
}

