"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { Field, StringListEditor } from "@/components/admin/builder/inspectors/common";

export function TrustInspector({
  landing,
  onLandingChange,
}: {
  landing: LandingV1Content;
  onLandingChange: (next: LandingV1Content) => void;
}) {
  return (
    <div className="space-y-6">
      <Field label="Trust Strip Items">
        <StringListEditor items={landing.trustStrip} onChange={(v) => onLandingChange({ ...landing, trustStrip: v })} />
      </Field>
    </div>
  );
}

