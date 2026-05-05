"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingHero({ hero }: { hero: LandingV1Content["hero"] }) {
  return (
    <section className="hero" style={{ maxWidth: "none", paddingTop: "8rem" }}>
      <div className="hero-tag">{hero.tag}</div>
      <h1 dangerouslySetInnerHTML={{ __html: hero.headlineHtml }} />
      <p className="hero-sub" dangerouslySetInnerHTML={{ __html: hero.subHtml }} />
      <div className="hero-actions">
        <a href={hero.primaryCta.href} className="btn-primary">
          {hero.primaryCta.label}
        </a>
        <a href={hero.secondaryCta.href} className="btn-ghost">
          {hero.secondaryCta.label}
        </a>
      </div>
      <p className="hero-note">{hero.note}</p>
    </section>
  );
}

