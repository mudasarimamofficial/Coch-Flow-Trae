import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import {
  buildScopedTypographyScaleCss,
  buildTypographyScaleCss,
  defaultTypographyScale,
  typographyVarsForTier,
} from "@/utils/typographyScale";

function pickCssFont(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  return v.length ? v : fallback;
}

function themeDefaults() {
  return {
    enabled: false,
    colors: homepageDefaults.site.theme?.colors || homepageDefaults.branding?.colors || {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: homepageDefaults.site.theme?.typography?.headingFont || "var(--font-heading)",
      bodyFont: homepageDefaults.site.theme?.typography?.bodyFont || "var(--font-body)",
      scale: homepageDefaults.site.theme?.typography?.scale || defaultTypographyScale,
    },
  };
}

export function buildThemeCssVars(content: Partial<HomepageContent> | null | undefined) {
  const defaults = themeDefaults();
  const branding = content?.branding || defaults;
  const enabled = Boolean(branding.enabled ?? content?.site?.theme?.enabled);
  const source = enabled
    ? {
        colors: {
          ...defaults.colors,
          ...(branding.colors || {}),
        },
        typography: {
          ...defaults.typography,
          ...(branding.typography || {}),
        },
      }
    : defaults;

  const colors = source.colors;
  const typography = source.typography;
  const palette = {
    navy: (colors as any).navy || colors.background,
    navy2: (colors as any).navy2 || colors.secondary,
    navy3: (colors as any).navy3 || colors.surface,
    navy4: (colors as any).navy4 || "#1A2444",
    white: (colors as any).white || colors.text,
    muted: (colors as any).muted || "#8A8F9E",
    off: (colors as any).off || "#F0EDE6",
    gold: (colors as any).gold || colors.primary,
    gold2: (colors as any).gold2 || colors.accent,
    gold3: (colors as any).gold3 || "#F5CC6E",
    borderGold: (colors as any).borderGold || "rgba(201,152,42,0.18)",
    border2: (colors as any).border2 || colors.border,
  };
  const scale =
    ((content?.site as any)?.theme?.typography?.scale as any) ||
    ((content?.branding as any)?.typography?.scale as any) ||
    typography.scale ||
    defaultTypographyScale;

  return (
    `:root{--cf-primary:${colors.primary};--cf-secondary:${colors.secondary};--cf-accent:${colors.accent};--cf-bg:${colors.background};--cf-text:${colors.text};--cf-surface:${colors.surface};--cf-border:${colors.border};--cf-font-heading:${pickCssFont(typography.headingFont, defaults.typography.headingFont)};--cf-font-body:${pickCssFont(typography.bodyFont, defaults.typography.bodyFont)};--cf-navy:${palette.navy};--cf-navy2:${palette.navy2};--cf-navy3:${palette.navy3};--cf-navy4:${palette.navy4};--cf-white:${palette.white};--cf-muted:${palette.muted};--cf-off:${palette.off};--cf-gold:${palette.gold};--cf-gold2:${palette.gold2};--cf-gold3:${palette.gold3};--cf-border-gold:${palette.borderGold};--cf-border2:${palette.border2};--color-primary:${colors.primary};--color-secondary:${colors.secondary};--color-accent:${colors.accent};--color-background:${colors.background};--color-text:${colors.text};--color-surface:${colors.surface};--color-border:${colors.border};}` +
    buildTypographyScaleCss(scale)
  );
}

