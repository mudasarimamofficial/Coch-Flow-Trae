import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Pricing({ content, section }: Props) {
  const label = (section?.settings as any)?.label || (content.pricing as any).label || "";
  return (
    <section id="pricing">
      <div className="container">
        <div className="section-intro">
          {label ? <div className="label-tag">{label}</div> : null}
          <h2>{content.pricing.heading}</h2>
          {content.pricing.subcopy.trim().length ? <p>{content.pricing.subcopy}</p> : null}
        </div>

        <div className="pricing-grid">
          {content.pricing.tiers.map((t: any, idx: number) => (
            <div key={`${t.name}-${idx}`} className={`pricing-card ${t.highlight ? "featured" : ""}`.trim()}>
              {t.highlight?.badge ? <div className="popular-badge">{t.highlight.badge}</div> : null}

              <div className="tier-name">{t.name}</div>
              {t.tagline ? <div className="tier-desc">{t.tagline}</div> : null}

              <div className="tier-price">
                {t.price}
                {t.priceSuffix ? <span>{t.priceSuffix}</span> : null}
              </div>

              {t.outcome ? <div className="tier-outcome">{t.outcome}</div> : null}

              <ul className="tier-features">
                {(t.bullets || []).map((b: string) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <a
                href={t.ctaHref}
                className={t.highlight ? "btn-primary" : "btn-ghost"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {t.ctaText}
              </a>
            </div>
          ))}
        </div>

        {content.pricing.note && content.pricing.note.trim().length ? (
          <div className="pricing-note">{content.pricing.note}</div>
        ) : null}
      </div>
    </section>
  );
}
