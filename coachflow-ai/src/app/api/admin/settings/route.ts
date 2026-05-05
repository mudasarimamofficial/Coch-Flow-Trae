import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  admin_email: z.string().email().optional(),
  resend_from_email: z.string().email().optional().nullable(),
  resend_api_key: z.string().min(5).optional().nullable(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;
  const supabase = createServiceSupabaseClient();

  const [{ data: settings }, { data: secret }] = await Promise.all([
    supabase
      .from("settings")
      .select("admin_email, resend_api_key_masked, resend_from_email, resend_sender_status, resend_sender_message, resend_sender_checked_at")
      .eq("id", 1)
      .maybeSingle(),
    supabase.from("secret_settings").select("resend_api_key").eq("id", 1).maybeSingle(),
  ]);

  return NextResponse.json(
    {
      ok: true,
      settings: settings ?? null,
      secret: {
        resend_api_key_present: Boolean(secret?.resend_api_key),
      },
    },
    { status: 200 },
  );
}

export async function PUT(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;
  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  const updates: any = {};
  if (typeof parsed.data.admin_email === "string") updates.admin_email = parsed.data.admin_email;
  if (parsed.data.resend_from_email !== undefined) updates.resend_from_email = parsed.data.resend_from_email;
  if (Object.keys(updates).length) {
    const { error } = await supabase.from("settings").update(updates).eq("id", 1);
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
  }

  if (parsed.data.resend_api_key !== undefined) {
    const { error } = await supabase
      .from("secret_settings")
      .upsert({ id: 1, resend_api_key: parsed.data.resend_api_key, updated_at: new Date().toISOString() });
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

