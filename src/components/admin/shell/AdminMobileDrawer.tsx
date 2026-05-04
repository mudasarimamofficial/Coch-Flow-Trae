import Image from "next/image";
import type { ReactNode } from "react";
import type { Tab } from "@/components/admin/types";
import { ADMIN_NAV_ITEMS } from "@/components/admin/shell/adminNav";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  tab: Tab;
  brandIconUrl?: string;
  sessionEmail: string;
  onClose: () => void;
  onTabChange: (tab: Tab) => void;
  onSignOut: () => Promise<void>;
  footer?: ReactNode;
};

export function AdminMobileDrawer({
  open,
  tab,
  brandIconUrl,
  sessionEmail,
  onClose,
  onTabChange,
  onSignOut,
  footer,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-3" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[var(--cf-secondary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={
                brandIconUrl ||
                "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"
              }
              alt="CoachFlow"
              width={36}
              height={36}
              className="h-9 w-9 rounded-2xl"
              unoptimized
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">CoachFlow AI</div>
              <div className="truncate text-xs text-white/55">{sessionEmail}</div>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/75"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1">
              {ADMIN_NAV_ITEMS.map((i) => (
                <button
                  key={i.tab}
                  type="button"
                  onClick={() => {
                    onTabChange(i.tab);
                    onClose();
                  }}
                  className={
                    tab === i.tab
                      ? "flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white"
                      : "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/75 hover:bg-white/5 hover:text-white"
                  }
                >
                  <span className="inline-flex w-6 items-center justify-center text-white/80">{i.icon}</span>
                  <span className="min-w-0 truncate">{i.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            {footer ? <div className="mb-3">{footer}</div> : null}
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={async () => {
                await onSignOut();
                onClose();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

