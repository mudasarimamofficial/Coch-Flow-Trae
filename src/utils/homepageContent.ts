import { createClient } from "@supabase/supabase-js";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { sanitizeContentStrings } from "@/utils/textSanitize";
import { mergePageSectionsWithDefaults } from "@/utils/homepageSections";
import { neutralizeLegacyProofContent } from "@/utils/homepageMerge";

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

    const mergeSocialLinksV2 = (
      base: HomepageContent["socialLinksV2"] | undefined,
      extra: HomepageContent["socialLinksV2"] | undefined,
    ) => {
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
    };

    const mergeScale = (base: any, extra: any) => {
      const b = base || homepageDefaults.site.theme?.typography?.scale;
      const e = extra || {};
      return {
        mobile: { ...(b?.mobile || {}), ...(e.mobile || {}) },
        tablet: { ...(b?.tablet || {}), ...(e.tablet || {}) },
        laptop: { ...(b?.laptop || {}), ...(e.laptop || {}) },
        desktopLarge: { ...(b?.desktopLarge || {}), ...(e.desktopLarge || {}) },
      };
    };

    const mergeTheme = (base: any, extra: any) => {
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
    };

    const mergeBranding = (base: any, extra: any) => {
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
    };

    return neutralizeLegacyProofContent(sanitizeContentStrings({
      ...homepageDefaults,
      ...c,
      site: {
        ...homepageDefaults.site,
        ...(c.site || {}),
        theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme),
      },
      branding: mergeBranding(homepageDefaults.branding, c.branding),
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
        proof: {
          ...(homepageDefaults.hero.proof || { title: "", eyebrow: "", avatars: [] }),
          ...(c.hero?.proof || {}),
          avatars: c.hero?.proof?.avatars || homepageDefaults.hero.proof?.avatars || [],
        },
        metrics: c.hero?.metrics || homepageDefaults.hero.metrics,
        revenueVisual: {
          ...(homepageDefaults.hero.revenueVisual || { value: "", label: "" }),
          ...(c.hero?.revenueVisual || {}),
        },
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
        sections: mergePageSectionsWithDefaults(c.page?.sections),
      },
      customSections: c.customSections || homepageDefaults.customSections,
      socialLinks: c.socialLinks || homepageDefaults.socialLinks,
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
    }));
  } catch {
    return homepageDefaults;
  }
}
