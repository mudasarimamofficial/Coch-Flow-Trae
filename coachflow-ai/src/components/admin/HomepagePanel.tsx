import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { mergeHomepageContent } from "@/utils/homepageMerge";

type Props = {
  supabase: SupabaseClient;
};

const CURRENT_SECTION_TYPES = new Set([
  "hero",
  "trust_strip",
  "founder",
  "promise",
  "how",
  "honest",
  "pricing",
  "application",
  "footer",
  "custom_html",
  "custom",
]);

function compactCanonicalContent(input: Partial<HomepageContent> | null | undefined) {
  const content = mergeHomepageContent(input || homepageDefaults);
  return {
    site: {
      favicon: content.site.favicon,
      designPreset: "landing_html_v1",
      theme: content.site.theme,
      customCss: content.site.customCss || "",
      customJs: content.site.customJs || "",
    },
    branding: content.branding,
    header: content.header,
    hero: {
      primaryCta: content.hero.primaryCta,
      secondaryCta: content.hero.secondaryCta,
      backgroundImage: content.hero.backgroundImage,
      mobileBackgroundImage: content.hero.mobileBackgroundImage,
    },
    rebuilt: content.rebuilt,
    pricing: content.pricing,
    application: content.application,
    footer: content.footer,
    socialLinksV2: content.socialLinksV2,
    whatsapp: content.whatsapp,
    page: {
      sections: (content.page?.sections || homepageDefaults.page?.sections || []).filter((section) =>
        CURRENT_SECTION_TYPES.has(String(section?.type || "")),
      ),
    },
    customSections: content.customSections || [],
  };
}

function validateCanonicalJson(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "Homepage JSON must be an object.";
  }
  const v = value as Record<string, any>;
  if (v.site?.designPreset && v.site.designPreset !== "landing_html_v1") {
    return "Design preset must remain landing_html_v1 for the current Coachflow Aquisition landing.";
  }
  const sections = v.page?.sections;
  if (!Array.isArray(sections)) return "page.sections must be an array.";
  const seen = new Set<string>();
  for (const section of sections) {
    const type = String(section?.type || "");
    if (!CURRENT_SECTION_TYPES.has(type)) return `Unsupported current landing section type: ${type || "(blank)"}.`;
    if (seen.has(type) && type !== "custom_html" && type !== "custom") {
      return `Duplicate fixed section type is not supported by the current landing: ${type}.`;
    }
    seen.add(type);
  }
  if (v.rebuilt?.founder?.image && typeof v.rebuilt.founder.image.url !== "string") {
    return "rebuilt.founder.image.url must be a string when founder image is set.";
  }
  return null;
}

export function HomepagePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  const schemaSummary = useMemo(
    () => [
      "site: favicon, current landing theme, custom code",
      "header: brand, navigation, top CTA",
      "rebuilt: hero, trust strip, founder, promise, how, honest",
      "pricing/application/footer/socialLinksV2/whatsapp",
      "page.sections: current landing section order and visibility",
    ],
    [],
  );

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, [supabase]);

  const load = useCallback(async () => {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setError("Missing admin session.");
        return;
      }
      const res = await fetch("/api/admin/homepage", {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to load homepage JSON.");
        return;
      }
      const draftContent = json.draft?.content && Object.keys(json.draft.content || {}).length ? json.draft.content : null;
      const source = draftContent || json.published?.content || homepageDefaults;
      setHasDraft(Boolean(draftContent));
      setPublishedUpdatedAt(String(json.published?.updated_at || ""));
      setJsonDraft(JSON.stringify(compactCanonicalContent(source), null, 2));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedFromDraft = useCallback(() => {
    const parsed = JSON.parse(jsonDraft) as unknown;
    const validationError = validateCanonicalJson(parsed);
    if (validationError) throw new Error(validationError);
    return compactCanonicalContent(parsed as Partial<HomepageContent>);
  }, [jsonDraft]);

  async function saveDraft() {
    setError(null);
    setSaved(null);
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        setError("Missing admin session.");
        return;
      }
      const normalized = normalizedFromDraft();
      setJsonDraft(JSON.stringify(normalized, null, 2));
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "save-draft",
          content: normalized,
          publishedUpdatedAt,
        }),
      });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to save JSON draft.");
        return;
      }
      setHasDraft(true);
      setSaved("Canonical JSON draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    } finally {
      setSaving(false);
    }
  }

  async function publishDraft() {
    setError(null);
    setSaved(null);
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        setError("Missing admin session.");
        return;
      }
      const normalized = normalizedFromDraft();
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "publish", content: normalized }),
      });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to publish JSON.");
        return;
      }
      await requestAdminRevalidate(supabase, ["/"]);
      setPublishedUpdatedAt(String(json.updatedAt || ""));
      setHasDraft(false);
      setSaved("Canonical JSON published.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    } finally {
      setSaving(false);
    }
  }

  async function revertDraft() {
    setError(null);
    setSaved(null);
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        setError("Missing admin session.");
        return;
      }
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "revert" }),
      });
      const json = (await res.json().catch(() => null)) as any;
      if (!res.ok || !json?.ok) {
        setError(json?.message || "Failed to revert draft.");
        return;
      }
      setHasDraft(false);
      setSaved("Draft reverted to published content.");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-10 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced JSON</h1>
          <p className="mt-1 text-sm text-white/60">
            Current landing schema only. Old classic fields are hidden from this client-facing editor.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
          {hasDraft ? "Draft loaded" : "Published loaded"}
        </span>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Textarea
            label="Canonical homepage JSON"
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value);
              setError(null);
              setSaved(null);
            }}
            rows={28}
            className="font-mono text-xs leading-5"
            spellCheck={false}
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" className="h-10" disabled={loading || saving} onClick={saveDraft}>
              Save Draft
            </Button>
            <Button type="button" className="h-10" disabled={loading || saving} onClick={publishDraft}>
              Publish JSON
            </Button>
            <Button type="button" variant="secondary" className="h-10" disabled={loading || saving} onClick={load}>
              Reload
            </Button>
            <Button type="button" variant="secondary" className="h-10" disabled={loading || saving || !hasDraft} onClick={revertDraft}>
              Revert Draft
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-bold text-white">Schema guide</div>
          <div className="mt-3 flex flex-col gap-2">
            {schemaSummary.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs leading-5 text-white/65">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-100/85">
            Publish creates a version backup first. Use the builder for normal editing; use JSON only for advanced recovery or bulk edits.
          </div>
        </aside>
      </div>
    </div>
  );
}
