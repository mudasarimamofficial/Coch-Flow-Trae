"use client";

import { Badge } from "@/components/ui/badge";
import type { LandingSection } from "@/components/site/landingV1/sections";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { labelForType } from "@/components/admin/builder/model";
import { NavInspector } from "@/components/admin/builder/inspectors/NavInspector";
import { HeroInspector } from "@/components/admin/builder/inspectors/HeroInspector";
import { TrustInspector } from "@/components/admin/builder/inspectors/TrustInspector";
import { FounderInspector } from "@/components/admin/builder/inspectors/FounderInspector";
import { HonestInspector } from "@/components/admin/builder/inspectors/HonestInspector";
import { PricingInspector } from "@/components/admin/builder/inspectors/PricingInspector";
import { ApplyInspector } from "@/components/admin/builder/inspectors/ApplyInspector";
import { FooterInspector } from "@/components/admin/builder/inspectors/FooterInspector";
import { CustomHtmlInspector } from "@/components/admin/builder/inspectors/CustomHtmlInspector";
import { CtaBlockInspector } from "@/components/admin/builder/inspectors/CtaBlockInspector";
import { PromiseInspector } from "@/components/admin/builder/inspectors/PromiseInspector";
import { HowInspector } from "@/components/admin/builder/inspectors/HowInspector";
import { SectionLayoutInspector, type SectionLayout } from "@/components/admin/builder/inspectors/SectionLayoutInspector";

export function InspectorPanel({
  section,
  landing,
  onLandingChange,
  onSectionPropsChange,
}: {
  section: LandingSection | null;
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
  onSectionPropsChange: (sectionId: string, props: Record<string, unknown>) => void;
}) {
  return (
    <aside className="flex max-h-[640px] w-full shrink-0 flex-col overflow-hidden border-t border-surface-800 bg-surface-950 lg:max-h-none lg:w-[420px] lg:border-l lg:border-t-0">
      <div className="h-14 px-6 flex items-center justify-between border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">Inspector</div>
          {section ? <Badge variant={section.enabled ? "success" : "outline"}>{section.enabled ? "Enabled" : "Disabled"}</Badge> : null}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-6">
        <div>
          <div className="text-xs text-surface-500 uppercase tracking-wider mb-1">Section</div>
          <div className="text-lg font-semibold text-white">{section ? labelForType(section.type) : "Select a section"}</div>
          {section ? <div className="text-xs text-surface-500 mt-1">{section.id}</div> : null}
        </div>

        {!section ? <div className="text-sm text-surface-500">Choose a section on the left to edit it.</div> : null}

        {section ? (
          <SectionLayoutInspector
            value={(section.props?.layout as SectionLayout | undefined) || undefined}
            onChange={(next) => onSectionPropsChange(section.id, { layout: next })}
          />
        ) : null}

        {section?.type === "nav" ? <NavInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "hero" ? <HeroInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "trust" ? <TrustInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "founder" ? <FounderInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "promise" ? <PromiseInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "how" ? <HowInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "honest" ? <HonestInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "pricing" ? <PricingInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "apply" ? <ApplyInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "footer" ? <FooterInspector landing={landing} onLandingChange={onLandingChange} /> : null}
        {section?.type === "ctaBlock" ? (
          <CtaBlockInspector section={section} onSectionPropsChange={onSectionPropsChange} />
        ) : null}
        {section?.type === "customHtml" ? (
          <CustomHtmlInspector section={section} onSectionPropsChange={onSectionPropsChange} />
        ) : null}
      </div>
    </aside>
  );
}
