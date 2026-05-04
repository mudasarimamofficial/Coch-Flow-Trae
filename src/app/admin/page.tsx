import { AdminPageClient } from "@/components/admin/AdminPageClient";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin — CoachFlow AI",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const adminEnabled = process.env.CF_ADMIN_ENABLED === "true";
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (isProd && !adminEnabled) notFound();
  return <AdminPageClient />;
}

