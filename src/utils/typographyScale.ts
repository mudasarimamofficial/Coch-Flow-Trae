export type TypographyTier = "mobile" | "tablet" | "laptop" | "desktopLarge";
export type TypographyToken = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "small";
export type TypographyTierScale = Record<TypographyToken, string>;
export type TypographyScale = Record<TypographyTier, TypographyTierScale>;

export const TYPOGRAPHY_TIERS: { key: TypographyTier; label: string; minWidth?: number }[] = [
  { key: "mobile", label: "Mobile" },
  { key: "tablet", label: "Tablet", minWidth: 768 },
  { key: "laptop", label: "Laptop", minWidth: 1024 },
  { key: "desktopLarge", label: "Large Desktop", minWidth: 1440 },
];

export const TYPOGRAPHY_TOKENS: { key: TypographyToken; label: string }[] = [
  { key: "h1", label: "H1" },
  { key: "h2", label: "H2" },
  { key: "h3", label: "H3" },
  { key: "h4", label: "H4" },
  { key: "h5", label: "H5" },
  { key: "h6", label: "H6" },
  { key: "body", label: "Body" },
  { key: "small", label: "Small" },
];

export const defaultTypographyScale: TypographyScale = {
  mobile: {
    h1: "22px",
    h2: "20px",
    h3: "18px",
    h4: "16px",
    h5: "15px",
    h6: "14px",
    body: "16px",
    small: "14px",
  },
  tablet: {
    h1: "28px",
    h2: "24px",
    h3: "22px",
    h4: "20px",
    h5: "18px",
    h6: "16px",
    body: "16px",
    small: "14px",
  },
  laptop: {
    h1: "36px",
    h2: "30px",
    h3: "26px",
    h4: "22px",
    h5: "20px",
    h6: "18px",
    body: "16px",
    small: "14px",
  },
  desktopLarge: {
    h1: "42px",
    h2: "36px",
    h3: "30px",
    h4: "26px",
    h5: "22px",
    h6: "18px",
    body: "18px",
    small: "14px",
  },
};

function sanitizeTypographyValue(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  if (/^\d{1,3}(?:\.\d{1,2})?(?:px|rem|em)$/.test(v)) return v;
  return fallback;
}

export function mergeTypographyScale(scale: unknown, fallback: TypographyScale = defaultTypographyScale): TypographyScale {
  const raw = scale && typeof scale === "object" ? (scale as Partial<Record<TypographyTier, Partial<TypographyTierScale>>>) : {};
  const merged = {} as TypographyScale;

  for (const tier of TYPOGRAPHY_TIERS) {
    const baseTier = fallback[tier.key] || defaultTypographyScale[tier.key];
    const rawTier = raw[tier.key] || {};
    merged[tier.key] = {} as TypographyTierScale;
    for (const token of TYPOGRAPHY_TOKENS) {
      merged[tier.key][token.key] = sanitizeTypographyValue(rawTier[token.key], baseTier[token.key]);
    }
  }

  return merged;
}

export function createDefaultTypographyScale(): TypographyScale {
  return mergeTypographyScale(defaultTypographyScale);
}

function cssVarsForTier(scale: TypographyTierScale) {
  return `--font-size-h1:${scale.h1};--font-size-h2:${scale.h2};--font-size-h3:${scale.h3};--font-size-h4:${scale.h4};--font-size-h5:${scale.h5};--font-size-h6:${scale.h6};--font-size-body:${scale.body};--font-size-small:${scale.small};`;
}

export function buildTypographyScaleCss(scale: unknown) {
  const merged = mergeTypographyScale(scale);
  return (
    `:root{${cssVarsForTier(merged.mobile)}}` +
    `@media (min-width: 768px){:root{${cssVarsForTier(merged.tablet)}}}` +
    `@media (min-width: 1024px){:root{${cssVarsForTier(merged.laptop)}}}` +
    `@media (min-width: 1440px){:root{${cssVarsForTier(merged.desktopLarge)}}}`
  );
}
