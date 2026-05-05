import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

type AdminContext = { userId: string; email: string | null };

function bearerToken(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice("bearer ".length).trim() || null;
}

export async function requireAdmin(req: Request): Promise<
  | { ok: true; admin: AdminContext }
  | { ok: false; res: NextResponse }
> {
  const token = bearerToken(req);
  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, message: "Missing Authorization header" }, { status: 401 }),
    };
  }

  const supabase = createServiceSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, message: "Invalid session" }, { status: 401 }),
    };
  }

  const user = userData.user;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, admin: { userId: user.id, email: user.email ?? null } };
}

