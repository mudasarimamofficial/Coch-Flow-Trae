"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function PageEditor() {
  const adminFetch = useAdminFetch();
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const [page, setPage] = useState<any>(null);
  const [draftText, setDraftText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: number; created_at: string; created_by: string | null }>>([]);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    adminFetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setPage(j?.page ?? null);
        setDraftText(JSON.stringify(j?.page?.draft_content ?? {}, null, 2));
      });

    adminFetch(`/api/admin/pages/${id}/versions`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setVersions(j?.items ?? []);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch, id]);

  async function saveDraft() {
    setSaving(true);
    try {
      const parsed = JSON.parse(draftText);
      const res = await adminFetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft_content: parsed }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setPage((p: any) => (p ? { ...p, draft_content: parsed } : p));
      }
    } finally {
      setSaving(false);
    }
  }

  async function setPublish(publish: boolean) {
    setPublishing(true);
    try {
      const res = await adminFetch(`/api/admin/pages/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setPage((prev: any) => (prev ? { ...prev, status: publish ? "published" : "draft" } : prev));
        const vv = await adminFetch(`/api/admin/pages/${id}/versions`).then((r) => r.json());
        setVersions(vv?.items ?? []);
      }
    } finally {
      setPublishing(false);
    }
  }

  async function restore(versionId: number) {
    setRestoring(versionId);
    try {
      const res = await adminFetch(`/api/admin/pages/${id}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        const p = await adminFetch(`/api/admin/pages/${id}`).then((r) => r.json());
        setPage(p?.page ?? null);
        setDraftText(JSON.stringify(p?.page?.draft_content ?? {}, null, 2));
      }
    } finally {
      setRestoring(null);
    }
  }

  if (!page) return <div className="text-sm text-surface-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Edit Page</h1>
          <div className="text-sm text-surface-500">/p/{page.slug}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
              View
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/pages">Back</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Draft JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full h-[420px] bg-[#0d0d0d] border border-surface-800 rounded-md p-4 font-mono text-sm text-surface-100 focus:outline-none focus:border-brand-500"
          />
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={saveDraft} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="primary" onClick={() => setPublish(true)} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish"}
            </Button>
            <Button variant="outline" onClick={() => setPublish(false)} disabled={publishing}>
              Unpublish
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {versions.length === 0 ? <div className="text-sm text-surface-500">No versions yet.</div> : null}
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-md border border-surface-800 bg-surface-900/30 px-4 py-3"
            >
              <div className="text-sm text-surface-100">
                Version #{v.id}
                <span className="text-surface-500"> · {new Date(v.created_at).toLocaleString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-surface-800"
                disabled={restoring === v.id}
                onClick={() => restore(v.id)}
              >
                {restoring === v.id ? "Restoring..." : "Restore to Draft"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
