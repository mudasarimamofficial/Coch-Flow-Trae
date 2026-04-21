"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { createBrowserSupabaseClient } from "@/utils/supabase/browserClient";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";
import { normalizeHomepageContent } from "@/utils/normalizeHomepageContent";
import { SectionErrorBoundary } from "@/components/landing/SectionErrorBoundary";
import { SectionWrapper } from "@/components/landing/SectionWrapper";
import { SECTION_REGISTRY, type PageSection } from "@/components/landing/sectionRegistry";
import { Header } from "@/components/landing/Header";

type Props = {
  initialContent: HomepageContent;
  isBuilderPreview?: boolean;
};

export function HomepageClient({ initialContent, isBuilderPreview }: Props) {
  const [content, setContent] = useState<HomepageContent>(() => normalizeHomepageContent(initialContent));
  const [hasPreviewOverride, setHasPreviewOverride] = useState(false);

  useEffect(() => {
    if (isBuilderPreview) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("homepage_content_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content", filter: "id=eq.1" },
        async () => {
          const { data } = await supabase
            .from("homepage_content")
            .select("content")
            .eq("id", 1)
            .maybeSingle();
          if (data?.content) setContent(normalizeHomepageContent(data.content as HomepageContent));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isBuilderPreview]);

  useEffect(() => {
    if (!isBuilderPreview) return;
    const device = new URLSearchParams(window.location.search).get("device");
    const d = device === "mobile" || device === "tablet" || device === "desktop" ? device : "desktop";
    document.documentElement.dataset.device = d;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "coachflow_builder_preview") return;
      if (!data.content) return;
      setHasPreviewOverride(true);
      setContent(normalizeHomepageContent(data.content as HomepageContent));
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [isBuilderPreview]);

  const resolved = applyBuilderOverrides(content);

  const sections: PageSection[] = resolved.page?.sections?.length
    ? (resolved.page.sections as PageSection[])
    : ([
        { id: "hero", type: "hero", enabled: true },
        { id: "features", type: "features", enabled: true },
        { id: "workflow", type: "workflow", enabled: true },
        { id: "pricing", type: "pricing", enabled: true },
        { id: "audit-bridge", type: "audit_bridge", enabled: true },
        { id: "application", type: "application", enabled: true },
        { id: "footer", type: "footer", enabled: true },
      ] as PageSection[]);

  const preset = ((resolved.site as any)?.designPreset as string | undefined) || "landing_html_v1";
  const useLanding = preset !== "classic";

  return (
    <div className={`${useLanding ? "cf-landing" : ""} flex flex-1 flex-col`}>
      {sections.find((s) => s.type === "hero")?.enabled !== false ? <Header content={resolved} /> : null}
      <main className="flex-1">
        {sections
          .filter((s) => s.enabled)
          .map((s) => {
            const render = SECTION_REGISTRY[s.type];
            if (!render) return null;
            const node = render({ content: resolved, section: s });
            if (!node) return null;
            return (
              <SectionErrorBoundary key={s.id} label={s.type}>
                <SectionWrapper settings={(s.settings as any) || null}>{node}</SectionWrapper>
              </SectionErrorBoundary>
            );
          })}
      </main>
      <WhatsAppWidget content={resolved} />
      {isBuilderPreview && !hasPreviewOverride ? (
        <div className="fixed bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50 dark:text-slate-200">
          Waiting for builder preview…
        </div>
      ) : null}
    </div>
  );
}
