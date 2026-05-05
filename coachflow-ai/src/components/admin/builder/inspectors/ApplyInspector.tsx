"use client";

import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, StringListEditor, Textarea } from "@/components/admin/builder/inspectors/common";

export function ApplyInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const a = landing.apply;
  return (
    <div className="space-y-6">
      <Field label="Section Tag">
        <Input value={a.sectionTag} onChange={(e) => onLandingChange({ ...landing, apply: { ...a, sectionTag: e.target.value } })} />
      </Field>
      <Field label="Title (HTML)">
        <Textarea value={a.titleHtml} onChange={(v) => onLandingChange({ ...landing, apply: { ...a, titleHtml: v } })} rows={3} />
      </Field>
      <Field label="Body">
        <Textarea value={a.body} onChange={(v) => onLandingChange({ ...landing, apply: { ...a, body: v } })} rows={4} />
      </Field>
      <Field label="Form Title">
        <Input value={a.form.title} onChange={(e) => onLandingChange({ ...landing, apply: { ...a, form: { ...a.form, title: e.target.value } } })} />
      </Field>
      <Field label="Form Subtitle">
        <Textarea value={a.form.subtitle} onChange={(v) => onLandingChange({ ...landing, apply: { ...a, form: { ...a.form, subtitle: v } } })} rows={3} />
      </Field>
      <Field label="Revenue Options">
        <StringListEditor
          items={a.form.revenueOptions}
          onChange={(v) => onLandingChange({ ...landing, apply: { ...a, form: { ...a.form, revenueOptions: v } } })}
          placeholder="New option"
        />
      </Field>
    </div>
  );
}

