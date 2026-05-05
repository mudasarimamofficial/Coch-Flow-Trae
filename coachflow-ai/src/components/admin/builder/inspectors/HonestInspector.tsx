"use client";

import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, StringListEditor, Textarea } from "@/components/admin/builder/inspectors/common";

export function HonestInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const h = landing.honest;
  return (
    <div className="space-y-6">
      <Field label="Section Tag">
        <Input value={h.sectionTag} onChange={(e) => onLandingChange({ ...landing, honest: { ...h, sectionTag: e.target.value } })} />
      </Field>
      <Field label="Quote">
        <Textarea value={h.quote} onChange={(v) => onLandingChange({ ...landing, honest: { ...h, quote: v } })} rows={4} />
      </Field>
      <Field label="Body (HTML)">
        <Textarea value={h.bodyHtml} onChange={(v) => onLandingChange({ ...landing, honest: { ...h, bodyHtml: v } })} rows={8} />
      </Field>
      <Field label="Pledge Title">
        <Input value={h.pledgeTitle} onChange={(e) => onLandingChange({ ...landing, honest: { ...h, pledgeTitle: e.target.value } })} />
      </Field>
      <Field label="Pledge Items">
        <StringListEditor
          items={h.pledgeItems}
          onChange={(v) => onLandingChange({ ...landing, honest: { ...h, pledgeItems: v } })}
          placeholder="New pledge"
        />
      </Field>
    </div>
  );
}

