import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Lead } from "@/components/admin/types";
import { LeadDetails } from "@/components/admin/LeadDetails";
import { RefreshCw, Trash2 } from "lucide-react";

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
  onDeleteLead: (id: string) => Promise<boolean>;
  onBulkDelete: (ids: string[]) => Promise<boolean>;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function selectedTier(lead: Lead) {
  return (lead.selected_tier || lead.business_type || "").trim();
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
  onDeleteLead,
  onBulkDelete,
}: Props) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; label: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        (l.phone || "").toLowerCase().includes(q) ||
        selectedTier(l).toLowerCase().includes(q)
      );
    });
  }, [leads, query, datePreset]);

  useEffect(() => {
    const existing = new Set(leads.map((lead) => lead.id));
    setSelectedLeadIds((ids) => ids.filter((id) => existing.has(id)));
  }, [leads]);

  const filteredIds = filtered.map((lead) => lead.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedLeadIds.includes(id));

  async function confirmDeleteNow() {
    if (!confirmDelete?.ids.length) return;
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteNotice(null);
    try {
      const ok =
        confirmDelete.ids.length === 1
          ? await onDeleteLead(confirmDelete.ids[0])
          : await onBulkDelete(confirmDelete.ids);
      if (!ok) {
        setDeleteError("Delete failed. Check the error banner above or try again.");
        return;
      }
      setSelectedLeadIds((ids) => ids.filter((id) => !confirmDelete.ids.includes(id)));
      setDeleteNotice(confirmDelete.ids.length === 1 ? "Lead deleted." : "Selected leads deleted.");
      setConfirmDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-8 lg:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="mt-1 text-sm text-white/60">
            Newest first. Click a row to view details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name/email/phone"
          />
          <select
            value={datePreset}
            onChange={(e) => onDatePresetChange(e.target.value as Props["datePreset"])}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-accent)]/20"
          >
            <option value="today">Today</option>
            <option value="last7">Last 7 days</option>
            <option value="all">All</option>
          </select>
          <Button
            variant="secondary"
            className="h-12"
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
      {deleteError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {deleteError}
        </div>
      ) : null}
      {deleteNotice ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {deleteNotice}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        <div>{selectedLeadIds.length} selected</div>
        <Button
          variant="secondary"
          className="h-10"
          disabled={!selectedLeadIds.length || deleteLoading}
          onClick={() => setConfirmDelete({ ids: selectedLeadIds, label: `${selectedLeadIds.length} selected leads` })}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Bulk delete
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-white/50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      aria-label="Select all visible leads"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeadIds((ids) => Array.from(new Set([...ids, ...filteredIds])));
                        } else {
                          const visible = new Set(filteredIds);
                          setSelectedLeadIds((ids) => ids.filter((id) => !visible.has(id)));
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={
                      selectedId === l.id
                        ? "bg-[#0fa3a3]/5"
                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(l.id)}
                        aria-label={`Select ${l.name}`}
                        onChange={(e) => {
                          setSelectedLeadIds((ids) =>
                            e.target.checked ? Array.from(new Set([...ids, l.id])) : ids.filter((id) => id !== l.id),
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onSelect(l.id)}
                        className="text-left font-semibold hover:underline"
                      >
                        {l.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {l.email}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {l.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {selectedTier(l) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={async (e) => {
                          await onUpdateStatus(
                            l.id,
                            e.target.value as Lead["status"],
                          );
                        }}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none ring-[#0fa3a3]/30 focus:ring-4 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="closed">closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(l.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                        aria-label={`Delete ${l.name}`}
                        onClick={() => setConfirmDelete({ ids: [l.id], label: l.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!leadsLoading && filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No leads yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <LeadDetails
          lead={selected}
          onDelete={
            selected
              ? () => setConfirmDelete({ ids: [selected.id], label: selected.name })
              : undefined
          }
        />
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1414] p-5 shadow-2xl">
            <div className="text-lg font-bold text-white">Delete leads?</div>
            <p className="mt-2 text-sm text-white/65">This will permanently delete selected leads.</p>
            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
              {confirmDelete.label}
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <Button variant="secondary" className="h-10" disabled={deleteLoading} onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button className="h-10 bg-rose-500 text-white hover:bg-rose-400" disabled={deleteLoading} onClick={confirmDeleteNow}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

