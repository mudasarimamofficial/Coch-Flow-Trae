import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { createSupabaseServerClient } from "@/utils/supabase/serverClient";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-coachflow-pathname") || "";
  if (pathname === "/admin/login") {
    return <div className="cf-admin min-h-screen bg-surface-950 text-surface-50">{children}</div>;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/admin/login");
  }

  const service = createServiceSupabaseClient();
  const { data: profile } = await service
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="cf-admin flex min-h-screen w-full flex-col bg-surface-950 text-surface-50 md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
