"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updated_at: string;
  published_at: string | null;
};

export default function PagesListPage() {
  const adminFetch = useAdminFetch();
  const [items, setItems] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async function load() {
    setLoading(true);
    try {
      const r = await adminFetch("/api/admin/pages");
      const j = await r.json().catch(() => null);
      setItems(j?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    setCreating(true);
    try {
      const r = await adminFetch("/api/admin/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim() }),
      });
      const j = await r.json().catch(() => null);
      if (j?.ok) {
        setTitle("");
        setSlug("");
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  const statusBadge = (status: string) => {
    if (status === "published") return <Badge variant="success">Published</Badge>;
    return <Badge variant="warning">Draft</Badge>;
  };

  const countLabel = useMemo(() => (loading ? "—" : String(items.length)), [items.length, loading]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Pages</h1>
          <p className="text-surface-400 text-sm">Manage `/p/[slug]` pages with drafts and publishing.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 border-b border-surface-800 bg-surface-900/30 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="grid gap-3 md:grid-cols-3 md:items-end w-full">
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="About" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-surface-500">Slug (no leading slash)</div>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="about" />
            </div>
            <Button variant="primary" className="gap-2" disabled={creating} onClick={create}>
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create Page"}
            </Button>
          </div>
          <div className="text-sm text-surface-400">Showing {countLabel} pages</div>
        </CardContent>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-400 uppercase bg-surface-900/40 border-b border-surface-800">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-900/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-surface-100">{p.title}</td>
                    <td className="px-6 py-4 text-surface-400 font-mono text-xs">/p/{p.slug}</td>
                    <td className="px-6 py-4">{statusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-surface-400">{new Date(p.updated_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-brand-400" asChild>
                        <Link href={`/admin/pages/${p.id}`}>Edit</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
