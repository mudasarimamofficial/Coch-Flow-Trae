import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Hero({ content, section }: Props) {
  const hero: any = content.hero as any;
  const trustText = hero.trust?.text || content.trust?.eyebrow || "";
  const trustPills: string[] =
    hero.trust?.pills ||
    (Array.isArray(content.trust?.icons)
      ? content.trust.icons
          .map((x) => String((x as any).label || (x as any).text || ""))
          .filter((x) => x.trim())
          .slice(0, 3)
      : []);
  const showBackground = (section?.settings as any)?.heroBackground !== false;
  const primaryHref = hero.primaryCta?.href || "#lead-form";
  const secondaryHref = hero.secondaryCta?.href || "#workflow";
  const primaryText = (hero.primaryCta?.label || hero.primaryCta?.text || "").toString();
  const secondaryText = (hero.secondaryCta?.label || hero.secondaryCta?.text || "").toString();
  const workflowSteps: { title: string; copy: string }[] = Array.isArray(content.workflow?.steps) ? (content.workflow.steps as any) : [];

  return (
    <section id="hero">
      {showBackground ? (
        <>
          <div className="hero-bg" />
          <div className="hero-grid-lines" />
        </>
      ) : null}
      <div className="container">
        <div className="hero-layout">
          <div className="hero-content">
            {hero.badge?.text ? <div className="hero-tagline">{hero.badge.text}</div> : null}

            <h1 className="hero-h1">
              {renderMultilineText(hero.heading?.prefix || "")}
              <em>{hero.heading?.highlight || ""}</em>
            </h1>

            {hero.subcopy ? <p className="hero-sub">{hero.subcopy}</p> : null}
            {hero.note && hero.note.trim().length ? <p className="hero-human">{hero.note}</p> : null}

            <div className="hero-ctas">
              {hero.primaryCta?.enabled !== false && primaryText ? (
                <a className="btn-primary" href={primaryHref}>
                  {primaryText}
                  <span className="arrow">→</span>
                </a>
              ) : null}
              {hero.secondaryCta?.enabled !== false && secondaryText ? (
                <a className="btn-ghost" href={secondaryHref}>
                  {secondaryText}
                  <span className="arrow">↓</span>
                </a>
              ) : null}
            </div>

            {trustText || trustPills.length ? (
              <div className="hero-trust">
                {trustText ? <div className="hero-trust-text">{trustText}</div> : null}
                {trustPills.map((p) => (
                  <div key={p} className="hero-trust-pill">
                    {p}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="hero-proof" aria-hidden="true">
            <div className="hero-proof-card">
              <div className="hero-proof-top">
                <div className="hero-proof-title">Infrastructure Snapshot</div>
                <div className="hero-proof-chip">System view</div>
              </div>

              <div className="hero-proof-grid">
                <div className="hero-proof-metric">
                  <div className="hero-proof-k">Prospect signals</div>
                  <div className="hero-proof-v">Live targeting</div>
                </div>
                <div className="hero-proof-metric">
                  <div className="hero-proof-k">Conversations</div>
                  <div className="hero-proof-v">Human-led</div>
                </div>
                <div className="hero-proof-metric">
                  <div className="hero-proof-k">Follow-up</div>
                  <div className="hero-proof-v">Automated</div>
                </div>
                <div className="hero-proof-metric">
                  <div className="hero-proof-k">Booked calls</div>
                  <div className="hero-proof-v">Qualified</div>
                </div>
              </div>

              <div className="hero-proof-divider" />

              <div className="hero-proof-steps">
                {(workflowSteps.length ? workflowSteps.slice(0, 4) : []).map((s, idx) => (
                  <div key={`${idx}-${s.title}`} className="hero-proof-step">
                    <div className="hero-proof-step-num">{idx + 1}</div>
                    <div className="hero-proof-step-body">
                      <div className="hero-proof-step-title">{String(s.title || "")}</div>
                      <div className="hero-proof-step-copy">{String(s.copy || "")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderMultilineText(text: string) {
  const parts = text.split("\n");
  if (parts.length <= 1) return <>{text} </>;
  return (
    <>
      {parts.map((p, idx) => (
        <span key={`${idx}-${p}`}>
          {p}
          {idx !== parts.length - 1 ? <br /> : " "}
        </span>
      ))}
    </>
  );
}
