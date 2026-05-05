"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";

export function HowInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const h = landing.howItWorks;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section Tag">
          <Input value={h.sectionTag} onChange={(e) => onLandingChange({ ...landing, howItWorks: { ...h, sectionTag: e.target.value } })} />
        </Field>
        <Field label="Title">
          <Input value={h.title} onChange={(e) => onLandingChange({ ...landing, howItWorks: { ...h, title: e.target.value } })} />
        </Field>
      </div>
      <Field label="Body">
        <Textarea value={h.body} onChange={(v) => onLandingChange({ ...landing, howItWorks: { ...h, body: v } })} rows={4} />
      </Field>
      <Field label="Steps">
        <div className="space-y-3">
          {h.steps.map((s, idx) => (
            <div key={`${s.num}:${idx}`} className="rounded-md border border-surface-800 p-3 bg-surface-900/30 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={s.num}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      howItWorks: { ...h, steps: h.steps.map((x, i) => (i === idx ? { ...x, num: e.target.value } : x)) },
                    })
                  }
                />
                <Input
                  className="col-span-2"
                  value={s.title}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      howItWorks: { ...h, steps: h.steps.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) },
                    })
                  }
                />
              </div>
              <Textarea
                value={s.body}
                onChange={(v) =>
                  onLandingChange({
                    ...landing,
                    howItWorks: { ...h, steps: h.steps.map((x, i) => (i === idx ? { ...x, body: v } : x)) },
                  })
                }
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-800"
                  onClick={() => onLandingChange({ ...landing, howItWorks: { ...h, steps: h.steps.filter((_, i) => i !== idx) } })}
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
            onClick={() => onLandingChange({ ...landing, howItWorks: { ...h, steps: [...h.steps, { num: "STEP 06", title: "New", body: "" }] } })}
            type="button"
          >
            Add Step
          </Button>
        </div>
      </Field>
    </div>
  );
}

