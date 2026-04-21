import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, FileJson, Settings, Users, Code2, Files } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
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

  return (
    <div className="cf-admin flex h-[100dvh] overflow-hidden bg-[var(--cf-bg)] text-[var(--cf-text)]">
      <aside className="hidden w-[220px] flex-col border-r border-white/10 bg-[var(--cf-secondary)] px-3 py-5 lg:flex">
        <div className="mb-5 flex items-center gap-2 px-2 text-sm font-bold">
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--cf-accent)]" />
          CoachFlow <span className="text-[var(--cf-accent)]">AI</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((i) => (
            <button
              key={i.tab}
              type="button"
              onClick={() => onTabChange(i.tab)}
              className={
                tab === i.tab
                  ? "flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-left text-sm font-semibold text-white"
                  : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
              }
            >
              <span className="inline-flex w-6 justify-center">{i.icon}</span>
              {i.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2 pt-4">
          <div className="mb-2 text-xs text-white/50">Signed in as</div>
          <div className="truncate text-xs font-semibold text-white/80">{sessionEmail}</div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab !== "builder" ? (
          <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)] px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <span className="text-[18px]">≡</span>
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

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 bg-black/50 p-4 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[var(--cf-secondary)] p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="text-sm font-bold">Menu</div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/90"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {navItems.map((i) => (
                  <button
                    key={i.tab}
                    type="button"
                    className={
                      tab === i.tab
                        ? "flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold text-white"
                        : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/80 hover:bg-white/5"
                    }
                    onClick={() => {
                      onTabChange(i.tab);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {i.icon}
                    {i.label}
                  </button>
                ))}
                <div className="mt-2 border-t border-white/10 pt-2">
                  <Button
                    variant="secondary"
                    className="h-10 w-full"
                    onClick={async () => {
                      await onSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "builder" ? <div className="min-h-0 flex-1 overflow-hidden">{children}</div> : null}
        {tab !== "builder" ? <div className="min-h-0 flex-1 overflow-y-auto">{children}</div> : null}
      </div>
    </div>
  );
}

