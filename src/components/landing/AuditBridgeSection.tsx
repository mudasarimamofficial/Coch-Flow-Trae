import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section: PageSection;
};

export function AuditBridgeSection({ section }: Props) {
  const s = (section.settings || {}) as any;
  const heading = String(s.heading || "");
  const subcopy = String(s.subcopy || "");
  const ctaText = String(s.ctaText || "");
  const ctaHref = String(s.ctaHref || "#lead-form");

  return (
    <section id="audit-bridge">
      <div className="container">
        <div className="audit-inner">
          <div className="audit-text">
            <div className="gold-line" />
            {heading ? <h3>{heading}</h3> : null}
            {subcopy ? <p>{subcopy}</p> : null}
          </div>
          {ctaText ? (
            <a href={ctaHref} className="btn-primary audit-cta">
              {ctaText} <span className="arrow">→</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

