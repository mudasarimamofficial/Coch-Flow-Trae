import {
  defaultLandingSections,
  mergeBuilderState,
  pickBuilderState,
  type LandingBuilderState,
  type LandingSection,
  type LandingSectionType,
} from "@/components/site/landingV1/sections";

function isObj(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

export function ensureBuilder(content: unknown): { builder: LandingBuilderState; content: any } {
  const root = isObj(content) ? (content as any) : {};
  const builder = pickBuilderState(root);
  const merged = mergeBuilderState(root, builder);
  return { builder, content: merged };
}

export function moveSection(sections: LandingSection[], from: number, to: number) {
  const next = sections.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function toggleSection(sections: LandingSection[], id: string) {
  return sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
}

export function deleteSection(sections: LandingSection[], id: string) {
  return sections.filter((s) => s.id !== id);
}

export function updateSectionProps(sections: LandingSection[], id: string, props: Record<string, unknown>) {
  return sections.map((s) => (s.id === id ? { ...s, props: { ...(s.props || {}), ...props } } : s));
}

export function duplicateSection(sections: LandingSection[], id: string) {
  const idx = sections.findIndex((s) => s.id === id);
  if (idx === -1) return sections;
  const s = sections[idx];
  const copy: LandingSection = {
    ...s,
    id: `${s.type}-${Math.random().toString(16).slice(2, 8)}-${Date.now().toString(16).slice(-4)}`,
    props: s.props ? { ...s.props } : undefined,
  };
  const next = sections.slice();
  next.splice(idx + 1, 0, copy);
  return next;
}

export function canDuplicate(section: LandingSection) {
  return section.type === "customHtml" || section.type === "ctaBlock";
}

export function canDelete(section: LandingSection) {
  return section.type !== "nav";
}

export function addSection(sections: LandingSection[], type: LandingSectionType) {
  const baseId = type;
  const id = `${baseId}-${Math.random().toString(16).slice(2, 8)}`;
  const props =
    type === "customHtml"
      ? { title: "Custom Section", body: "", html: "" }
      : type === "ctaBlock"
        ? { title: "Ready to apply?", body: "", buttonLabel: "Apply Now", buttonHref: "#apply" }
        : undefined;
  return [...sections, { id, type, enabled: true, props }];
}

export function availableToAdd(sections: LandingSection[]) {
  const existingTypes = new Set(sections.map((s) => s.type));
  const core: LandingSectionType[] = [
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
  ];

  const list = core.filter((t) => !existingTypes.has(t));
  list.push("ctaBlock");
  list.push("customHtml");
  return list;
}

export function labelForType(type: LandingSectionType) {
  if (type === "nav") return "Navigation";
  if (type === "hero") return "Hero";
  if (type === "divider") return "Divider";
  if (type === "trust") return "Trust Strip";
  if (type === "founder") return "Founder";
  if (type === "promise") return "Commitments";
  if (type === "how") return "How It Works";
  if (type === "honest") return "Honest Part";
  if (type === "pricing") return "Pricing";
  if (type === "apply") return "Application";
  if (type === "footer") return "Footer";
  if (type === "ctaBlock") return "CTA Block";
  if (type === "customHtml") return "Custom HTML";
  return type;
}

export function defaultSectionsIfMissing() {
  return defaultLandingSections;
}
