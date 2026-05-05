import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function sanitizePrefix(v: string) {
  const prefix = v.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
  if (!prefix) return "";
  const parts = prefix.split("/");
  if (parts.some((seg) => !seg || seg === "." || seg === "..")) return null;
  return parts
    .map((seg) => seg.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 80))
    .join("/");
}

function sanitizeFileName(name: string) {
  const cleaned = name
    .replaceAll("\\", "-")
    .replaceAll("/", "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);
  return cleaned || "asset";
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, message: "Invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  const prefix = String(form.get("prefix") || "").trim();
  const bucket = String(form.get("bucket") || process.env["NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET"] || "assets").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, message: "File is larger than 10MB" }, { status: 413 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, message: "Unsupported file type" }, { status: 415 });
  }

  const safePrefix = sanitizePrefix(prefix);
  if (safePrefix === null) {
    return NextResponse.json({ ok: false, message: "Invalid prefix" }, { status: 400 });
  }

  const safeName = sanitizeFileName(file.name);
  const key = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
  const path = safePrefix ? `${safePrefix}/${key}` : key;

  const supabase = createServiceSupabaseClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    return NextResponse.json({ ok: false, message: uploadError.message }, { status: 500 });
  }

  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);

  return NextResponse.json(
    {
      ok: true,
      bucket,
      path,
      signedUrl: signed.data?.signedUrl ?? null,
    },
    { status: 200 },
  );
}
