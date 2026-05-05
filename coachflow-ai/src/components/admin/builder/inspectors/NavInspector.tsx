"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field } from "@/components/admin/builder/inspectors/common";
import { ImageField } from "@/components/admin/builder/ImageField";

export function NavInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const links = landing.nav.links;
  return (
    <div className="space-y-6">
      <Field label="Logo Text">
        <Input value={landing.nav.logoText} onChange={(e) => onLandingChange({ ...landing, nav: { ...landing.nav, logoText: e.target.value } })} />
      </Field>
      <ImageField
        label="Logo Image"
        help="Optional. If set, the image replaces the logo text."
        value={landing.nav.logoImagePath ?? null}
        onChange={(next) => onLandingChange({ ...landing, nav: { ...landing.nav, logoImagePath: next } })}
      />
      <Field label="Nav Links">
        <div className="space-y-3">
          {links.map((l, idx) => (
            <div key={`${l.href}:${idx}`} className="rounded-md border border-surface-800 p-3 bg-surface-900/30">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={l.label}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      nav: {
                        ...landing.nav,
                        links: links.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                      },
                    })
                  }
                  placeholder="Label"
                />
                <Input
                  value={l.href}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      nav: {
                        ...landing.nav,
                        links: links.map((x, i) => (i === idx ? { ...x, href: e.target.value } : x)),
                      },
                    })
                  }
                  placeholder="#section"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="text-xs text-surface-400 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(l.isCta)}
                    onChange={(e) =>
                      onLandingChange({
                        ...landing,
                        nav: {
                          ...landing.nav,
                          links: links.map((x, i) => (i === idx ? { ...x, isCta: e.target.checked } : x)),
                        },
                      })
                    }
                  />
                  CTA style
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-800"
                  onClick={() => onLandingChange({ ...landing, nav: { ...landing.nav, links: links.filter((_, i) => i !== idx) } })}
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
            onClick={() => onLandingChange({ ...landing, nav: { ...landing.nav, links: [...links, { label: "New", href: "#" }] } })}
            type="button"
          >
            Add Link
          </Button>
        </div>
      </Field>
    </div>
  );
}
