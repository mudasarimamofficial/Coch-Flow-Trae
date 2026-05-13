import { NextResponse } from "next/server";
import { z } from "zod";
import { adminJsonError, requireAdmin } from "@/utils/adminApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const schema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

const idSchema = z.string().uuid();

export async function GET(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ ok: false, message: "Invalid lead id" }, { status: 400 });

  const { data, error } = await gate.supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead: data }, { status: 200 });
}

export async function PATCH(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ ok: false, message: "Invalid lead id" }, { status: 400 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });

  const { data, error } = await gate.supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead: data }, { status: 200 });
}

export async function DELETE(req: Request, { params }: Props) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return adminJsonError(gate);
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ ok: false, message: "Invalid lead id" }, { status: 400 });

  const { data, error } = await gate.supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, message: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, deletedId: data.id }, { status: 200 });
}
