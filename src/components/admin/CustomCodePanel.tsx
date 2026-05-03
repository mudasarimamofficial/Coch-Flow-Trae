"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { mergeHomepageContent } from "@/utils/homepageMerge";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { Code2, AlertTriangle, Save, RefreshCw } from "lucide-react";

type Props = {
  supabase: SupabaseClient;
};

export function CustomCodePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState<HomepageContent>(homepageDefaults);

  const load = useCallback(async () => {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setContent(homepageDefaults);
        return;
      }
      const c = (data?.content as Partial<HomepageContent> | null) || null;
      setContent(mergeHomepageContent(c));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaved(null);
    setError(null);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("homepage_content")
        .upsert({ id: 1, content }, { onConflict: "id" });
      if (error) {
        setError(error.message);
        return;
      }
      await requestAdminRevalidate(supabase, ["/"]);
      setSaved("Custom code saved successfully and homepage revalidated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 lg:px-8 lg:pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Custom Code</h1>
        <p className="text-sm text-white/60">
          Inject custom CSS and JavaScript globally into the homepage layout.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-amber-200">Advanced Tool Warning</h3>
            <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
              Custom CSS and JS are injected directly into the document `{"<head>"}`. Invalid code can break the layout or cause runtime errors for visitors. Please test your code carefully before saving.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {saved}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/60 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
            <Code2 className="h-4 w-4 text-white/50" />
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">Global CSS</div>
          </div>
          <div className="p-4">
            <Textarea
              value={content.site.customCss || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, customCss: e.target.value },
                }))
              }
              rows={12}
              className="font-mono text-[13px] leading-6 shadow-inner"
              placeholder="/* e.g., body { background: #000; } */"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/60 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
            <Code2 className="h-4 w-4 text-white/50" />
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">Global JavaScript</div>
          </div>
          <div className="p-4">
            <Textarea
              value={content.site.customJs || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, customJs: e.target.value },
                }))
              }
              rows={12}
              className="font-mono text-[13px] leading-6 shadow-inner"
              placeholder="// e.g., console.log('Hello from custom JS');"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 z-10 mx-auto mt-2 flex w-full max-w-4xl items-center justify-between rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/90 px-6 py-4 shadow-2xl backdrop-blur-md">
        <div className="text-xs text-white/50">
          Unsaved changes will be lost if you leave this page.
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 gap-2"
            onClick={load}
            disabled={loading || saving}
          >
            <RefreshCw className="h-4 w-4" />
            Discard
          </Button>
          <Button
            className="h-10 gap-2 bg-[var(--cf-accent)] text-[#0A0F1E] hover:brightness-95"
            disabled={loading || saving}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save Custom Code
          </Button>
        </div>
      </div>
    </div>
  );
}
