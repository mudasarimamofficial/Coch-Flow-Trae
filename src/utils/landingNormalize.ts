import type { HomepageContent } from "@/content/homepage";

function norm(s: string) {
  return s.trim().toLowerCase();
}

function isLeadFormHref(href: string) {
  const h = href.trim();
  return h === "#lead-form" || h === "#application" || h === "#form";
}

function normalizePrimaryCtaText(headerText: string, heroText: string) {
  const h = norm(headerText);
  if (!heroText.trim()) return headerText;
  if (h === "apply now" || h === "apply" || h === "apply for partnership") return heroText;
  return headerText;
}

export function normalizeLandingContent(input: HomepageContent): HomepageContent {
  const heroPrimaryText = String(input.hero?.primaryCta?.text || "");
  const heroPrimaryHref = String(input.hero?.primaryCta?.href || "");
  const headerPrimaryText = String(input.header?.primaryCta?.text || "");
  const headerPrimaryHref = String(input.header?.primaryCta?.href || "");

  const shouldUnifyHeader = isLeadFormHref(heroPrimaryHref) && isLeadFormHref(headerPrimaryHref);
  const nextHeaderText = shouldUnifyHeader
    ? normalizePrimaryCtaText(headerPrimaryText, heroPrimaryText)
    : headerPrimaryText;

  const nextSections = (input.page?.sections || []).map((s) => {
    if (s.type !== "audit_bridge") return s;
    const set = (s.settings || {}) as Record<string, unknown>;
    const ctaHref = String(set.ctaHref || "");
    const ctaText = String(set.ctaText || "");
    const c = norm(ctaText);
    if (!isLeadFormHref(ctaHref)) return s;
    if (!heroPrimaryText.trim()) return s;
    if (c === "take the free audit" || c === "take free audit" || c === "apply now" || c === "apply") {
      return { ...s, settings: { ...set, ctaText: heroPrimaryText } };
    }
    return s;
  });

  return {
    ...input,
    header: {
      ...input.header,
      primaryCta: {
        ...input.header.primaryCta,
        text: nextHeaderText,
      },
    },
    page: input.page ? { ...input.page, sections: nextSections } : input.page,
  };
}
