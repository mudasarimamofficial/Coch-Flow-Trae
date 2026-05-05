import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";
import { computeMediaUsage } from "@/utils/mediaUsage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listSchema = z.object({
  bucket: z.string().min(1).optional(),
  prefix: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  include_usage: z.coerce.boolean().optional(),
});

const delSchema = z.object({
  bucket: z.string().min(1).optional(),
  paths: z.array(z.string().min(1)).min(1),
  force: z.boolean().optional(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const url = new URL(req.url);
  const parsed = listSchema.safeParse({
    bucket: url.searchParams.get("bucket") ?? undefined,
    prefix: url.searchParams.get("prefix") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
    include_usage: url.searchParams.get("include_usage") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid query" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const bucket = parsed.data.bucket || process.env["NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET"] || "assets";
  const prefix = parsed.data.prefix || "";
  const limit = parsed.data.limit ?? 40;
  const offset = parsed.data.offset ?? 0;
  const includeUsage = parsed.data.include_usage ?? true;

  const { data: objects, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit, offset, sortBy: { column: "updated_at", order: "desc" } });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message, bucket }, { status: 500 });
  }

  const usage = includeUsage ? await computeMediaUsage(bucket) : null;

  const items = await Promise.all(
    (objects ?? [])
      .filter((o) => Boolean(o.name) && o.id)
      .map(async (o) => {
        const fullPath = prefix ? `${prefix.replace(/\/+$/, "")}/${o.name}` : o.name;
        const signed = await supabase.storage.from(bucket).createSignedUrl(fullPath, 60 * 10);
        const u = usage ? usage.isUsed(fullPath) : { used: false, locations: [] as string[] };
        return {
          name: o.name,
          path: fullPath,
          size: o.metadata?.size ?? null,
          updated_at: o.updated_at ?? null,
          signedUrl: signed.data?.signedUrl ?? null,
          used: u.used,
          usedIn: u.locations,
        };
      }),
  );

  return NextResponse.json({ ok: true, bucket, prefix, items }, { status: 200 });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = delSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const bucket = parsed.data.bucket || process.env["NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET"] || "assets";

  const usage = await computeMediaUsage(bucket);
  const used = parsed.data.paths
    .map((p) => ({ path: p, usage: usage.isUsed(p) }))
    .filter((x) => x.usage.used);
  const allowForceDelete = process.env["ALLOW_FORCE_MEDIA_DELETE"] === "true";
  if (used.length && (!parsed.data.force || !allowForceDelete)) {
    return NextResponse.json(
      {
        ok: false,
        message: "One or more assets are in use",
        inUse: used.map((u) => ({ path: u.path, locations: u.usage.locations })),
      },
      { status: 409 },
    );
  }

  const { error } = await supabase.storage.from(bucket).remove(parsed.data.paths);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
