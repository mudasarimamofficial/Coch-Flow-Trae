import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  paths: z.array(z.string().min(1).max(220)).min(1).max(20),
});

function nonEmpty(v: string | null | undefined) {
  return v && v.trim().length ? v.trim() : null;
}

function safePath(value: string) {
  const path = value.trim();
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
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
  if (email !== "mudasarimamofficial@gmail.com") {
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

  const paths = Array.from(new Set(parsed.data.paths.map(safePath).filter(Boolean))) as string[];
  if (!paths.length) {
    return NextResponse.json({ ok: false, message: "No valid paths" }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, paths }, { status: 200 });
}
