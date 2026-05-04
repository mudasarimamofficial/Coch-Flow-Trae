import Image from "next/image";
import type { Tab } from "@/components/admin/types";
import { ADMIN_NAV_ITEMS } from "@/components/admin/shell/adminNav";

type Props = {
  tab: Tab;
  brandIconUrl?: string;
  onTabChange: (tab: Tab) => void;
  sessionEmail: string;
};

export function AdminSidebar({ tab, brandIconUrl, onTabChange, sessionEmail }: Props) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[var(--cf-secondary)] lg:flex">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <Image
          src={
            brandIconUrl ||
            "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"
          }
          alt="CoachFlow"
          width={40}
          height={40}
          className="h-10 w-10 rounded-2xl"
          unoptimized
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">
            CoachFlow <span className="text-[var(--cf-accent)]">AI</span>
          </div>
          <div className="truncate text-xs text-white/55">Admin Console</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pb-4">
        {ADMIN_NAV_ITEMS.map((i) => (
          <button
            key={i.tab}
            type="button"
            onClick={() => onTabChange(i.tab)}
            className={
              tab === i.tab
                ? "flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white"
                : "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
            }
          >
            <span className="inline-flex w-6 items-center justify-center text-white/80">{i.icon}</span>
            <span className="min-w-0 truncate">{i.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Signed in</div>
        <div className="mt-1 truncate text-xs font-semibold text-white/80">{sessionEmail}</div>
      </div>
    </aside>
  );
}

