type Tier = {
  name: string;
  tagline: string;
  price: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
};

type Props = { tiers: Tier[] };

export function LandingHtmlV1Pricing({ tiers }: Props) {
  return (
    <div id="pricing">
      <div className="founding">
        <div className="founding-header">
          <div>
            <div className="section-tag">Partnership Tiers</div>
            <h2 className="section-title">Transparent Pricing</h2>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 300, maxWidth: 280, textAlign: "right" }}>
            Applications are reviewed for fit before onboarding begins. We say no when it&apos;s not the right match.
          </p>
        </div>

        <div className="tiers">
          {tiers.map((t, idx) => {
            const featured = idx === 1;
            const badgeText = idx === 0 ? "Founding Partner" : idx === 1 ? "Most Selected" : "For Established Coaches";
            const badgeStyle =
              idx === 0
                ? ({ background: "rgba(201,168,76,0.15)", color: "var(--gold)" } as const)
                : idx === 2
                  ? ({ background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--muted)" } as const)
                  : undefined;
            const ctaClass = idx === 1 ? "tier-cta tier-cta-solid" : "tier-cta tier-cta-outline";
            return (
              <div key={`${t.name}-${idx}`} className={`tier${featured ? " featured" : ""}`}>
                <div className="tier-badge" style={badgeStyle}>
                  {badgeText}
                </div>
                <div className="tier-name">{t.name}</div>
                <div className="tier-desc">{t.tagline}</div>
                <div className="tier-price">
                  <div>
                    <span className="tier-price-num">{t.price}</span>
                    {idx === 0 ? <span className="tier-price-was">$900</span> : null}
                  </div>
                  <div className="tier-price-mo">{idx === 0 ? "per month · founding rate" : "per month"}</div>
                </div>
                <ul className="tier-features">
                  {(t.bullets || []).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <a href={t.ctaHref || "#apply"} className={ctaClass}>
                  {t.ctaText}
                </a>
              </div>
            );
          })}
        </div>

        <p className="founding-note">
          Not sure which tier is right? Apply anyway — we&apos;ll recommend the right fit after reviewing your business.
        </p>
      </div>
    </div>
  );
}

