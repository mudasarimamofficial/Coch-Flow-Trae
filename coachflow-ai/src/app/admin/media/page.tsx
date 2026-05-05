"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Copy, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { Badge } from "@/components/ui/badge";

type MediaItem = {
  name: string;
  path: string;
  size: number | null;
  updated_at: string | null;
  signedUrl: string | null;
  used?: boolean;
  usedIn?: string[];
};

export default function MediaPage() {
  const adminFetch = useAdminFetch();
  const [bucket, setBucket] = useState(process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "assets");
  const [prefix, setPrefix] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("bucket", bucket);
      if (prefix.trim()) q.set("prefix", prefix.trim());
      q.set("include_usage", "true");
      const r = await adminFetch(`/api/admin/media?${q.toString()}`);
      const j = await r.json().catch(() => null);
      if (j?.ok) setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [adminFetch, bucket, prefix]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("bucket", bucket);
      if (prefix.trim()) fd.set("prefix", prefix.trim());
      const r = await adminFetch("/api/admin/media/upload", { method: "POST", body: fd });
      const j = await r.json().catch(() => null);
      if (j?.ok) {
        if (fileRef.current) fileRef.current.value = "";
        await load();
      }
    } finally {
      setUploading(false);
    }
  }

  async function del(paths: string[]) {
    const yes = confirm(`Delete ${paths.length} file(s)? This cannot be undone.`);
    if (!yes) return;
    const res = await adminFetch("/api/admin/media", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bucket, paths }),
    });
    if (res.status === 409) {
      const j = await res.json().catch(() => null);
      const details = (j?.inUse || [])
        .map((x: any) => `${x.path} (${(x.locations || []).join(", ")})`)
        .join("\n");
      alert(`Delete blocked because these assets are in use:\n\n${details}`);
      return;
    }
    await load();
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed");
    }
  }

  const countLabel = useMemo(() => (loading ? "—" : String(items.length)), [items.length, loading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Media</h1>
        <p className="text-surface-400 text-sm">Upload and manage assets stored in Supabase Storage.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-surface-800">
          <CardTitle className="text-lg">Library</CardTitle>
          <CardDescription>Bucket and prefix are configurable per workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Bucket</div>
              <Input value={bucket} onChange={(e) => setBucket(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Prefix (folder)</div>
              <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="optional" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Upload</div>
              <div className="flex gap-2">
                <Input ref={fileRef} type="file" className="h-9" />
                <Button variant="primary" className="gap-2" onClick={upload} disabled={uploading}>
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-surface-400">Showing {countLabel} items</div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <div key={it.path} className="rounded-xl border border-surface-800 bg-surface-900/30 overflow-hidden">
                <div className="aspect-video bg-surface-950 flex items-center justify-center overflow-hidden">
                  {it.signedUrl ? (
                    <div className="relative h-full w-full">
                      <Image src={it.signedUrl} alt={it.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="text-xs text-surface-500">No preview</div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-sm font-medium text-surface-100 truncate" title={it.name}>
                    {it.name}
                  </div>
                  <div className="text-xs text-surface-500 font-mono truncate" title={it.path}>
                    {it.path}
                  </div>
                  <div className="flex items-center gap-2">
                    {it.used ? <Badge variant="warning">In use</Badge> : <Badge variant="outline">Unused</Badge>}
                    {it.usedIn?.length ? (
                      <span className="text-xs text-surface-500 truncate" title={it.usedIn.join(", ")}>
                        {it.usedIn[0]}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {it.signedUrl ? (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => copy(it.signedUrl!)}>
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => copy(it.path)}>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Path
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => del([it.path])}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
