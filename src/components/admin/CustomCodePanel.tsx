import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";

type Props = {
  supabase: SupabaseClient;
};

export function CustomCodePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState<HomepageContent>(homepageDefaults);

  async function load() {
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
      const c = (data?.content as HomepageContent | null) || null;
      setContent(c && c.header?.brandText ? c : homepageDefaults);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Custom Code</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Add custom CSS/JS injected into the homepage layout.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          {saved}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#112121]">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Custom CSS"
            value={content.site.customCss || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                site: { ...c.site, customCss: e.target.value },
              }))
            }
            rows={10}
          />
          <Textarea
            label="Custom JS"
            value={content.site.customJs || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                site: { ...c.site, customJs: e.target.value },
              }))
            }
            rows={10}
          />
          <div className="flex items-center gap-3">
            <Button
              className="h-12"
              disabled={loading || saving}
              onClick={async () => {
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
                  setSaved("Saved");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
            <Button variant="secondary" className="h-12" onClick={load} disabled={loading || saving}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

