"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { mergeHomepageContent } from "@/utils/homepageMerge";
import { AlertTriangle, Save, RefreshCw, FileJson } from "lucide-react";

type Props = {
  supabase: SupabaseClient;
};

export function HomepagePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState<HomepageContent>(homepageDefaults);
  
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const resetJsonDraft = useCallback((c: HomepageContent) => {
    setJsonDraft(JSON.stringify(c, null, 2));
    setJsonError(null);
  }, []);

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
        resetJsonDraft(homepageDefaults);
        return;
      }
      const c = (data?.content as Partial<HomepageContent> | null) || null;
      const merged = mergeHomepageContent(c);
      setContent(merged);
      resetJsonDraft(merged);
    } finally {
      setLoading(false);
    }
  }, [supabase, resetJsonDraft]);

  useEffect(() => {
    load();
  }, [load]);

  const applyJsonDraft = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonDraft);
      const merged = mergeHomepageContent(parsed);
      setContent(merged);
      setJsonDraft(JSON.stringify(merged, null, 2));
      setJsonError(null);
      return merged;
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
      return null;
    }
  }, [jsonDraft]);

  const handleSave = async () => {
    const merged = applyJsonDraft();
    if (!merged) return;

    setSaved(null);
    setError(null);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("homepage_content")
        .upsert({ id: 1, content: merged }, { onConflict: "id" });
      if (error) {
        setError(error.message);
        return;
      }
      await requestAdminRevalidate(supabase, ["/"]);
      setSaved("JSON saved successfully and homepage revalidated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-12 pt-4 lg:px-8 lg:pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">JSON Editor</h1>
        <p className="text-sm text-white/60">
          Advanced direct access to the homepage content JSON payload.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-amber-200">Advanced Tool Warning</h3>
            <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
              This editor provides raw access to the entire homepage payload. Structural errors or invalid keys will be discarded upon saving, but changing valid keys can alter or break the live site layout. Proceed with caution.
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--cf-secondary)]/60 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
          <FileJson className="h-4 w-4 text-white/50" />
          <div className="text-xs font-bold uppercase tracking-wider text-white/70">homepage_content.json</div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <Textarea
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value);
              setJsonError(null);
              setSaved(null);
            }}
            rows={25}
            className="flex-1 font-mono text-[13px] leading-6 shadow-inner"
            error={jsonError || undefined}
            spellCheck={false}
          />
        </div>
        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-4">
          <div className="text-xs text-white/50">
            Updates will overwrite the published content instantly.
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="h-10 gap-2"
              onClick={() => resetJsonDraft(content)}
              disabled={loading || saving}
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              className="h-10 gap-2 bg-[var(--cf-accent)] text-[#0A0F1E] hover:brightness-95"
              disabled={loading || saving}
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              Save JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
