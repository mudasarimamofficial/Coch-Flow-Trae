"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { resolvePublicMediaUrl } from "@/utils/mediaUrl";

type MediaItem = {
  name: string;
  path: string;
  signedUrl: string | null;
  used?: boolean;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  bucket,
  value,
  onPick,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket?: string;
  value?: string | null;
  onPick: (path: string) => void;
  title?: string;
  description?: string;
}) {
  const adminFetch = useAdminFetch();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    const q = new URLSearchParams();
    if (bucket) q.set("bucket", bucket);
    q.set("limit", "100");
    q.set("include_usage", "false");
    adminFetch(`/api/admin/media?${q.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        if (j?.ok) setItems(j.items ?? []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, adminFetch, bucket]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q) || it.path.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-white">{title || "Select Media"}</DialogTitle>
          <DialogDescription className="text-surface-400">
            {description || "Choose an existing asset from your Media Library."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or path" className="pl-9" />
          </div>
          <div className="text-xs text-surface-500">{loading ? "Loading..." : `${filtered.length} items`}</div>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it) => {
                const previewUrl = it.signedUrl || resolvePublicMediaUrl(it.path, bucket);
                const active = Boolean(value && value === it.path);
                return (
                  <button
                    key={it.path}
                    type="button"
                    className={`rounded-xl border text-left overflow-hidden transition-colors ${
                      active
                        ? "border-brand-500/40 bg-brand-500/10"
                        : "border-surface-800 bg-surface-900/20 hover:bg-surface-900/40"
                    }`}
                    onClick={() => {
                      onPick(it.path);
                      onOpenChange(false);
                    }}
                  >
                    <div className="aspect-video bg-surface-950 relative">
                      {previewUrl ? (
                        <Image src={previewUrl} alt={it.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-surface-500">No preview</div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-sm font-medium text-surface-50 truncate">{it.name}</div>
                      <div className="text-[11px] text-surface-500 font-mono truncate">{it.path}</div>
                      {typeof it.used === "boolean" ? (
                        <div className="pt-1">
                          {it.used ? <Badge variant="warning">In use</Badge> : <Badge variant="outline">Unused</Badge>}
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-surface-800 bg-surface-900/20 p-8 text-center">
              <div className="text-sm text-surface-200">No media found</div>
              <div className="text-xs text-surface-500 mt-1">Upload assets in the Media page, then return here.</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

