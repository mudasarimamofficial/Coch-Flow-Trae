"use client";

import { useMemo, type CSSProperties } from "react";
import { landingV1Css } from "@/components/site/landingV1/landingV1Css";
import { PreviewBanner } from "@/components/site/landingV1/PreviewBanner";
import { LandingNav } from "@/components/site/landingV1/Nav";
import { LandingHero } from "@/components/site/landingV1/Hero";
import { LandingFounder } from "@/components/site/landingV1/Founder";
import { LandingPromise } from "@/components/site/landingV1/Promise";
import { LandingHowItWorks } from "@/components/site/landingV1/HowItWorks";
import { LandingHonest } from "@/components/site/landingV1/Honest";
import { LandingPricing } from "@/components/site/landingV1/Pricing";
import { LandingApply } from "@/components/site/landingV1/Apply";
import { LandingFooter } from "@/components/site/landingV1/Footer";
import { useCustomCode } from "@/components/site/useCustomCode";
import {
  pickBuilderState,
  pickLanding,
  type LandingSection,
} from "@/components/site/landingV1/sections";
import { CustomHtmlSection } from "@/components/site/landingV1/CustomHtmlSection";
import { WhatsAppFloat } from "@/components/site/landingV1/WhatsAppFloat";
import { CtaBlockSection } from "@/components/site/landingV1/CtaBlockSection";

export function LandingV1({
  content,
  previewBanner,
  builderMode,
  selectedSectionId,
}: {
  content?: unknown;
  previewBanner?: boolean;
  builderMode?: boolean;
  selectedSectionId?: string | null;
}) {
  const landing = useMemo(() => pickLanding(content), [content]);
  const builder = useMemo(() => pickBuilderState(content), [content]);
  useCustomCode(content);

  const themeCss = useMemo(() => {
    const root = (content && typeof content === "object" ? (content as any) : null) as any;
    const t = root?.landingTheme;
    if (!t || typeof t !== "object") return "";
    const lines: string[] = [];
    const set = (key: string, v: unknown) => {
      if (typeof v !== "string") return;
      const s = v.trim();
      if (!s) return;
      lines.push(`${key}: ${s};`);
    };
    set("--gold", t.gold);
    set("--gold-light", t.goldLight);
    set("--gold-dim", t.goldDim);
    set("--black", t.black);
    set("--white", t.white);
    set("--charcoal", t.charcoal);
    set("--mid", t.mid);
    set("--muted", t.muted);
    const f = root?.landingFonts;
    if (f && typeof f === "object") {
      set("--font-body", (f as any).body);
      set("--font-heading", (f as any).heading);
      set("--font-serif", (f as any).serif);
    }
    if (!lines.length) return "";
    return `:root{${lines.join("")}}`;
  }, [content]);

  return (
    <div className="cf-landing">
      <style dangerouslySetInnerHTML={{ __html: landingV1Css }} />
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      {builderMode ? (
        <style
          dangerouslySetInnerHTML={{
            __html:
              ".cf-builder-frame{position:relative;outline:1px solid transparent;outline-offset:-1px;}" +
              ".cf-builder-frame:hover{outline-color:rgba(201,168,76,0.22);}" +
              ".cf-builder-selected{outline-color:rgba(201,168,76,0.65) !important;}" +
              ".cf-builder-badge{position:absolute;left:14px;top:10px;font:600 11px/1 var(--font-body);letter-spacing:0.06em;text-transform:uppercase;color:rgba(10,10,10,0.9);background:rgba(201,168,76,0.95);padding:6px 8px;border-radius:4px;z-index:20;}",
          }}
        />
      ) : null}
      {previewBanner ? <PreviewBanner /> : null}

      {builder.sections.map((s) =>
        s.enabled ? (
          <BuilderFrame
            key={s.id}
            sectionId={s.id}
            sectionLabel={labelForType(s.type)}
            layout={pickLayout(s.props)}
            sectionType={s.type}
            builderMode={builderMode}
            selectedSectionId={selectedSectionId}
          >
            <LandingSectionRenderer section={s} landing={landing} />
          </BuilderFrame>
        ) : null,
      )}

      <WhatsAppFloat config={(content && typeof content === "object" ? (content as any).whatsappWidget : undefined) as any} />
    </div>
  );
}

