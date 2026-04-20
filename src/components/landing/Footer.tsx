import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function Footer({ content, section }: Props) {
  const showSocial = (section?.settings as any)?.showSocial === true;
  const socialV2 = (content.socialLinksV2 || []).filter((s) => s.enabled && s.url && s.url.trim().length);
  const socialLegacy = (content.socialLinks || []).filter((s) => s.href && s.href.trim().length);
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">{renderBrandText(content.footer.brandText)}</div>

          <div className="footer-links">
            {content.footer.links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          {showSocial && (socialV2.length || socialLegacy.length) ? (
            <div className="footer-links">
              {socialV2.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                  {s.platform}
                </a>
              ))}
              {socialLegacy.map((s, idx) => (
                <a key={`${s.href}-${idx}`} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}

          <div className="footer-copy">{content.footer.copyright}</div>
        </div>
      </div>
    </footer>
  );
}

function renderBrandText(text: string) {
  const parts = text.split(" ");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(" ");
    return (
      <>
        {rest} <span>{last}</span>
      </>
    );
  }
  return text;
}
