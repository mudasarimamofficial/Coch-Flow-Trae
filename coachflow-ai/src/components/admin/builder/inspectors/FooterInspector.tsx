"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field } from "@/components/admin/builder/inspectors/common";
import { ImageField } from "@/components/admin/builder/ImageField";

export function FooterInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const f = landing.footer;
  return (
    <div className="space-y-6">
      <Field label="Logo Text">
        <Input value={f.logoText} onChange={(e) => onLandingChange({ ...landing, footer: { ...f, logoText: e.target.value } })} />
      </Field>
      <ImageField
        label="Logo Image"
        help="Optional. If set, the image replaces the logo text."
        value={f.logoImagePath ?? null}
        onChange={(next) => onLandingChange({ ...landing, footer: { ...f, logoImagePath: next } })}
      />
      <Field label="Footer Links">
        <div className="space-y-3">
          {f.links.map((l, idx) => (
            <div key={`${l.href}:${idx}`} className="grid grid-cols-2 gap-2">
              <Input
                value={l.label}
                onChange={(e) =>
                  onLandingChange({
                    ...landing,
                    footer: { ...f, links: f.links.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)) },
                  })
                }
              />
              <Input
                value={l.href}
                onChange={(e) =>
                  onLandingChange({
                    ...landing,
                    footer: { ...f, links: f.links.map((x, i) => (i === idx ? { ...x, href: e.target.value } : x)) },
                  })
                }
              />
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-800"
                  onClick={() => onLandingChange({ ...landing, footer: { ...f, links: f.links.filter((_, i) => i !== idx) } })}
                  type="button"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onLandingChange({ ...landing, footer: { ...f, links: [...f.links, { label: "New", href: "#" }] } })}
            type="button"
          >
            Add Link
          </Button>
        </div>
      </Field>
      <Field label="Copyright">
        <Input value={f.copyright} onChange={(e) => onLandingChange({ ...landing, footer: { ...f, copyright: e.target.value } })} />
      </Field>
    </div>
  );
}
