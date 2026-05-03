import { createClient } from "@supabase/supabase-js";

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

function normEmail(v: string | null | undefined) {
  return (v || "").trim().toLowerCase();
}

const BOOTSTRAP_ADMIN_EMAIL = "mudasarimamofficial@gmail.com";

export type AdminGateOk = {
  ok: true;
  supabase: ReturnType<typeof createClient>;
  userId: string;
  email: string;
};

export type AdminGateFail = {
  ok: false;
  status: number;
  message: string;
};

export type AdminGateResult = AdminGateOk | AdminGateFail;

export async function requireAdmin(req: Request): Promise<AdminGateResult> {
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, message: "Missing auth token" };

  const supabaseUrl = nonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = nonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, status: 503, message: "Server misconfigured" };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, message: "Invalid session" };
  }

  const email = normEmail(data.user.email);
  if (email === BOOTSTRAP_ADMIN_EMAIL) {
    return { ok: true, supabase, userId: data.user.id, email };
  }

  const profileRes = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).maybeSingle();
  if (!profileRes.error && profileRes.data?.is_admin) {
    return { ok: true, supabase, userId: data.user.id, email };
  }

  const settingsRes = await supabase.from("settings").select("admin_email").eq("id", 1).maybeSingle();
  if (!settingsRes.error && normEmail(settingsRes.data?.admin_email) === email) {
    return { ok: true, supabase, userId: data.user.id, email };
  }

  return { ok: false, status: 403, message: "Access denied" };
}

