import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { Tab } from "@/components/admin/types";
import { AdminSidebar } from "@/components/admin/shell/AdminSidebar";
import { AdminTopBar } from "@/components/admin/shell/AdminTopBar";
import { AdminMobileDrawer } from "@/components/admin/shell/AdminMobileDrawer";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  sessionEmail: string;
  onSignOut: () => Promise<void>;
  brandIconUrl?: string;
  topNotice?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ tab, onTabChange, sessionEmail, onSignOut, brandIconUrl, topNotice, children }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showNotice = useMemo(() => Boolean(topNotice), [topNotice]);
  const isBuilder = tab === "builder";

  return (
    <div className="cf-admin min-h-[100dvh] bg-[var(--cf-bg)] text-[var(--cf-text)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px]">
        <AdminSidebar tab={tab} brandIconUrl={brandIconUrl} onTabChange={onTabChange} sessionEmail={sessionEmail} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar
            tab={tab}
            sessionEmail={sessionEmail}
            onSignOut={onSignOut}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            topNotice={showNotice ? topNotice : null}
          />
          <main className={isBuilder ? "min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}>
            {children}
          </main>
        </div>
      </div>

      <AdminMobileDrawer
        open={mobileNavOpen}
        tab={tab}
        brandIconUrl={brandIconUrl}
        sessionEmail={sessionEmail}
        onClose={() => setMobileNavOpen(false)}
        onTabChange={onTabChange}
        onSignOut={onSignOut}
      />
    </div>
  );
}

