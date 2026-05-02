import type { HomepageContent } from "@/content/homepage";

type Props = { content: HomepageContent };

export function LandingHtmlV1Footer({ content }: Props) {
  return (
    <footer>
      <div className="footer-logo">{content.footer?.brandText || "CoachFlow AI"}</div>
      <ul className="footer-links">
        {(content.footer?.links || []).slice(0, 3).map((l) => (
          <li key={`${l.href}-${l.label}`}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <div className="footer-copy">{content.footer?.copyright || "© 2026 CoachFlow AI. All rights reserved."}</div>
    </footer>
  );
}

