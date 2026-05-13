"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Select } from "@/components/ui/Select";
import { normalizeSlug, type PageSection } from "@/components/admin/pages/types";
import { DirectLandingRenderer } from "@/components/landing/DirectLandingRenderer";
import { homepageDefaults } from "@/content/homepage";

type Props = {
  slug: string;
  mode: "desktop" | "tablet" | "mobile";
  onModeChange: (mode: "desktop" | "tablet" | "mobile") => void;
  sections: PageSection[];
};

const DEVICE_WIDTHS = { desktop: 1440, tablet: 768, mobile: 375 } as const;

function buildCmsHtml(sections: PageSection[]): string {
  const enabled = sections.filter((s) => s.enabled !== false);
  if (!enabled.length) {
    return `<p style="color:rgba(245,242,237,0.5);text-align:center;padding:4rem 2rem;">No content yet — add sections in the editor.</p>`;
  }
  return enabled
    .map((s) => {
      if (s.type === "rich_text") {
        const set = (s.settings as any) || {};
        const title = set.title
          ? `<h1 style="max-width:800px;margin:0 auto 2rem;font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--gold);text-align:center">${set.title}</h1>`
          : "";
        return `<div class="cms-section-rich-text" style="max-width:800px;margin:0 auto;color:var(--white)">${title}${set.content || ""}</div>`;
      }
      return "";
    })
    .join("\n");
}

export function PagePreview({ slug, mode, onModeChange, sections }: Props) {
  const cmsHtml = useMemo(() => buildCmsHtml(sections), [sections]);
  const deviceWidth = DEVICE_WIDTHS[mode];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function recalc() {
      if (!el) return;
      const availW = Math.max(el.clientWidth - 24, 100);
      setScale(Math.min(1, availW / deviceWidth));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [deviceWidth]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-[var(--cf-secondary)]/60 px-4 py-3 text-sm">
        <div className="font-bold text-white">
          Preview — /p/{normalizeSlug(slug) || "(slug)"}
        </div>
        <Select
          label=""
          value={mode}
          onChange={(e) => onModeChange(e.target.value as any)}
          options={[
            { value: "desktop", label: "Desktop" },
            { value: "tablet", label: "Tablet" },
            { value: "mobile", label: "Mobile" },
          ]}
        />
      </div>
      {/* Direct DOM preview — no iframe, no public iframe pollution */}
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto p-3 flex items-start justify-center">
        <div
          style={{
            width: deviceWidth,
            flexShrink: 0,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#0A0F1E",
            boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <DirectLandingRenderer
            content={homepageDefaults}
            cmsHtml={cmsHtml}
            device={mode}
            context="admin-preview"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
