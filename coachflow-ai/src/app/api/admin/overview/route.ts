import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const supabase = createServiceSupabaseClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: leads30d }, { count: newLeads30d }, { count: pages }, { data: draft }, { data: versions }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .eq("status", "new"),
      supabase.from("site_pages").select("id", { count: "exact", head: true }),
      supabase
        .from("homepage_content_drafts")
        .select("updated_at")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("homepage_content_versions")
        .select("id, created_at, created_by")
        .eq("homepage_id", 1)
        .order("id", { ascending: false })
        .limit(10),
    ]);

  return NextResponse.json(
    {
      ok: true,
      stats: {
        leads30d: leads30d ?? 0,
        newLeads30d: newLeads30d ?? 0,
        pages: pages ?? 0,
        homepageDraftUpdatedAt: draft?.updated_at ?? null,
      },
      recentHomepageVersions: versions ?? [],
    },
    { status: 200 },
  );
}

