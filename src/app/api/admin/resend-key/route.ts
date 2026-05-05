import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  apiKey: z.string().min(10).max(300),
});

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

function maskResendKey(key: string) {
  const k = key.trim();
  if (k.length <= 6) return "re_********";
  const suffix = k.slice(-4);
  return `re_************${suffix}`;
}

async function requireAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false as const, status: 401, message: "Missing auth token" };

  const supabaseUrl = nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false as const, status: 503, message: "Server misconfigured" };
  }

  const auth = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false as const, status: 401, message: "Invalid session" };
  }

  const email = (data.user.email || "").trim().toLowerCase();
  const allowed = "mudasarimamofficial@gmail.com";
  if (email !== allowed) {
    return { ok: false as const, status: 403, message: "Access denied" };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const apiKey = parsed.data.apiKey.trim();
  if (!apiKey.startsWith("re_")) {
    return NextResponse.json({ ok: false, message: "Invalid Resend API key" }, { status: 400 });
  }

  const masked = maskResendKey(apiKey);
  const supabase = createServiceSupabaseClient();

  await supabase.from("secret_settings").upsert({ id: 1, resend_api_key: apiKey, updated_at: new Date().toISOString() });
  await supabase.from("settings").update({ resend_api_key_masked: masked }).eq("id", 1);

  return NextResponse.json({ ok: true, masked }, { status: 200 });
}

