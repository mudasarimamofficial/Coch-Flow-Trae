"use client";

import { useEffect, useState } from "react";
import { Code2, Save, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function CustomCodePage() {
  const adminFetch = useAdminFetch();
  const [css, setCss] = useState("");
  const [head, setHead] = useState("");
  const [bodyEnd, setBodyEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [baseContent, setBaseContent] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        const content = (j.draft?.content && Object.keys(j.draft.content).length ? j.draft.content : j.published?.content) ?? {};
        setBaseContent(content);
        setCss(String((content as any)?.customCss ?? ""));
        setHead(String((content as any)?.customHead ?? ""));
        setBodyEnd(String((content as any)?.customBodyEnd ?? ""));
        setPublishedUpdatedAt(j.draft?.published_updated_at ?? j.published?.updated_at ?? null);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  async function saveDraft() {
    setSaving(true);
    try {
      const next = { ...baseContent, customCss: css, customHead: head, customBodyEnd: bodyEnd };
      const res = await adminFetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: next, published_updated_at: publishedUpdatedAt }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) setBaseContent(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Custom Code</h1>
          <p className="text-surface-400 text-sm">Saved into homepage draft, applied on publish.</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={saveDraft} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader className="py-4 border-b border-surface-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-brand-400" />
              <CardTitle className="text-sm font-medium">Head Code (meta/CSS)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-[#0d0d0d] h-[260px]">
            <textarea
              className="w-full h-full bg-transparent text-sm font-mono text-surface-100 p-4 focus:outline-none resize-none leading-relaxed"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4 border-b border-surface-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium">Custom CSS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-[#0d0d0d] h-[220px]">
            <textarea
              className="w-full h-full bg-transparent text-sm font-mono text-surface-100 p-4 focus:outline-none resize-none leading-relaxed"
              value={css}
              onChange={(e) => setCss(e.target.value)}
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4 border-b border-surface-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-surface-400" />
              <CardTitle className="text-sm font-medium">Body End Code (scripts)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-[#0d0d0d] h-[220px]">
            <textarea
              className="w-full h-full bg-transparent text-sm font-mono text-surface-100 p-4 focus:outline-none resize-none leading-relaxed"
              value={bodyEnd}
              onChange={(e) => setBodyEnd(e.target.value)}
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
