import { createClient } from "@supabase/supabase-js";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { sanitizeContentStrings } from "@/utils/textSanitize";

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

    const { data: pages } = await supabase
      .from("site_pages")
      .select("slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status")
      .eq("status", "published");

    const c = data.content as Partial<HomepageContent> | null;
    if (!c) return homepageDefaults;

    const dynamicHeader = (pages || [])
      .filter((p: any) => Boolean(p?.show_in_header_nav))
      .map((p: any) => ({
        label: String(p?.nav_label || p?.title || p?.slug || "").trim() || "Page",
        href: `/p/${String(p?.slug || "").trim()}`,
      }))
      .filter((x: any) => x.label && x.href && x.href !== "/");
    const dynamicFooter = (pages || [])
      .filter((p: any) => Boolean(p?.show_in_footer_nav))
      .map((p: any) => ({
        label: String(p?.nav_label || p?.title || p?.slug || "").trim() || "Page",
        href: `/p/${String(p?.slug || "").trim()}`,
      }))
      .filter((x: any) => x.label && x.href && x.href !== "/");

    const mergeLinks = (base: { label: string; href: string }[], extra: { label: string; href: string }[]) => {
      const seen = new Set<string>();
      const out: { label: string; href: string }[] = [];
      for (const it of [...base, ...extra]) {
        const key = `${it.label}`.trim().toLowerCase();
        const href = `${it.href}`.trim();
        if (!key || !href) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ label: it.label, href });
      }
      return out;
    };

    return sanitizeContentStrings({
      ...homepageDefaults,
      ...c,
      site: { ...homepageDefaults.site, ...(c.site || {}) },
      header: {
        ...homepageDefaults.header,
        ...(c.header || {}),
        brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
        primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
        nav: mergeLinks(
          (c.header?.nav || homepageDefaults.header.nav) as any,
          dynamicHeader as any,
        ),
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
        links: mergeLinks(
          (c.footer?.links || homepageDefaults.footer.links) as any,
          dynamicFooter as any,
        ),
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
    });
  } catch {
    return homepageDefaults;
  }
}
