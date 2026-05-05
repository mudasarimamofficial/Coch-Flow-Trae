import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import {
  checkResendDomainVerification,
  validateSenderEmailBasic,
  type ResendSenderStatus,
} from "@/utils/resendSender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  senderEmail: z.string().min(3).max(320),
});

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
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

async function computeStatus({ senderEmail, resendKey }: { senderEmail: string | null; resendKey: string | null }) {
  const v = validateSenderEmailBasic(senderEmail || "");
  if (!v.ok) {
    return { status: "failed" as ResendSenderStatus, message: v.message };
  }
  if (!resendKey) {
    return {
      status: "unknown" as ResendSenderStatus,
      message: "Resend API key is not configured. Add it in Settings to validate sender domain.",
    };
  }
  return checkResendDomainVerification(resendKey, v.domain || "");
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
  }

  const supabase = createServiceSupabaseClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("admin_email, resend_from_email, resend_sender_status, resend_sender_message, resend_sender_checked_at")
    .eq("id", 1)
    .maybeSingle();

  const { data: secretSettings } = await supabase
    .from("secret_settings")
    .select("resend_api_key")
    .eq("id", 1)
    .maybeSingle();

  const resendKey = nonEmpty((secretSettings as any)?.resend_api_key) || nonEmpty(process.env.RESEND_API_KEY);
  const envFrom = nonEmpty(process.env.RESEND_FROM_EMAIL);
  const configuredFrom = nonEmpty((settings as any)?.resend_from_email);
  const effectiveFrom = configuredFrom || envFrom;
  const computed = await computeStatus({ senderEmail: effectiveFrom, resendKey });

  return NextResponse.json(
    {
      ok: true,
      effectiveFrom,
      configuredFrom,
      envFrom,
      status: computed.status,
      message: computed.message,
      savedStatus: (settings as any)?.resend_sender_status || null,
      savedMessage: (settings as any)?.resend_sender_message || null,
      savedCheckedAt: (settings as any)?.resend_sender_checked_at || null,
    },
    { status: 200 },
  );
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

  const senderEmail = parsed.data.senderEmail.trim();
  const basic = validateSenderEmailBasic(senderEmail);
  if (!basic.ok) {
    return NextResponse.json({ ok: false, message: basic.message }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data: secretSettings } = await supabase
    .from("secret_settings")
    .select("resend_api_key")
    .eq("id", 1)
    .maybeSingle();
  const resendKey = nonEmpty((secretSettings as any)?.resend_api_key) || nonEmpty(process.env.RESEND_API_KEY);

  const computed = await computeStatus({ senderEmail, resendKey });
  const checkedAt = new Date().toISOString();
  await supabase
    .from("settings")
    .update({
      resend_from_email: senderEmail,
      resend_sender_status: computed.status,
      resend_sender_message: computed.message,
      resend_sender_checked_at: checkedAt,
    })
    .eq("id", 1);

  return NextResponse.json(
    {
      ok: true,
      senderEmail,
      status: computed.status,
      message: computed.message,
      checkedAt,
    },
    { status: 200 },
  );
}

