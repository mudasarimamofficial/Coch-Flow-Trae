"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { DirectLandingRenderer } from "@/components/landing/DirectLandingRenderer";
import { renderBrandedDefault } from "@/components/landing/CmsDefaultContent";
import type { PageSection } from "@/components/admin/pages/types";

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

  useEffect(() => {
    if (!isBuilderPreview) return;
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "coachflow_page_builder_preview") return;
      if (!data.page || !Array.isArray(data.page.sections)) return;
      setPage({ sections: data.page.sections as PageSection[] });
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [isBuilderPreview]);

  const sections = page.sections || [];
  const enabledSections = sections.filter((s) => s.enabled);
  const hasMeaningful = enabledSections.some(sectionHasMeaningfulContent);
  const showBrandedDefault = !hasMeaningful && !!slug;

  let cmsHtml = "";
  if (showBrandedDefault) {
    const React = require("react");
    const { renderToStaticMarkup } = require("react-dom/server");
    cmsHtml = renderToStaticMarkup(renderBrandedDefault(slug as string, { content: globalContent }));
  } else {
    cmsHtml = enabledSections.map((s) => {
      if (s.type === "rich_text") {
        const settings = (s.settings as any) || {};
        const title = settings.title ? `<h1 style="max-width: 800px; margin: 0 auto 2rem; font-family: 'Bebas Neue', sans-serif; font-size: 3rem; color: var(--gold); text-align: center;">${settings.title}</h1>` : "";
        return `<div class="cms-section-rich-text" style="max-width: 800px; margin: 0 auto; color: var(--white);">${title}${settings.content || ""}</div>`;
      }
      return "";
    }).join("\n");
  }

  return (
    <div className="flex flex-1 flex-col">
      <DirectLandingRenderer
        content={globalContent}
        cmsHtml={cmsHtml}
        context={isBuilderPreview ? "admin-preview" : "cms-subpage"}
      />
    </div>
  );
}
