"use client";

import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";

export function FounderInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const f = landing.founder;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Label">
          <Input value={f.label} onChange={(e) => onLandingChange({ ...landing, founder: { ...f, label: e.target.value } })} />
        </Field>
        <Field label="Avatar Letter">
          <Input value={f.avatarText} onChange={(e) => onLandingChange({ ...landing, founder: { ...f, avatarText: e.target.value } })} />
        </Field>
        <Field label="Name">
          <Input value={f.name} onChange={(e) => onLandingChange({ ...landing, founder: { ...f, name: e.target.value } })} />
        </Field>
        <Field label="Title">
          <Input value={f.title} onChange={(e) => onLandingChange({ ...landing, founder: { ...f, title: e.target.value } })} />
        </Field>
      </div>
      <Field label="Quote">
        <Textarea value={f.quote} onChange={(v) => onLandingChange({ ...landing, founder: { ...f, quote: v } })} rows={3} />
      </Field>
      <Field label="Body (HTML)">
        <Textarea value={f.bodyHtml} onChange={(v) => onLandingChange({ ...landing, founder: { ...f, bodyHtml: v } })} rows={8} />
      </Field>
    </div>
  );
}

