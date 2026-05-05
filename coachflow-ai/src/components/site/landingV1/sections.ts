import { defaultLandingV1, type LandingV1Content } from "@/components/site/landingV1Defaults";

export type LandingSectionType =
  | "nav"
  | "hero"
  | "divider"
  | "trust"
  | "founder"
  | "promise"
  | "how"
  | "honest"
  | "pricing"
  | "apply"
  | "footer"
  | "ctaBlock"
  | "customHtml";

export type LandingSection = {
  id: string;
  type: LandingSectionType;
  enabled: boolean;
  props?: Record<string, unknown>;
};

export type LandingBuilderState = {
  version: 1;
  sections: LandingSection[];
};

export const defaultLandingSections: LandingSection[] = [
  { id: "nav", type: "nav", enabled: true },
  { id: "hero", type: "hero", enabled: true },
  { id: "divider", type: "divider", enabled: true },
  { id: "trust", type: "trust", enabled: true },
  { id: "founder", type: "founder", enabled: true },
  { id: "promise", type: "promise", enabled: true },
  { id: "how", type: "how", enabled: true },
  { id: "honest", type: "honest", enabled: true },
  { id: "pricing", type: "pricing", enabled: true },
  { id: "apply", type: "apply", enabled: true },
  { id: "footer", type: "footer", enabled: true },
];

const knownSectionTypes = new Set<LandingSectionType>([
  "nav",
  "hero",
  "divider",
  "trust",
  "founder",
  "promise",
  "how",
  "honest",
  "pricing",
  "apply",
  "footer",
  "ctaBlock",
  "customHtml",
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

export function pickBuilderState(content: unknown): LandingBuilderState {
  const root = isObj(content) ? (content as any) : {};
  const builder = root.builder;
  const sections = isObj(builder) && Array.isArray((builder as any).sections) ? ((builder as any).sections as any[]) : null;

  if (sections) {
    const normalized: LandingSection[] = sections
      .map((s) => {
        if (!isObj(s)) return null;
        const id = typeof s.id === "string" ? s.id : null;
        const type =
          typeof s.type === "string" && knownSectionTypes.has(s.type as LandingSectionType)
            ? (s.type as LandingSectionType)
            : null;
        const enabled = typeof s.enabled === "boolean" ? s.enabled : true;
        const props = isObj((s as any).props) ? ((s as any).props as Record<string, unknown>) : undefined;
        if (!id || !type) return null;
        return { id, type, enabled, props } as LandingSection;
      })
      .filter(Boolean) as LandingSection[];

    if (normalized.length) {
      return { version: 1, sections: normalized };
    }
  }

  return { version: 1, sections: defaultLandingSections };
}

export function mergeBuilderState(content: unknown, builder: LandingBuilderState) {
  const root = isObj(content) ? (content as any) : {};
  return { ...root, builder };
}

export function pickLanding(content: unknown): LandingV1Content {
  const root = isObj(content) ? (content as any) : null;
  const v = root?.landingV1;
  if (v && typeof v === "object") {
    const vv = v as any;
    return {
      ...defaultLandingV1,
      ...vv,
      nav: { ...defaultLandingV1.nav, ...(vv.nav || {}) },
      hero: { ...defaultLandingV1.hero, ...(vv.hero || {}) },
      founder: { ...defaultLandingV1.founder, ...(vv.founder || {}) },
      promise: { ...defaultLandingV1.promise, ...(vv.promise || {}) },
      howItWorks: { ...defaultLandingV1.howItWorks, ...(vv.howItWorks || {}) },
      honest: { ...defaultLandingV1.honest, ...(vv.honest || {}) },
      pricing: { ...defaultLandingV1.pricing, ...(vv.pricing || {}) },
      apply: { ...defaultLandingV1.apply, ...(vv.apply || {}) },
      footer: { ...defaultLandingV1.footer, ...(vv.footer || {}) },
    } as LandingV1Content;
  }
  return defaultLandingV1;
}
