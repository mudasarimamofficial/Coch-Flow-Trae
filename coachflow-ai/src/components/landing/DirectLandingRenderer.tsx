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

  .cf-rebuilt-shell[data-cf-preview-device="desktop"] nav {
    padding: 1.25rem 4rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .nav-links {
    display: flex !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .nav-hamburger {
    display: none !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .hero {
    padding: 8rem 4rem 5rem !important;
    min-height: 100vh !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .hero h1 {
    font-size: clamp(4rem, 8vw, 7.5rem) !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .hero-sub {
    font-size: 1.2rem !important;
    margin-bottom: 3rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .hero-actions {
    flex-direction: row !important;
    align-items: center !important;
    gap: 1rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .btn-primary,
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .btn-ghost {
    width: auto !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .founder {
    grid-template-columns: 1fr 1.4fr !important;
    gap: 6rem !important;
    padding: 6rem 4rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .trust-strip {
    padding: 1.5rem 4rem !important;
    flex-direction: row !important;
    align-items: center !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] section {
    padding: 7rem 4rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .promise-grid {
    grid-template-columns: 1fr 1fr !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .honest-inner,
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .form-inner {
    grid-template-columns: 1fr 1.1fr !important;
    gap: 6rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .tiers {
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] .form-row {
    grid-template-columns: 1fr 1fr !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="desktop"] footer {
    flex-direction: row !important;
    text-align: left !important;
    padding: 2.5rem 4rem !important;
  }

  .cf-rebuilt-shell[data-cf-preview-device="tablet"] nav,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] nav {
    padding: 1rem 1.5rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .nav-links,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .nav-links {
    display: none !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .nav-hamburger,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .nav-hamburger {
    display: flex !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .hero,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .hero {
    padding: 7rem 1.5rem 4rem !important;
    min-height: 90vh !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .hero h1,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .hero h1 {
    font-size: clamp(3rem, 14vw, 4.5rem) !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .hero-sub,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .hero-sub {
    font-size: 1rem !important;
    margin-bottom: 2rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .hero-actions,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .hero-actions {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .btn-primary,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .btn-ghost,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .btn-primary,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .btn-ghost {
    width: 100% !important;
    text-align: center !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .founder,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .founder,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .honest-inner,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .honest-inner,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .form-inner,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .form-inner {
    grid-template-columns: 1fr !important;
    gap: 2.5rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .founder,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .founder,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] section,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] section,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .honest,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .honest,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .founding,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .founding,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .form-section,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .form-section {
    padding: 4rem 1.5rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .trust-strip,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .trust-strip {
    padding: 1.5rem !important;
    gap: 1rem !important;
    justify-content: flex-start !important;
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .promise-grid,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .promise-grid,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .tiers,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .tiers,
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .form-row,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .form-row {
    grid-template-columns: 1fr !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .founding-header,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .founding-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .founding-header p,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .founding-header p {
    max-width: 100% !important;
    text-align: left !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .tier.featured,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .tier.featured {
    margin: 0 !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] footer,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] footer {
    flex-direction: column !important;
    text-align: center !important;
    padding: 2rem 1.5rem !important;
    gap: 1.25rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="tablet"] .footer-links,
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .footer-links {
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 1rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .hero h1 {
    font-size: clamp(2.75rem, 16vw, 3.5rem) !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .section-title {
    font-size: clamp(2rem, 10vw, 2.5rem) !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .promise-num {
    font-size: 2.5rem !important;
  }
  .cf-rebuilt-shell[data-cf-preview-device="mobile"] .tier-price-num {
    font-size: 2.25rem !important;
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

function rewriteMountedSubpageLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.length > 1) a.setAttribute("href", `/${href}`);
  });
}

function stripMountedInlineHandlers(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[onclick]").forEach((el) => {
    el.removeAttribute("onclick");
  });
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
    stripMountedInlineHandlers(rootRef.current);
    const cleanup = attachLandingBootstrap(rootRef.current, content, device, {
      scopeDeviceToRoot: context === "admin-preview",
    });
    if (context === "cms-subpage") rewriteMountedSubpageLinks(rootRef.current);
    return () => {
      cleanup();
    };
  }, [scopedHtml, content, device, context]);

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
        data-cf-preview-device={isAdminPreview ? device : undefined}
        dangerouslySetInnerHTML={{ __html: scopedHtml.bodyHtml }}
      />
    </div>
  );
}
