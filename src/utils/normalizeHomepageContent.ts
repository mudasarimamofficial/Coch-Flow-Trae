import { homepageDefaults, type HomepageContent } from "@/content/homepage";

export function normalizeHomepageContent(c?: Partial<HomepageContent> | null): HomepageContent {
  if (!c) return homepageDefaults;

  const headerNav = Array.isArray(c.header?.nav) ? c.header?.nav : homepageDefaults.header.nav;
  const footerLinks = Array.isArray(c.footer?.links) ? c.footer?.links : homepageDefaults.footer.links;
  const trustIcons = Array.isArray(c.trust?.icons) ? c.trust?.icons : homepageDefaults.trust.icons;
  const featuresCards = Array.isArray(c.features?.cards) ? c.features?.cards : homepageDefaults.features.cards;
  const workflowSteps = Array.isArray(c.workflow?.steps) ? c.workflow?.steps : homepageDefaults.workflow.steps;
  const pricingTiers = Array.isArray(c.pricing?.tiers) ? c.pricing?.tiers : homepageDefaults.pricing.tiers;
  const revenueOptions = Array.isArray(c.application?.fields?.revenueOptions)
    ? c.application?.fields?.revenueOptions
    : homepageDefaults.application.fields.revenueOptions;
  const pageSections = Array.isArray(c.page?.sections)
    ? c.page?.sections
    : Array.isArray(homepageDefaults.page?.sections)
      ? homepageDefaults.page?.sections
      : [];
  const customSections = Array.isArray(c.customSections) ? c.customSections : homepageDefaults.customSections;
  const socialLinks = Array.isArray(c.socialLinks) ? c.socialLinks : homepageDefaults.socialLinks;
  const socialLinksV2 = Array.isArray(c.socialLinksV2) ? c.socialLinksV2 : homepageDefaults.socialLinksV2;

  return {
    ...homepageDefaults,
    ...c,
    branding: c.branding ? { ...homepageDefaults.branding, ...(c.branding as any) } : homepageDefaults.branding,
    site: { ...homepageDefaults.site, ...(c.site || {}) },
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
      nav: headerNav as any,
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: {
      ...homepageDefaults.trust,
      ...(c.trust || {}),
      icons: trustIcons as any,
    },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: featuresCards as any,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: workflowSteps as any,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: pricingTiers as any,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: revenueOptions as any,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: footerLinks as any,
    },
    socialLinks: socialLinks as any,
    socialLinksV2: socialLinksV2 as any,
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
    page: { sections: pageSections as any },
    customSections: customSections as any,
  };
}

