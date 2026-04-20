import { createClient } from "@supabase/supabase-js";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";

export async function getHomepageContent(): Promise<HomepageContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return homepageDefaults;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase
      .from("homepage_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.content) return homepageDefaults;

    const c = data.content as Partial<HomepageContent> | null;
    if (!c) return homepageDefaults;

    return {
      ...homepageDefaults,
      ...c,
      site: { ...homepageDefaults.site, ...(c.site || {}) },
      header: {
        ...homepageDefaults.header,
        ...(c.header || {}),
        brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
        primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
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
        icons: c.trust?.icons || homepageDefaults.trust.icons,
      },
      features: {
        ...homepageDefaults.features,
        ...(c.features || {}),
        cards: c.features?.cards || homepageDefaults.features.cards,
        backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
      },
      workflow: {
        ...homepageDefaults.workflow,
        ...(c.workflow || {}),
        steps: c.workflow?.steps || homepageDefaults.workflow.steps,
        backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
      },
      pricing: {
        ...homepageDefaults.pricing,
        ...(c.pricing || {}),
        tiers: c.pricing?.tiers || homepageDefaults.pricing.tiers,
        backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
      },
      application: {
        ...homepageDefaults.application,
        ...(c.application || {}),
        fields: {
          ...homepageDefaults.application.fields,
          ...(c.application?.fields || {}),
          revenueOptions: c.application?.fields?.revenueOptions || homepageDefaults.application.fields.revenueOptions,
        },
        backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
      },
      footer: {
        ...homepageDefaults.footer,
        ...(c.footer || {}),
        brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
        links: c.footer?.links || homepageDefaults.footer.links,
      },
      page: {
        sections: c.page?.sections || homepageDefaults.page?.sections || [],
      },
      customSections: c.customSections || homepageDefaults.customSections,
      socialLinks: c.socialLinks || homepageDefaults.socialLinks,
      socialLinksV2: c.socialLinksV2 || homepageDefaults.socialLinksV2,
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
  } catch {
    return homepageDefaults;
  }
}
