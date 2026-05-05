"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, Textarea } from "@/components/admin/builder/inspectors/common";

export function PromiseInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  const p = landing.promise;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Section Tag">
          <Input value={p.sectionTag} onChange={(e) => onLandingChange({ ...landing, promise: { ...p, sectionTag: e.target.value } })} />
        </Field>
        <Field label="Title">
          <Input value={p.title} onChange={(e) => onLandingChange({ ...landing, promise: { ...p, title: e.target.value } })} />
        </Field>
      </div>
      <Field label="Body">
        <Textarea value={p.body} onChange={(v) => onLandingChange({ ...landing, promise: { ...p, body: v } })} rows={4} />
      </Field>
      <Field label="Cards">
        <div className="space-y-3">
          {p.cards.map((c, idx) => (
            <div key={`${c.num}:${idx}`} className="rounded-md border border-surface-800 p-3 bg-surface-900/30 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={c.num}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      promise: { ...p, cards: p.cards.map((x, i) => (i === idx ? { ...x, num: e.target.value } : x)) },
                    })
                  }
                  placeholder="01"
                />
                <Input
                  className="col-span-2"
                  value={c.title}
                  onChange={(e) =>
                    onLandingChange({
                      ...landing,
                      promise: { ...p, cards: p.cards.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) },
                    })
                  }
                  placeholder="Title"
                />
              </div>
              <Textarea
                value={c.body}
                onChange={(v) =>
                  onLandingChange({
                    ...landing,
                    promise: { ...p, cards: p.cards.map((x, i) => (i === idx ? { ...x, body: v } : x)) },
                  })
                }
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-surface-800"
                  onClick={() => onLandingChange({ ...landing, promise: { ...p, cards: p.cards.filter((_, i) => i !== idx) } })}
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
            onClick={() => onLandingChange({ ...landing, promise: { ...p, cards: [...p.cards, { num: "05", title: "New", body: "" }] } })}
            type="button"
          >
            Add Card
          </Button>
        </div>
      </Field>
    </div>
  );
}

