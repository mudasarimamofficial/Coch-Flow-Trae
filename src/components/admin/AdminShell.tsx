import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { LayoutDashboard, FileJson, Settings, Users, Code2 } from "lucide-react";
import type { Tab } from "@/components/admin/types";

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  sessionEmail: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
};

export function AdminShell({ tab, onTabChange, sessionEmail, onSignOut, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems: { tab: Tab; label: string; icon: ReactNode }[] = [
    { tab: "builder", label: "Builder", icon: <LayoutDashboard size={18} /> },
    { tab: "leads", label: "Leads", icon: <Users size={18} /> },
    { tab: "homepage", label: "JSON", icon: <FileJson size={18} /> },
    { tab: "custom", label: "Custom", icon: <Code2 size={18} /> },
    { tab: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden w-[200px] flex-col border-r border-[var(--cf-border)] bg-[var(--cf-secondary)] px-3 py-6 md:flex">
        <div className="mb-4 text-sm font-bold">CoachFlow AI</div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onTabChange("leads")}
            className={
              tab === "leads"
                ? "rounded-lg bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white"
                : "rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            }
          >
            <span className="inline-flex items-center gap-2">
              <Users size={18} />
              Leads
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("builder")}
            className={
              tab === "builder"
                ? "rounded-lg bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white"
                : "rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            }
          >
            <span className="inline-flex items-center gap-2">
              <LayoutDashboard size={18} />
              Builder
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("homepage")}
            className={
              tab === "homepage"
                ? "rounded-lg bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white"
                : "rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            }
          >
            <span className="inline-flex items-center gap-2">
              <FileJson size={18} />
              JSON
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("custom")}
            className={
              tab === "custom"
                ? "rounded-lg bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white"
                : "rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            }
          >
            <span className="inline-flex items-center gap-2">
              <Code2 size={18} />
              Custom
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("settings")}
            className={
              tab === "settings"
                ? "rounded-lg bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white"
                : "rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
            }
          >
            <span className="inline-flex items-center gap-2">
              <Settings size={18} />
              Settings
            </span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--cf-border)] bg-[var(--cf-secondary)] px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cf-border)] bg-[var(--cf-surface)] text-[var(--cf-text)] md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="text-[20px]">≡</span>
            </button>
            <div className="text-sm font-semibold">/admin</div>
            <div className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Signed in as {sessionEmail}
            </div>
          </div>
          <Button variant="secondary" className="h-10" onClick={onSignOut}>
            Sign out
          </Button>
        </div>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 bg-black/40 p-4 md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-full max-w-sm rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-surface)] p-3 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="text-sm font-bold">Menu</div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10"
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
                        ? "flex items-center gap-3 rounded-xl bg-black/5 px-3 py-3 text-sm font-bold dark:bg-white/10"
                        : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10"
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
              </div>
            </div>
          </div>
        ) : null}

        {tab === "builder" ? (
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        )}
      </div>
    </div>
  );
}

