import { AdminPageClient } from "@/components/admin/AdminPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Admin — CoachFlow AI",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageClient />;
}

