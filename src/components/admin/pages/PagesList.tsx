import type { SitePage } from "@/components/admin/pages/types";

type Props = {
  pages: SitePage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PagesList({ pages, selectedId, onSelect }: Props) {
  return (
    <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
      {pages.map((p) => (
        <button
          key={p.id}
          type="button"
          className={
            selectedId === p.id
              ? "w-full rounded-xl border border-[#0fa3a3]/40 bg-[#0fa3a3]/10 px-3 py-3 text-left"
              : "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:bg-slate-50 dark:border-white/10 dark:bg-[#0b1414] dark:hover:bg-white/5"
          }
          onClick={() => onSelect(p.id)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-bold">{p.title}</div>
            <div
              className={
                p.status === "published"
                  ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-200"
                  : "rounded-full bg-slate-500/15 px-2 py-0.5 text-[11px] font-bold text-slate-200"
              }
            >
              {p.status}
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">/{p.slug}</div>
        </button>
      ))}
    </div>
  );
}

