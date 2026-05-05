"use client";

import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";

export function HeroInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const h = landing.hero;
  return (
    <div className="space-y-6">
      <Field label="Hero Tag">
        <Input value={h.tag} onChange={(e) => onLandingChange({ ...landing, hero: { ...h, tag: e.target.value } })} />
      </Field>
      <Field label="Headline (HTML)">
        <Textarea value={h.headlineHtml} onChange={(v) => onLandingChange({ ...landing, hero: { ...h, headlineHtml: v } })} rows={3} />
      </Field>
      <Field label="Subheading (HTML)">
        <Textarea value={h.subHtml} onChange={(v) => onLandingChange({ ...landing, hero: { ...h, subHtml: v } })} rows={5} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Primary CTA Label">
          <Input
            value={h.primaryCta.label}
            onChange={(e) => onLandingChange({ ...landing, hero: { ...h, primaryCta: { ...h.primaryCta, label: e.target.value } } })}
          />
        </Field>
        <Field label="Primary CTA Href">
          <Input
            value={h.primaryCta.href}
            onChange={(e) => onLandingChange({ ...landing, hero: { ...h, primaryCta: { ...h.primaryCta, href: e.target.value } } })}
          />
        </Field>
        <Field label="Secondary CTA Label">
          <Input
            value={h.secondaryCta.label}
            onChange={(e) => onLandingChange({ ...landing, hero: { ...h, secondaryCta: { ...h.secondaryCta, label: e.target.value } } })}
          />
        </Field>
        <Field label="Secondary CTA Href">
          <Input
            value={h.secondaryCta.href}
            onChange={(e) => onLandingChange({ ...landing, hero: { ...h, secondaryCta: { ...h.secondaryCta, href: e.target.value } } })}
          />
        </Field>
      </div>
      <Field label="Note">
        <Input value={h.note} onChange={(e) => onLandingChange({ ...landing, hero: { ...h, note: e.target.value } })} />
      </Field>
    </div>
  );
}

