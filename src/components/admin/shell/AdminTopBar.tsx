import type { ReactNode } from "react";
import type { Tab } from "@/components/admin/types";
import { Button } from "@/components/ui/Button";
import { getAdminTabLabel } from "@/components/admin/shell/adminNav";
import { Menu } from "lucide-react";

type Props = {
  tab: Tab;
  sessionEmail: string;
  onSignOut: () => Promise<void>;
  onOpenMobileNav: () => void;
  topNotice?: ReactNode;
};

export function AdminTopBar({ tab, sessionEmail, onSignOut, onOpenMobileNav, topNotice }: Props) {
  const title = getAdminTabLabel(tab);
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[var(--cf-secondary)]/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-white/50">/admin</div>
            <div className="truncate text-sm font-semibold text-white">{title}</div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="max-w-[340px] truncate text-xs font-semibold text-white/60">{sessionEmail}</div>
          <Button variant="secondary" className="h-10" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>

      {topNotice ? (
        <div className="border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 lg:px-6">
          <div className="min-w-0 truncate">{topNotice}</div>
        </div>
      ) : null}
    </div>
  );
}

