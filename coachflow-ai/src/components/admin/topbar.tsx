"use client";

import { useRouter } from "next/navigation";
import { Bell, Globe, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/utils/supabase/browserClient";

export function Topbar() {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-3 border-b border-surface-800 bg-surface-950/80 px-3 backdrop-blur-md md:px-6">
      <div className="hidden flex-1 items-center gap-4 sm:flex">
        <div className="relative w-full max-w-64">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-surface-500" />
          <Input type="text" placeholder="Search admin..." className="pl-9 bg-surface-900 border-transparent" />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <div className="hidden md:flex items-center gap-2 mr-4 text-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          <span className="text-surface-400">All systems operational</span>
        </div>

        <Button variant="outline" size="sm" className="gap-2 border-surface-700 text-surface-300" asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">View Site</span>
          </a>
        </Button>

        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 text-surface-400 group-hover:text-surface-50" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface-950" />
        </Button>

        <Button variant="ghost" size="icon" className="text-surface-300" onClick={signOut} title="Sign out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
