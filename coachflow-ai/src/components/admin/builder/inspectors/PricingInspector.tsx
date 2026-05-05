"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, StringListEditor, Textarea } from "@/components/admin/builder/inspectors/common";

export function PricingInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const p = landing.pricing;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section Tag">
          <Input value={p.sectionTag} onChange={(e) => onLandingChange({ ...landing, pricing: { ...p, sectionTag: e.target.value } })} />
        </Field>
        <Field label="Title">
          <Input value={p.title} onChange={(e) => onLandingChange({ ...landing, pricing: { ...p, title: e.target.value } })} />
        </Field>
      </div>
      <Field label="Side Note">
        <Textarea value={p.sideNote} onChange={(v) => onLandingChange({ ...landing, pricing: { ...p, sideNote: v } })} rows={3} />
      </Field>
      <Field label="Note">
        <Textarea value={p.note} onChange={(v) => onLandingChange({ ...landing, pricing: { ...p, note: v } })} rows={3} />
      </Field>
      <Field label="Tiers">
        <div className="space-y-3">
          {p.tiers.map((t, idx) => (
            <div key={`${t.name}:${idx}`} className="rounded-md border border-surface-800 p-3 bg-surface-900/30 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={t.name}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)) },
                    })
                  }
                  placeholder="Tier name"
                />
                <Input
                  value={t.price}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)) },
                    })
                  }
                  placeholder="$0"
                />
                <Input
                  value={t.badge}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, badge: e.target.value } : x)) },
                    })
                  }
                  placeholder="Badge"
                />
                <Input
                  value={t.ctaLabel}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, ctaLabel: e.target.value } : x)) },
                    })
                  }
                  placeholder="CTA label"
                />
                <Input
                  value={t.ctaHref}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, ctaHref: e.target.value } : x)) },
                    })
                  }
                  placeholder="#apply"
                  className="col-span-2"
                />
              </div>
              <Textarea
                value={t.desc}
                onChange={(v) =>
                  onLandingChange({
                    ...landing,
                    pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, desc: v } : x)) },
                  })
                }
                rows={3}
              />
              <Field label="Features">
                <StringListEditor
                  items={t.features}
                  onChange={(v) =>
                    onLandingChange({
                      ...landing,
                      pricing: { ...p, tiers: p.tiers.map((x, i) => (i === idx ? { ...x, features: v } : x)) },
                    })
                  }
                  placeholder="New feature"
                />
              </Field>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-800"
                  onClick={() => onLandingChange({ ...landing, pricing: { ...p, tiers: p.tiers.filter((_, i) => i !== idx) } })}
                  type="button"
                >
                  Remove Tier
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onLandingChange({
                ...landing,
                pricing: {
                  ...p,
                  tiers: [
                    ...p.tiers,
                    {
                      badge: "New",
                      name: "New Tier",
                      desc: "",
                      price: "$0",
                      priceMeta: "per month",
                      features: [],
                      ctaLabel: "Apply",
                      ctaHref: "#apply",
                      ctaStyle: "outline",
                    },
                  ],
                },
              })
            }
            type="button"
          >
            Add Tier
          </Button>
        </div>
      </Field>
    </div>
  );
}

