"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { WhatsAppWidget } from "@/components/landing/WhatsAppWidget";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";
import { SectionErrorBoundary } from "@/components/landing/SectionErrorBoundary";
import { SectionWrapper } from "@/components/landing/SectionWrapper";
import { SECTION_REGISTRY, type PageSection } from "@/components/landing/sectionRegistry";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { buildThemeCssVars } from "@/utils/themeCss";
import { renderBrandedDefault } from "@/components/landing/CmsDefaultContent";

export type CmsPageContent = {
  sections: PageSection[];
};

type Props = {
  globalContent: HomepageContent;
  initialPage: CmsPageContent;
  slug?: string;
  isBuilderPreview?: boolean;
};

function sectionHasMeaningfulContent(s: PageSection | undefined | null): boolean {
  if (!s || s.enabled === false) return false;
  if (s.type !== "rich_text") return true;
  const settings = (s.settings as any) || {};
  const title = String(settings.title || "").trim();
  const html = String(settings.content || "").trim();
  if (!title && !html) return false;
  if (/update this content in admin/i.test(html)) return false;
  return true;
}

export function CmsPageClient({ globalContent, initialPage, slug, isBuilderPreview }: Props) {
  const [page, setPage] = useState<CmsPageContent>(initialPage);
  const [hasPreviewOverride, setHasPreviewOverride] = useState(false);

  useEffect(() => {
    if (!isBuilderPreview) return;
    const device = new URLSearchParams(window.location.search).get("device");
    const d = device === "mobile" || device === "tablet" || device === "desktop" ? device : "desktop";
    document.documentElement.dataset.device = d;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "coachflow_page_builder_preview") return;
      if (!data.page || !Array.isArray(data.page.sections)) return;
      setHasPreviewOverride(true);
      setPage({ sections: data.page.sections as PageSection[] });
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [isBuilderPreview]);

  const resolved = applyBuilderOverrides(globalContent);
  const liveThemeCss = isBuilderPreview ? buildThemeCssVars(resolved) : "";
  const sections = page.sections || [];
  const enabledSections = sections.filter((s) => s.enabled);
  const hasMeaningful = enabledSections.some(sectionHasMeaningfulContent);
  const showBrandedDefault = !hasMeaningful && !!slug;
  const preset = ((resolved.site as any)?.designPreset as string | undefined) || "landing_html_v1";
  const useLanding = preset !== "classic";

  const footerSection = enabledSections.find((s) => s.type === "footer");

  return (
    <div className={`${useLanding ? "cf-landing" : ""} flex flex-1 flex-col`}>
      {isBuilderPreview ? <style id="cf-live-theme-vars" dangerouslySetInnerHTML={{ __html: liveThemeCss }} /> : null}
      <Header content={resolved} />
      <main className="flex-1">
        {showBrandedDefault ? (
          renderBrandedDefault(slug as string, { content: resolved })
        ) : (
          enabledSections.map((s) => {
            if (s.type === "footer") return null;
            const render = SECTION_REGISTRY[s.type];
            if (!render) return null;
            const node = render({ content: resolved, section: s });
            if (!node) return null;
            return (
              <SectionErrorBoundary key={s.id} label={s.type}>
                <SectionWrapper settings={(s.settings as any) || null}>{node}</SectionWrapper>
              </SectionErrorBoundary>
            );
          })
        )}
      </main>
      <Footer content={resolved} section={footerSection} />
      <WhatsAppWidget content={resolved} />
      {isBuilderPreview && !hasPreviewOverride ? (
        <div className="fixed bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50 dark:text-slate-200">
          Waiting for builder preview…
        </div>
      ) : null}
    </div>
  );
}
