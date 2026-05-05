import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/utils/supabase/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  paths: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.res;

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
  }

  const uniq = Array.from(new Set(parsed.data.paths));
  for (const p of uniq) {
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, paths: uniq }, { status: 200 });
}

