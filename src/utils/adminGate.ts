import type { SupabaseClient } from "@supabase/supabase-js";

function normEmail(v: string | null | undefined) {
  return (v || "").trim().toLowerCase();
}

export const BOOTSTRAP_ADMIN_EMAIL = "mudasarimamofficial@gmail.com";

export async function resolveIsAdmin(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null } | null,
) {
  const email = normEmail(user?.email);
  if (!user?.id) return false;
  if (email === BOOTSTRAP_ADMIN_EMAIL) return true;

  const prof = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!prof.error && prof.data?.is_admin) return true;

  const settings = await supabase.from("settings").select("admin_email").eq("id", 1).maybeSingle();
  if (!settings.error && normEmail(settings.data?.admin_email) === email) return true;

  return false;
}

