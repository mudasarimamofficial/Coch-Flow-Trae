"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

function tierBadgeStyle(t: LandingV1Content["pricing"]["tiers"][number]) {
  if (t.badgeStyle === "outline") {
    return {
      background: "transparent",
      border: "0.5px solid rgba(255,255,255,0.1)",
      color: "var(--muted)",
    } as const;
  }
  if (t.badgeStyle === "goldSubtle") {
    return { background: "rgba(201,168,76,0.15)", color: "var(--gold)" } as const;
  }
  return undefined;
}

export function LandingPricing({ pricing }: { pricing: LandingV1Content["pricing"] }) {
  return (
    <div id="pricing">
      <div className="founding">
        <div className="founding-header">
          <div>
            <div className="section-tag">{pricing.sectionTag}</div>
            <h2 className="section-title">{pricing.title}</h2>
          </div>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.9rem",
              fontWeight: 300,
              maxWidth: 280,
              textAlign: "right",
            }}
          >
            {pricing.sideNote}
          </p>
        </div>

        <div className="tiers">
          {pricing.tiers.map((t) => (
            <div key={t.name} className={`tier ${t.featured ? "featured" : ""}`}>
              <div className="tier-badge" style={tierBadgeStyle(t)}>
                {t.badge}
              </div>
              <div className="tier-name">{t.name}</div>
              <div className="tier-desc">{t.desc}</div>
              <div className="tier-price">
                <div>
                  <span className="tier-price-num">{t.price}</span>
                  {t.priceWas ? <span className="tier-price-was">{t.priceWas}</span> : null}
                </div>
                <div className="tier-price-mo">{t.priceMeta}</div>
              </div>
              <ul className="tier-features">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href={t.ctaHref}
                className={`tier-cta ${t.ctaStyle === "solid" ? "tier-cta-solid" : "tier-cta-outline"}`}
              >
                {t.ctaLabel}
              </a>
            </div>
          ))}
        </div>

        <p className="founding-note">{pricing.note}</p>
      </div>
    </div>
  );
}

