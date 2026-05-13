"use client";

import { useEffect, useRef, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { scopeRebuiltTemplate } from "@/utils/scopeTemplate";
import { attachLandingBootstrap, LandingDevice } from "@/utils/landingBootstrap";

type Context = "public" | "admin-preview" | "cms-subpage";

type Props = {
  content: HomepageContent;
  templateHtml?: string;
  cmsHtml?: string;
  device?: LandingDevice;
  className?: string;
  /** Context controls rendering mode:
   *  - "public": default, full normal render
   *  - "admin-preview": contained inside builder panel, fixed nav disabled
   *  - "cms-subpage": subpage /p/[slug], nav links rewritten to /# prefix
   */
  context?: Context;
};

/** CSS injected in admin-preview mode to contain fixed/sticky elements */
const PREVIEW_CONTAINMENT_CSS = `
  /* Admin preview containment - prevent fixed elements from escaping panel */
  .cf-rebuilt-shell nav,
  .cf-rebuilt-shell [style*="position: fixed"],
  .cf-rebuilt-shell [style*="position:fixed"] {
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
  }
  .cf-rebuilt-shell .mobile-menu {
    position: absolute !important;
    top: 60px !important;
  }
  /* Disable animations that might cause overflow */
  .cf-rebuilt-shell .hero-tag,
  .cf-rebuilt-shell .hero h1,
  .cf-rebuilt-shell .hero-sub,
  .cf-rebuilt-shell .hero-actions,
  .cf-rebuilt-shell .hero-note {
    opacity: 1 !important;
    animation: none !important;
  }
`;

/**
 * Rewrite anchor hrefs for subpages so #section becomes /#section (homepage hash navigation).
 * Logo href becomes /.
 */
function rewriteSubpageLinks(html: string): string {
  // Rewrite href="#..." to href="/#..."
  return html.replace(/href="#([^"]+)"/g, 'href="/#$1"');
}

export function DirectLandingRenderer({
  content,
  templateHtml,
  cmsHtml,
  device = "desktop",
  className,
  context = "public",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [fetchedTemplate, setFetchedTemplate] = useState<string | null>(null);
  const [scopedHtml, setScopedHtml] = useState<{
    scopeClass: string;
    css: string;
    bodyHtml: string;
  } | null>(null);
  const currentContentRef = useRef(content);
  currentContentRef.current = content;

  useEffect(() => {
    if (templateHtml && templateHtml.trim().length) return;
    let alive = true;
    fetch("/coachflow-rebuilt-1.html", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`template_fetch_${r.status}`))))
      .then((t) => {
        if (!alive) return;
        setFetchedTemplate(t);
      })
      .catch(() => {
        if (!alive) return;
        setFetchedTemplate("");
      });
    return () => {
      alive = false;
    };
  }, [templateHtml]);

  const baseTemplate = (templateHtml && templateHtml.trim().length ? templateHtml : fetchedTemplate) ?? null;

  useEffect(() => {
    if (baseTemplate) {
      let finalTemplate = baseTemplate;

      // CMS subpage mode: inject CMS content instead of landing sections
      if (cmsHtml !== undefined) {
        // Strip out the main landing sections between <!-- HERO --> and <footer>
        const heroStartIdx = finalTemplate.indexOf("<!-- HERO -->");
        const footerStartIdx = finalTemplate.lastIndexOf("<footer");
        if (heroStartIdx !== -1 && footerStartIdx !== -1 && footerStartIdx > heroStartIdx) {
          finalTemplate =
            finalTemplate.substring(0, heroStartIdx) +
            "\n<main class=\"cf-cms-page\" style=\"min-height: 50vh; padding-top: 8rem; padding-bottom: 4rem;\">\n" +
            cmsHtml +
            "\n</main>\n" +
            finalTemplate.substring(footerStartIdx);
        }
      }

      // Subpage navigation fix: rewrite hash links to absolute homepage links
      if (context === "cms-subpage") {
        finalTemplate = rewriteSubpageLinks(finalTemplate);
      }

      setScopedHtml(scopeRebuiltTemplate(finalTemplate));
    }
  }, [baseTemplate, cmsHtml, context]);

  useEffect(() => {
    if (!scopedHtml || !rootRef.current) return;
    const cleanup = attachLandingBootstrap(rootRef.current, content, device);
    return () => {
      cleanup();
    };
  }, [scopedHtml, content, device]);

  // Dead message listener cleanup (was for old iframe bridge, no longer needed but kept for safety)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      // Intentionally no-op: builder passes content via props, not postMessage
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!scopedHtml) return <div className={className}>Loading...</div>;

  const isAdminPreview = context === "admin-preview";

  return (
    <div className={className}>
      <style dangerouslySetInnerHTML={{ __html: scopedHtml.css }} />
      {/* Admin preview containment: override fixed positioning inside the preview panel */}
      {isAdminPreview && (
        <style dangerouslySetInnerHTML={{ __html: PREVIEW_CONTAINMENT_CSS }} />
      )}
      <div
        ref={rootRef}
        className={scopedHtml.scopeClass}
        dangerouslySetInnerHTML={{ __html: scopedHtml.bodyHtml }}
      />
    </div>
  );
}
