import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Code2, FileJson, Files, LayoutDashboard, PanelLeft, RotateCcw, Settings, Users } from "lucide-react";
import type { Tab } from "@/components/admin/types";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  sessionEmail: string;
  onSignOut: () => Promise<void>;
  topNotice?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ tab, onTabChange, sessionEmail, onSignOut, topNotice, children }: Props) {
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [isPortraitBlocked, setIsPortraitBlocked] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems: { tab: Tab; label: string; icon: ReactNode }[] = [
    { tab: "builder", label: "Builder", icon: <LayoutDashboard size={18} /> },
    { tab: "pages", label: "Pages", icon: <Files size={18} /> },
    { tab: "leads", label: "Leads", icon: <Users size={18} /> },
    { tab: "homepage", label: "JSON", icon: <FileJson size={18} /> },
    { tab: "custom", label: "Custom", icon: <Code2 size={18} /> },
    { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const tabLabel = navItems.find((n) => n.tab === tab)?.label || "Admin";

  const shouldShowNotice = useMemo(() => {
    if (!topNotice) return false;
    if (noticeDismissed) return false;
    return true;
  }, [topNotice, noticeDismissed]);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem("cf_admin_notice_dismissed") === "1";
      setNoticeDismissed(dismissed);
    } catch {
      setNoticeDismissed(false);
    }
  }, []);

  useEffect(() => {
    const mqPortrait = window.matchMedia("(orientation: portrait)");
    const mqNarrow = window.matchMedia("(max-width: 1024px)");
    const update = () => {
      setIsPortraitBlocked(Boolean(mqPortrait.matches && mqNarrow.matches));
      setIsNarrow(Boolean(mqNarrow.matches));
    };
    update();

    mqPortrait.addEventListener("change", update);
    mqNarrow.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mqPortrait.removeEventListener("change", update);
      mqNarrow.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (isNarrow) setSidebarCollapsed(true);
  }, [isNarrow]);

  return (
    <div className="cf-admin flex h-[100dvh] overflow-hidden bg-[var(--cf-bg)] text-[var(--cf-text)]">
      {isPortraitBlocked ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--cf-surface-lowest)] px-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--cf-accent)]">
                <RotateCcw size={20} />
              </div>
              <div>
                <div className="text-base font-semibold text-[var(--cf-text)]">Rotate to landscape</div>
                <div className="mt-1 text-sm text-[var(--cf-text)]/70">
                  The admin panel is landscape-only on mobile for full functionality.
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-2">
              <Button
                variant="secondary"
                className="h-11"
                onClick={() => {
                  try {
                    window.location.reload();
                  } catch {
                    return;
                  }
                }}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <aside
        className={
          sidebarCollapsed
            ? "flex w-[72px] flex-col border-r border-white/10 bg-[var(--cf-secondary)] px-2 py-4"
            : "flex w-[248px] flex-col border-r border-white/10 bg-[var(--cf-secondary)] px-3 py-5"
        }
      >
        <div className={sidebarCollapsed ? "mb-4 flex items-center justify-center" : "mb-5 flex items-center gap-2 px-2"}>
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--cf-accent)]" />
          {!sidebarCollapsed ? (
            <div className="text-sm font-bold">
              CoachFlow <span className="text-[var(--cf-accent)]">AI</span>
            </div>
          ) : null}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((i) => (
            <button
              key={i.tab}
              type="button"
              onClick={() => onTabChange(i.tab)}
              title={sidebarCollapsed ? i.label : undefined}
              className={
                tab === i.tab
                  ? sidebarCollapsed
                    ? "flex items-center justify-center rounded-2xl bg-white/10 p-3 text-white"
                    : "flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5 text-left text-sm font-semibold text-white"
                  : sidebarCollapsed
                    ? "flex items-center justify-center rounded-2xl p-3 text-white/70 hover:bg-white/5 hover:text-white"
                    : "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
              }
            >
              <span className={sidebarCollapsed ? "inline-flex" : "inline-flex w-6 justify-center"}>{i.icon}</span>
              {!sidebarCollapsed ? i.label : null}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed ? (
          <div className="mt-auto px-2 pt-4">
            <div className="mb-2 text-xs text-white/50">Signed in as</div>
            <div className="truncate text-xs font-semibold text-white/80">{sessionEmail}</div>
          </div>
        ) : null}
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab !== "builder" ? (
          <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)] px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
                onClick={() => setSidebarCollapsed((v) => !v)}
                aria-label="Toggle sidebar"
              >
                <PanelLeft size={18} />
              </button>
              <div className="text-xs text-white/60">/admin</div>
              <div className="text-sm font-semibold">{tabLabel}</div>
            </div>
            <Button variant="secondary" className="h-10" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        ) : null}

        {shouldShowNotice ? (
          <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="mr-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                  Email
                </span>
                {topNotice}
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
                onClick={() => {
                  setNoticeDismissed(true);
                  try {
                    window.localStorage.setItem("cf_admin_notice_dismissed", "1");
                  } catch {
                    return;
                  }
                }}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}

        {tab === "builder" ? <div className="min-h-0 flex-1 overflow-hidden">{children}</div> : null}
        {tab !== "builder" ? <div className="min-h-0 flex-1 overflow-y-auto">{children}</div> : null}
      </div>
    </div>
  );
}

