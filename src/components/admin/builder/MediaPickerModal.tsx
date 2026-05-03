"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import { scanValueForHomepageMediaUsage, type MediaUsage } from "@/utils/mediaScan";

type MediaAsset = {
  name: string;
  path: string;
  url: string;
};

type DeleteState = {
  asset: MediaAsset;
  usage: { origins: string[]; examples: string[] } | null;
};

type Props = {
  supabase: SupabaseClient;
  open: boolean;
  title: string;
  accept?: string;
  onClose: () => void;
  onPick: (asset: { url: string; path: string }) => void;
};

function sanitizePathSegment(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function MediaPickerModal({ supabase, open, title, accept, onClose, onPick }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("media");
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usageByPath, setUsageByPath] = useState<Record<string, { origins: string[]; examples: string[] }>>({});
  const [filterMode, setFilterMode] = useState<"all" | "unused" | "in_use">("all");

  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteForce, setDeleteForce] = useState(false);
  const [deleteAcknowledge, setDeleteAcknowledge] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage.from("homepage").list(prefix, {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) {
        setError(error.message);
        setAssets([]);
        return;
      }
      const rows = (data || []).filter((x) => x.name && !x.name.endsWith("/"));
      const next = rows.map((x) => {
        const path = `${prefix}/${x.name}`;
        const { data } = supabase.storage.from("homepage").getPublicUrl(path);
        return { name: x.name, path, url: data.publicUrl };
      });
      setAssets(next);
    } finally {
      setLoading(false);
    }
  }, [prefix, supabase]);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    setUsageError(null);
    try {
      const map = new Map<string, MediaUsage>();

      const pub = await supabase.from("homepage_content").select("content").eq("id", 1).maybeSingle();
      if (!pub.error && pub.data?.content) scanValueForHomepageMediaUsage(pub.data.content, "homepage_published", map);

      const draft = await supabase.from("homepage_content_drafts").select("content").eq("id", 1).maybeSingle();
      if (!draft.error && draft.data?.content) scanValueForHomepageMediaUsage(draft.data.content, "homepage_draft", map);

      const pages = await supabase.from("site_pages").select("slug, draft_content, published_content");
      if (!pages.error && Array.isArray(pages.data)) {
        for (const row of pages.data as any[]) {
          scanValueForHomepageMediaUsage(row?.published_content, "pages_published", map);
          scanValueForHomepageMediaUsage(row?.draft_content, "pages_draft", map);
        }
      }

      const next: Record<string, { origins: string[]; examples: string[] }> = {};
      for (const [path, usage] of map.entries()) {
        next[path] = {
          origins: Array.from(usage.origins),
          examples: Array.from(usage.examples || []),
        };
      }
      setUsageByPath(next);
    } catch (e) {
      setUsageError(e instanceof Error ? e.message : "Failed to scan media usage");
      setUsageByPath({});
    } finally {
      setUsageLoading(false);
    }
  }, [supabase]);

  const upload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const safeName = sanitizePathSegment(file.name);
      const path = `${prefix}/${Date.now()}-${safeName || "file"}`;
      const { error } = await supabase.storage
        .from("homepage")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        setError(error.message);
        return;
      }
      const { data } = supabase.storage.from("homepage").getPublicUrl(path);
      onPick({ url: data.publicUrl, path });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose, onPick, prefix, supabase]);

  useEffect(() => {
    if (!open) return;
    load();
    loadUsage();
  }, [open, load, loadUsage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = assets;
    if (filterMode === "unused") {
      list = list.filter((a) => !usageByPath[a.path]);
    } else if (filterMode === "in_use") {
      list = list.filter((a) => Boolean(usageByPath[a.path]));
    }
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q));
  }, [assets, filterMode, query, usageByPath]);

  const counts = useMemo(() => {
    let used = 0;
    for (const a of assets) if (usageByPath[a.path]) used += 1;
    return { all: assets.length, used, unused: Math.max(assets.length - used, 0) };
  }, [assets, usageByPath]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1414]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="text-sm font-bold">{title}</div>
          <button type="button" className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <Input label="Folder" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Input
              label="Upload"
              type="file"
              accept={accept}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await upload(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              className="h-10 w-full"
              onClick={async () => {
                await load();
                await loadUsage();
              }}
              disabled={loading || usageLoading}
            >
              Refresh
            </Button>
            <div className="flex gap-2">
              <button
                type="button"
                className={
                  filterMode === "all"
                    ? "flex-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:border-white/10"
                    : "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                }
                onClick={() => setFilterMode("all")}
              >
                All ({counts.all})
              </button>
              <button
                type="button"
                className={
                  filterMode === "in_use"
                    ? "flex-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:border-white/10"
                    : "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                }
                onClick={() => setFilterMode("in_use")}
              >
                In use ({counts.used})
              </button>
              <button
                type="button"
                className={
                  filterMode === "unused"
                    ? "flex-1 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:border-white/10"
                    : "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                }
                onClick={() => setFilterMode("unused")}
              >
                Unused ({counts.unused})
              </button>
            </div>
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}
            {usageError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                {usageError}
              </div>
            ) : null}
          </div>

          <div className="min-h-[420px]">
            {loading ? <div className="text-sm text-slate-500">Loading…</div> : null}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {filtered.map((a) => (
                <button
                  key={a.path}
                  type="button"
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-[#0fa3a3]/50 dark:border-white/10 dark:bg-white/5"
                  onClick={() => {
                    onPick({ url: a.url, path: a.path });
                    onClose();
                  }}
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-black/30">
                    <Image
                      src={a.url}
                      alt={a.name}
                      width={320}
                      height={180}
                      unoptimized
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 truncate text-xs font-semibold">{a.name}</div>
                      {usageByPath[a.path] ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                          Used
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                          Unused
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteError(null);
                          setDeleteConfirm("");
                          setDeleteForce(false);
                          setDeleteAcknowledge(false);
                          setDeleteState({ asset: a, usage: usageByPath[a.path] || null });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deleteState ? (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1414] p-6 text-white shadow-2xl">
            <div className="text-sm font-bold">Delete media</div>
            <div className="mt-2 text-xs text-white/70">{deleteState.asset.path}</div>

            {deleteState.usage ? (
              <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                <div className="font-semibold">This file appears to be in use.</div>
                <div className="mt-1">Origins: {deleteState.usage.origins.join(", ")}</div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
                No references detected (best-effort scan).
              </div>
            )}

            <div className="mt-4 space-y-3">
              {deleteState.usage ? (
                (() => {
                  const origins = deleteState.usage?.origins || [];
                  const usedInPublished = origins.includes("homepage_published") || origins.includes("pages_published");
                  if (usedInPublished) {
                    return (
                      <>
                        <label className="flex items-center gap-2 text-xs text-white/80">
                          <input
                            type="checkbox"
                            checked={deleteForce}
                            onChange={(e) => setDeleteForce(e.target.checked)}
                          />
                          Force delete (will break published content)
                        </label>
                        <Input
                          label="Type DELETE to confirm"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder="DELETE"
                        />
                      </>
                    );
                  }
                  return (
                    <label className="flex items-center gap-2 text-xs text-white/80">
                      <input
                        type="checkbox"
                        checked={deleteAcknowledge}
                        onChange={(e) => setDeleteAcknowledge(e.target.checked)}
                      />
                      Delete anyway (referenced in drafts)
                    </label>
                  );
                })()
              ) : null}

              {deleteError ? (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {deleteError}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  setDeleteState(null);
                }}
                disabled={deleteBusy}
              >
                Cancel
              </Button>
              <Button
                className="h-10"
                disabled={
                  deleteBusy ||
                  (() => {
                    if (!deleteState.usage) return false;
                    const origins = deleteState.usage.origins;
                    const usedInPublished = origins.includes("homepage_published") || origins.includes("pages_published");
                    if (usedInPublished) return !(deleteForce && deleteConfirm.trim().toUpperCase() === "DELETE");
                    return !deleteAcknowledge;
                  })()
                }
                onClick={async () => {
                  setDeleteError(null);
                  setDeleteBusy(true);
                  try {
                    const { data } = await supabase.auth.getSession();
                    const token = data.session?.access_token || "";
                    if (!token) {
                      setDeleteError("You must be signed in as admin.");
                      return;
                    }

                    const origins = deleteState.usage?.origins || [];
                    const usedInPublished = origins.includes("homepage_published") || origins.includes("pages_published");
                    const res = await fetch("/api/admin/media/delete", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                        authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ path: deleteState.asset.path, force: usedInPublished ? deleteForce : false }),
                    });
                    const json = (await res.json()) as any;
                    if (!res.ok || !json?.ok) {
                      setDeleteError(String(json?.message || "Failed to delete media"));
                      return;
                    }
                    setDeleteState(null);
                    await load();
                    await loadUsage();
                  } catch (e) {
                    setDeleteError(e instanceof Error ? e.message : "Failed to delete media");
                  } finally {
                    setDeleteBusy(false);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
