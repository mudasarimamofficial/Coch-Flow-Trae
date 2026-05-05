import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/supabase/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;
  return NextResponse.json({ ok: true, admin: gate.admin }, { status: 200 });
}

