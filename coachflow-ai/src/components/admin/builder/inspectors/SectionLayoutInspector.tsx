"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/builder/inspectors/common";

type Align = "left" | "center" | "right";
type Width = "default" | "wide" | "full";
type Spacing = "normal" | "loose";
type Columns = "one" | "two";

export type SectionLayout = {
  align?: Align;
  width?: Width;
  spacing?: Spacing;
  columns?: Columns;
};

export function SectionLayoutInspector({
  value,
  onChange,
}: {
  value?: SectionLayout;
  onChange: (next: SectionLayout) => void;
}) {
  const v = value || {};
  return (
    <div className="space-y-4">
      <Field label="Layout" help="Controls basic alignment and width without changing the design system.">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-surface-500 mb-2">Alignment</div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={v.align === "left" || !v.align ? "secondary" : "outline"}
                className={v.align === "left" || !v.align ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, align: "left" })}
              >
                Left
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.align === "center" ? "secondary" : "outline"}
                className={v.align === "center" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, align: "center" })}
              >
                Center
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.align === "right" ? "secondary" : "outline"}
                className={v.align === "right" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, align: "right" })}
              >
                Right
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-surface-500 mb-2">Content width</div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={v.width === "default" || !v.width ? "secondary" : "outline"}
                className={v.width === "default" || !v.width ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, width: "default" })}
              >
                Default
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.width === "wide" ? "secondary" : "outline"}
                className={v.width === "wide" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, width: "wide" })}
              >
                Wide
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.width === "full" ? "secondary" : "outline"}
                className={v.width === "full" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, width: "full" })}
              >
                Full
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-surface-500 mb-2">Columns</div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={v.columns === "one" || !v.columns ? "secondary" : "outline"}
                className={v.columns === "one" || !v.columns ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, columns: "one" })}
              >
                1 Column
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.columns === "two" ? "secondary" : "outline"}
                className={v.columns === "two" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, columns: "two" })}
              >
                2 Columns
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-surface-500 mb-2">Spacing</div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={v.spacing === "normal" || !v.spacing ? "secondary" : "outline"}
                className={v.spacing === "normal" || !v.spacing ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, spacing: "normal" })}
              >
                Normal
              </Button>
              <Button
                type="button"
                size="sm"
                variant={v.spacing === "loose" ? "secondary" : "outline"}
                className={v.spacing === "loose" ? "" : "border-surface-800"}
                onClick={() => onChange({ ...v, spacing: "loose" })}
              >
                Loose
              </Button>
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}

