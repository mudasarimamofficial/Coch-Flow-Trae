import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Lead } from "@/components/admin/types";
import { LeadDetails } from "@/components/admin/LeadDetails";
import { RefreshCw } from "lucide-react";

type Props = {
  leads: Lead[];
  leadsLoading: boolean;
  leadsError: string | null;
  selectedId: string | null;
  query: string;
  onQueryChange: (v: string) => void;
  datePreset: "all" | "today" | "last7";
  onDatePresetChange: (v: "all" | "today" | "last7") => void;
  onSelect: (id: string | null) => void;
  onRefresh: () => Promise<void>;
  onUpdateStatus: (id: string, status: Lead["status"]) => Promise<void>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function LeadsPanel({
  leads,
  leadsLoading,
  leadsError,
  selectedId,
  query,
  onQueryChange,
  datePreset,
  onDatePresetChange,
  onSelect,
  onRefresh,
  onUpdateStatus,
}: Props) {
  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) || null,
    [leads, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const last7Start = todayStart - 6 * 24 * 60 * 60 * 1000;

    return leads.filter((l) => {
      const createdAtMs = new Date(l.created_at).getTime();
      if (datePreset === "today" && createdAtMs < todayStart) return false;
      if (datePreset === "last7" && createdAtMs < last7Start) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q)
      );
    });
  }, [leads, query, datePreset]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-10 lg:px-8 lg:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leads</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage incoming applications and prospect statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name/email/phone"
          />
          <select
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value as Props["datePreset"])}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20"
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            variant="secondary"
            className="h-10"
            onClick={onRefresh}
            disabled={leadsLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {leadsError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {leadsError}
        </div>
      ) : null}

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm">
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-black/20 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => onSelect(l.id)}
                    className={
                      selectedId === l.id
                        ? "cursor-pointer bg-white/10 transition-colors"
                        : "cursor-pointer transition-colors hover:bg-white/5"
                    }
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {l.name}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {l.email}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={l.status}
                        onChange={async (e) => {
                          await onUpdateStatus(
                            l.id,
                            e.target.value as Lead["status"],
                          );
                        }}
                        className={
                          l.status === "new"
                            ? "h-8 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 text-xs font-semibold text-sky-200 outline-none focus:ring-2 focus:ring-sky-500/20"
                            : l.status === "contacted"
                              ? "h-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 text-xs font-semibold text-amber-200 outline-none focus:ring-2 focus:ring-amber-500/20"
                              : "h-8 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        }
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-white/50">
                      {formatDate(l.created_at)}
                    </td>
                  </tr>
                ))}
                {!leadsLoading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-white/50"
                    >
                      No leads match your criteria.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sticky top-6 flex flex-col">
          <LeadDetails lead={selected} />
        </div>
      </div>
    </div>
  );
}

