"use client";

import { Input } from "@/components/ui/input";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";
import type { LandingSection } from "@/components/site/landingV1/sections";

export function CustomHtmlInspector({
  section,
  onSectionPropsChange,
}: {
  section: LandingSection;
  onSectionPropsChange: (sectionId: string, props: Record<string, unknown>) => void;
}) {
  const title = typeof section.props?.title === "string" ? section.props.title : "";
  const body = typeof section.props?.body === "string" ? section.props.body : "";
  const html = typeof section.props?.html === "string" ? section.props.html : "";

  return (
    <div className="space-y-6">
      <Field label="Title">
        <Input value={title} onChange={(e) => onSectionPropsChange(section.id, { title: e.target.value })} />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={(v) => onSectionPropsChange(section.id, { body: v })} rows={4} />
      </Field>
      <Field label="HTML">
        <Textarea value={html} onChange={(v) => onSectionPropsChange(section.id, { html: v })} rows={10} />
      </Field>
    </div>
  );
}

