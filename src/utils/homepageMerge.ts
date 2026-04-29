import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";

type Link = { label: string; href: string };

function mergeScale(base: any, extra: any) {
  const b = base || homepageDefaults.site.theme?.typography?.scale;
  const e = isLegacyScale(extra) ? {} : extra || {};
  return {
    mobile: { ...(b?.mobile || {}), ...(e.mobile || {}) },
    tablet: { ...(b?.tablet || {}), ...(e.tablet || {}) },
    laptop: { ...(b?.laptop || {}), ...(e.laptop || {}) },
    desktopLarge: { ...(b?.desktopLarge || {}), ...(e.desktopLarge || {}) },
  };
}

function isLegacyScale(scale: any) {
  return (
    scale?.mobile?.h1 === "22px" &&
    scale?.tablet?.h1 === "28px" &&
    scale?.laptop?.h1 === "36px" &&
    scale?.desktopLarge?.h1 === "42px" &&
    scale?.desktopLarge?.body === "18px"
  );
}

function mergeTheme(base: any, extra: any) {
  const b = base || homepageDefaults.site.theme;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
}

function mergeBranding(base: any, extra: any) {
  const b = base || homepageDefaults.branding;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
}

export function mergeLinks(base: Link[] | undefined, extra?: Link[] | null) {
  const seen = new Set<string>();
  const out: Link[] = [];
  const all = [...(Array.isArray(base) ? base : []), ...(Array.isArray(extra) ? extra : [])];

  for (const item of all) {
    const label = typeof item?.label === "string" ? item.label.trim() : "";
    const href = typeof item?.href === "string" ? item.href.trim() : "";
    if (!label || !href) continue;
    const key = `${label}:${href}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, href });
  }

  return out;
}

export function mergeSocialLinksV2(
  base: HomepageContent["socialLinksV2"] | undefined,
  extra: HomepageContent["socialLinksV2"] | undefined,
) {
  const b = Array.isArray(base) ? base : [];
  const e = Array.isArray(extra) ? extra : [];
  const byId = new Map<string, any>();
  for (const item of e) {
    const id = String((item as any)?.id || "").trim();
    if (!id) continue;
    byId.set(id, item);
  }
  const out: any[] = [];
  for (const preset of b) {
    const id = String((preset as any)?.id || "").trim();
    const override = id ? byId.get(id) : null;
    out.push(override ? { ...(preset as any), ...(override as any) } : preset);
    if (id) byId.delete(id);
  }
  for (const rest of byId.values()) out.push(rest);
  return out as HomepageContent["socialLinksV2"];
}

export function mergeHomepageContent(c: Partial<HomepageContent> | null | undefined): HomepageContent {
  if (!c) return homepageDefaults;

  return {
    ...homepageDefaults,
    ...c,
    site: {
      ...homepageDefaults.site,
      ...(c.site || {}),
      favicon: { ...homepageDefaults.site.favicon, ...(c.site?.favicon || {}) },
      theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme),
    },
    branding: mergeBranding(homepageDefaults.branding, c.branding),
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
      nav: mergeLinks(
        Array.isArray(c.header?.nav) ? c.header?.nav : homepageDefaults.header.nav,
      ),
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      proof: {
        ...(homepageDefaults.hero.proof || { title: "", eyebrow: "", avatars: [] }),
        ...(c.hero?.proof || {}),
        avatars: Array.isArray(c.hero?.proof?.avatars)
          ? c.hero?.proof?.avatars
          : homepageDefaults.hero.proof?.avatars || [],
      },
      metrics: Array.isArray(c.hero?.metrics) ? c.hero?.metrics : homepageDefaults.hero.metrics,
      revenueVisual: {
        ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
        ...(c.hero?.revenueVisual || {}),
      },
      backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: {
      ...homepageDefaults.trust,
      ...(c.trust || {}),
      icons: Array.isArray(c.trust?.icons) ? c.trust?.icons : homepageDefaults.trust.icons,
    },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: Array.isArray(c.features?.cards) ? c.features?.cards : homepageDefaults.features.cards,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: Array.isArray(c.workflow?.steps) ? c.workflow?.steps : homepageDefaults.workflow.steps,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: Array.isArray(c.pricing?.tiers) ? c.pricing?.tiers : homepageDefaults.pricing.tiers,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: Array.isArray(c.application?.fields?.revenueOptions)
          ? c.application?.fields?.revenueOptions
          : homepageDefaults.application.fields.revenueOptions,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: mergeLinks(Array.isArray(c.footer?.links) ? c.footer?.links : homepageDefaults.footer.links),
    },
    page: {
      sections: mergePageSectionsWithDefaults(c.page?.sections),
    },
    customSections: Array.isArray(c.customSections) ? c.customSections : homepageDefaults.customSections,
    socialLinks: Array.isArray(c.socialLinks) ? c.socialLinks : homepageDefaults.socialLinks,
    socialLinksV2: mergeSocialLinksV2(homepageDefaults.socialLinksV2, c.socialLinksV2),
    whatsapp: {
      ...(homepageDefaults.whatsapp || {
        enabled: false,
        phone: "",
        message: "",
        tooltip: "Chat with us!",
        modalTitle: "CoachFlow AI",
        modalSubtitle: "Usually replies instantly",
        buttonText: "Start Chat",
        headerColorHex: "#25D366",
      }),
      ...(c.whatsapp || {}),
      enabled: c.whatsapp?.enabled ?? (homepageDefaults.whatsapp?.enabled ?? false),
      phone: c.whatsapp?.phone ?? (homepageDefaults.whatsapp?.phone ?? ""),
      message: c.whatsapp?.message ?? (homepageDefaults.whatsapp?.message ?? ""),
      tooltip: c.whatsapp?.tooltip ?? (homepageDefaults.whatsapp?.tooltip ?? "Chat with us!"),
      modalTitle: c.whatsapp?.modalTitle ?? (homepageDefaults.whatsapp?.modalTitle ?? "CoachFlow AI"),
      modalSubtitle:
        c.whatsapp?.modalSubtitle ?? (homepageDefaults.whatsapp?.modalSubtitle ?? "Usually replies instantly"),
      buttonText: c.whatsapp?.buttonText ?? (homepageDefaults.whatsapp?.buttonText ?? "Start Chat"),
      headerColorHex: c.whatsapp?.headerColorHex ?? (homepageDefaults.whatsapp?.headerColorHex || "#25D366"),
      avatar: c.whatsapp?.avatar || homepageDefaults.whatsapp?.avatar,
    },
  };
}
