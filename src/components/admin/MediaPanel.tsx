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
};

function sanitizePathSegment(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function MediaPanel({ supabase }: Props) {
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
        const { data: pubData } = supabase.storage.from("homepage").getPublicUrl(path);
        return { name: x.name, path, url: pubData.publicUrl };
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

  const upload = useCallback(
    async (file: File) => {
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
        await load();
        await loadUsage();
      } finally {
        setLoading(false);
      }
    },
    [prefix, supabase, load, loadUsage],
  );

  useEffect(() => {
    load();
    loadUsage();
  }, [load, loadUsage]);

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

  return (
    <div className="flex h-full flex-col p-6 lg:p-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Manager</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Upload, organize, and clean up your images and assets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#112121]">
            <div className="mb-4 text-sm font-bold">Upload Media</div>
            <div className="space-y-4">
              <Input label="Folder Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              <Input
                label="Select file"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await upload(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#112121]">
            <div className="mb-4 text-sm font-bold">Filters</div>
            <div className="space-y-4">
              <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className={
                    filterMode === "all"
                      ? "rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-left text-xs font-semibold text-white dark:border-white/10"
                      : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  }
                  onClick={() => setFilterMode("all")}
                >
                  All Assets ({counts.all})
                </button>
                <button
                  type="button"
                  className={
                    filterMode === "in_use"
                      ? "rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-left text-xs font-semibold text-white dark:border-white/10"
                      : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  }
                  onClick={() => setFilterMode("in_use")}
                >
                  In use ({counts.used})
                </button>
                <button
                  type="button"
                  className={
                    filterMode === "unused"
                      ? "rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-left text-xs font-semibold text-white dark:border-white/10"
                      : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  }
                  onClick={() => setFilterMode("unused")}
                >
                  Unused ({counts.unused})
                </button>
              </div>
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
          </div>
        </div>

        <div className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#112121]">
          {loading ? <div className="mb-4 text-sm text-slate-500">Loading…</div> : null}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a) => (
              <div
                key={a.path}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-[#0fa3a3]/50 dark:border-white/10 dark:bg-white/5"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-200 dark:bg-black/30">
                  <Image
                    src={a.url}
                    alt={a.name}
                    width={320}
                    height={180}
                    unoptimized
                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                </div>
                <div className="px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 truncate text-xs font-semibold" title={a.name}>
                      {a.name}
                    </div>
                    {usageByPath[a.path] ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-200">
                        Used
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-white/70">
                        Unused
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      className="h-8 flex-1 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(a.url);
                      }}
                    >
                      Copy URL
                    </Button>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
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
              </div>
            ))}
            {filtered.length === 0 && !loading ? (
              <div className="col-span-full py-10 text-center text-sm text-slate-500">No assets found.</div>
            ) : null}
          </div>
        </div>
      </div>

      {deleteState ? (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1414] dark:text-white">
            <div className="text-lg font-bold">Delete media</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-white/70">{deleteState.asset.path}</div>

            <div className="mt-4 space-y-3">
              {deleteState.usage ? (
                (() => {
                  const origins = deleteState.usage?.origins || [];
                  const usedInPublished = origins.includes("homepage_published") || origins.includes("pages_published");
                  if (usedInPublished) {
                    return (
                      <>
                        <div className="rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
                          <div className="font-semibold">This file is currently live.</div>
                          <div className="mt-1 text-xs opacity-90">Origins: {origins.join(", ")}</div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80">
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
                    <>
                      <div className="rounded-xl border border-amber-500/25 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                        <div className="font-semibold">This file is referenced in drafts.</div>
                        <div className="mt-1 text-xs opacity-90">Origins: {origins.join(", ")}</div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80">
                        <input
                          type="checkbox"
                          checked={deleteAcknowledge}
                          onChange={(e) => setDeleteAcknowledge(e.target.checked)}
                        />
                        Delete anyway (removes from drafts where referenced)
                      </label>
                    </>
                  );
                })()
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                  No references detected (best-effort scan). Safe to delete.
                </div>
              )}

              {deleteError ? (
                <div className="rounded-lg border border-rose-500/20 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {deleteError}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
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
                className="h-10 bg-rose-600 text-white hover:bg-rose-700"
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
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