function BuilderFrame({
  sectionId,
  sectionLabel,
  sectionType,
  layout,
  builderMode,
  selectedSectionId,
  children,
}: {
  sectionId: string;
  sectionLabel: string;
  sectionType: LandingSection["type"];
  layout: SectionLayout;
  builderMode?: boolean;
  selectedSectionId?: string | null;
  children: React.ReactNode;
}) {
  const selected = Boolean(builderMode && selectedSectionId && selectedSectionId === sectionId);
  const wrapLayout = sectionType !== "nav";
  const style = wrapLayout ? layoutStyle(layout) : undefined;
  return (
    <div
      data-section-id={sectionId}
      className={builderMode ? `cf-builder-frame ${selected ? "cf-builder-selected" : ""}` : undefined}
      onClickCapture={(e) => {
        if (!builderMode) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          window.parent.postMessage({ type: "coachflow_builder_select_section", sectionId }, window.location.origin);
        } catch {}
      }}
    >
      {builderMode ? <div className="cf-builder-badge">{sectionLabel}</div> : null}
      {wrapLayout ? <div style={style}>{children}</div> : children}
    </div>
  );
}

type SectionLayout = {
  align?: "left" | "center" | "right";
  width?: "default" | "wide" | "full";
  spacing?: "normal" | "loose";
  columns?: "one" | "two";
};

function labelForType(type: LandingSection["type"]) {
  if (type === "nav") return "Navigation";
  if (type === "hero") return "Hero";
  if (type === "divider") return "Divider";
  if (type === "trust") return "Trust Strip";
  if (type === "founder") return "Founder";
  if (type === "promise") return "Commitments";
  if (type === "how") return "How It Works";
  if (type === "honest") return "Honest Part";
  if (type === "pricing") return "Pricing";
  if (type === "apply") return "Apply";
  if (type === "footer") return "Footer";
  if (type === "ctaBlock") return "CTA Block";
  if (type === "customHtml") return "Custom HTML";
  return "Section";
}

function pickLayout(props: LandingSection["props"]): SectionLayout {
  const raw = props && typeof props === "object" ? ((props as any).layout as any) : null;
  const v = raw && typeof raw === "object" ? raw : {};
  const align = v.align === "center" || v.align === "right" ? v.align : "left";
  const width = v.width === "wide" || v.width === "full" ? v.width : "default";
  const spacing = v.spacing === "loose" ? "loose" : "normal";
  const columns = v.columns === "two" ? "two" : "one";
  return { align, width, spacing, columns };
}

function layoutStyle(layout: SectionLayout) {
  const style: any = {};
  if (layout.align) style.textAlign = layout.align;
  if (layout.width === "wide") {
    style.maxWidth = 1400;
    style.marginInline = "auto";
  }
  if (layout.width === "full") {
    style.maxWidth = "100%";
  }
  if (layout.spacing === "loose") {
    style.paddingBlock = 24;
  }
  return style as CSSProperties;
}

function LandingSectionRenderer({
  section,
  landing,
}: {
  section: LandingSection;
  landing: ReturnType<typeof pickLanding>;
}) {
  if (section.type === "nav") return <LandingNav nav={landing.nav} />;
  if (section.type === "hero") return <LandingHero hero={landing.hero} />;
  if (section.type === "divider") return <div className="divider" />;
  if (section.type === "trust") {
    return (
      <div className="trust-strip">
        {landing.trustStrip.map((t) => (
          <div key={t} className="trust-item">
            {t}
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "founder") return <LandingFounder founder={landing.founder} />;
  if (section.type === "promise") return <LandingPromise promise={landing.promise} />;
  if (section.type === "how") return <LandingHowItWorks how={landing.howItWorks} />;
  if (section.type === "honest") return <LandingHonest honest={landing.honest} />;
  if (section.type === "pricing") return <LandingPricing pricing={landing.pricing} />;
  if (section.type === "apply") return <LandingApply apply={landing.apply} />;
  if (section.type === "footer") return <LandingFooter footer={landing.footer} />;
  if (section.type === "ctaBlock") {
    const p = section.props || {};
    const title = typeof p.title === "string" ? p.title : "Ready to apply?";
    const body = typeof p.body === "string" ? p.body : "";
    const buttonLabel = typeof p.buttonLabel === "string" ? p.buttonLabel : "Apply Now";
    const buttonHref = typeof p.buttonHref === "string" ? p.buttonHref : "#apply";
    const layout = pickLayout(section.props);
    return (
      <CtaBlockSection
        title={title}
        body={body}
        buttonLabel={buttonLabel}
        buttonHref={buttonHref}
        columns={layout.columns}
        align={layout.align}
      />
    );
  }
  if (section.type === "customHtml") {
    const p = section.props || {};
    const title = typeof p.title === "string" ? p.title : undefined;
    const body = typeof p.body === "string" ? p.body : undefined;
    const html = typeof p.html === "string" ? p.html : undefined;
    return <CustomHtmlSection title={title} body={body} html={html} />;
  }
  return null;
}
