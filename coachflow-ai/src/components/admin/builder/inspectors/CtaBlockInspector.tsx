"use client";

import { Input } from "@/components/ui/input";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";
import type { LandingSection } from "@/components/site/landingV1/sections";

export function CtaBlockInspector({
  section,
  onSectionPropsChange,
}: {
  section: LandingSection;
  onSectionPropsChange: (sectionId: string, props: Record<string, unknown>) => void;
}) {
  const title = typeof section.props?.title === "string" ? section.props.title : "";
  const body = typeof section.props?.body === "string" ? section.props.body : "";
  const buttonLabel = typeof section.props?.buttonLabel === "string" ? section.props.buttonLabel : "";
  const buttonHref = typeof section.props?.buttonHref === "string" ? section.props.buttonHref : "";

  return (
    <div className="space-y-6">
      <Field label="Title">
        <Input value={title} onChange={(e) => onSectionPropsChange(section.id, { title: e.target.value })} />
      </Field>
      <Field label="Body">
        <Textarea value={body} onChange={(v) => onSectionPropsChange(section.id, { body: v })} rows={4} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button Label">
          <Input value={buttonLabel} onChange={(e) => onSectionPropsChange(section.id, { buttonLabel: e.target.value })} />
        </Field>
        <Field label="Button Href">
          <Input value={buttonHref} onChange={(e) => onSectionPropsChange(section.id, { buttonHref: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