function directLandingPaletteCss(colors: ReturnType<typeof themeDefaults>["colors"]) {
  const palette = {
    black: (colors as any).black || (colors as any).navy || colors.background || "#0A0A0A",
    white: (colors as any).white || colors.text || "#F5F2ED",
    gold: (colors as any).gold || colors.primary || "#C9A84C",
    goldLight: (colors as any).goldLight || (colors as any).gold2 || colors.accent || "#E8D5A3",
    goldDim: (colors as any).goldDim || (colors as any).gold3 || "#8A6F32",
    charcoal: (colors as any).charcoal || colors.surface || "#1A1A1A",
    mid: (colors as any).mid || colors.secondary || "#2E2E2E",
    muted: (colors as any).muted || "#6B6B6B",
    border: (colors as any).borderGold || colors.border || "rgba(201,168,76,0.2)",
    borderSubtle: (colors as any).border2 || "rgba(255,255,255,0.06)",
  };

  return [
    `--black:${palette.black}`,
    `--white:${palette.white}`,
    `--gold:${palette.gold}`,
    `--gold-light:${palette.goldLight}`,
    `--gold-dim:${palette.goldDim}`,
    `--charcoal:${palette.charcoal}`,
    `--mid:${palette.mid}`,
    `--muted:${palette.muted}`,
    `--border:${palette.border}`,
    `--border-subtle:${palette.borderSubtle}`,
  ].join(";");
}

export function buildDirectLandingThemeCss(content: Partial<HomepageContent> | null | undefined, selector = ".cf-rebuilt-shell") {
  const defaults = themeDefaults();
  const branding = content?.branding || defaults;
  const enabled = Boolean(branding.enabled ?? content?.site?.theme?.enabled);
  const source = enabled
    ? {
        colors: {
          ...defaults.colors,
          ...(branding.colors || {}),
        },
        typography: {
          ...defaults.typography,
          ...(branding.typography || {}),
        },
      }
    : defaults;
  const typography = source.typography;
  const scale =
    ((content?.site as any)?.theme?.typography?.scale as any) ||
    ((content?.branding as any)?.typography?.scale as any) ||
    typography.scale ||
    defaultTypographyScale;

  const paletteCss = directLandingPaletteCss(source.colors);
  const fontCss = `--cf-font-heading:${pickCssFont(typography.headingFont, defaults.typography.headingFont)};--cf-font-body:${pickCssFont(typography.bodyFont, defaults.typography.bodyFont)};`;
  const baseVars = `${selector}{${paletteCss};${fontCss}}`;
  const scopedScale = buildScopedTypographyScaleCss(scale, selector);
  const previewScale =
    `${selector}[data-cf-preview-device="mobile"]{${typographyVarsForTier(scale, "mobile")}}` +
    `${selector}[data-cf-preview-device="tablet"]{${typographyVarsForTier(scale, "tablet")}}` +
    `${selector}[data-cf-preview-device="desktop"]{${typographyVarsForTier(scale, "desktopLarge")}}`;

  return `${baseVars}${scopedScale}${previewScale}
${selector}{font-family:var(--cf-font-body), 'DM Sans', sans-serif;font-size:var(--font-size-body);}
${selector} .hero h1{font-size:var(--font-size-h1) !important;}
${selector} .section-title{font-size:var(--font-size-h2) !important;}
${selector} .founder-name,${selector} .honest-quote{font-size:var(--font-size-h3) !important;}
${selector} .founder-quote{font-size:var(--font-size-h4) !important;}
${selector} .tier-price-num{font-size:var(--font-size-h2) !important;}
${selector} .promise-num{font-size:var(--font-size-h3) !important;}
${selector} .hero-sub,${selector} .section-body,${selector} .founder-body,${selector} .honest-body,${selector} .tier-desc,${selector} .step-body,${selector} .promise-body,${selector} .form-subtitle,${selector} .form-disclaimer{font-size:var(--font-size-body) !important;}
${selector} .nav-links a,${selector} .nav-cta,${selector} .hero-tag,${selector} .section-tag,${selector} .founder-label,${selector} .founder-title,${selector} .trust-item,${selector} .form-promise-item,${selector} label,${selector} input,${selector} select,${selector} textarea,${selector} .footer-links,${selector} .footer-copy{font-size:var(--font-size-small) !important;}
${selector} .btn-primary,${selector} .btn-ghost,${selector} .tier-cta,${selector} .form-submit{font-size:var(--font-size-small) !important;}
${selector} .founder-avatar.has-image{padding:0;overflow:hidden;background:var(--charcoal);color:transparent;}
${selector} .founder-avatar.has-image img{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit;}`;
}
