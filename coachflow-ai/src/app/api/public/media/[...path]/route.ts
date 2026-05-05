import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { path?: string[] } };

function safeBucket(v: string | null) {
  const bucket = (v || process.env["NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET"] || "assets").trim();
  return /^[a-zA-Z0-9._-]{1,80}$/.test(bucket) ? bucket : null;
}

function safePath(parts: string[] | undefined) {
  const joined = (parts || []).join("/");
  if (!joined || joined.length > 1024) return null;
  if (joined.includes("\\") || joined.split("/").some((seg) => !seg || seg === "." || seg === "..")) return null;
  return joined;
}

async function signedMediaRedirect(req: Request, ctx: Ctx) {
  const bucket = safeBucket(new URL(req.url).searchParams.get("bucket"));
  const path = safePath(ctx.params.path);
  if (!bucket || !path) {
    return NextResponse.json({ ok: false, message: "Invalid media path" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ ok: false, message: "Media not found" }, { status: 404 });
  }

  const res = NextResponse.redirect(data.signedUrl, 307);
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return res;
}

export async function GET(req: Request, ctx: Ctx) {
  return signedMediaRedirect(req, ctx);
}

export async function HEAD(req: Request, ctx: Ctx) {
  return signedMediaRedirect(req, ctx);
}
