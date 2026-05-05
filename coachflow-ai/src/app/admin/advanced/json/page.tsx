"use client";

import { useEffect, useState } from "react";
import { Braces, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function JsonEditorPage() {
  const adminFetch = useAdminFetch();
  const [text, setText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        const content = (j.draft?.content && Object.keys(j.draft.content).length ? j.draft.content : j.published?.content) ?? {};
        setText(JSON.stringify(content, null, 2));
        setPublishedUpdatedAt(j.draft?.published_updated_at ?? j.published?.updated_at ?? null);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  async function saveDraft() {
    setSaving(true);
    try {
      const parsed = JSON.parse(text);
      const res = await adminFetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: parsed, published_updated_at: publishedUpdatedAt }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) setPublishedUpdatedAt(j.published_updated_at ?? publishedUpdatedAt);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">JSON Configuration</h1>
          <p className="text-surface-400 text-sm">Edits the homepage draft JSON directly.</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={saveDraft} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </div>

      <Card className="flex flex-col h-[640px]">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <Braces className="h-4 w-4 text-surface-400" />
            <CardTitle className="text-sm font-mono text-surface-300">homepage.json</CardTitle>
          </div>
          <CardDescription className="text-xs">Draft workspace</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 bg-[#0d0d0d]">
          <textarea
            className="w-full h-full bg-transparent text-sm font-mono text-surface-100 p-4 focus:outline-none resize-none leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

