import type { HomepageContent } from "@/content/homepage";

type NavItem = { label: string; href: string; enabled?: boolean };

type Props = {
  content: HomepageContent;
};

export function Header({ content }: Props) {
  const navItems: NavItem[] = ((content.header as any).navLinks as NavItem[]) || (content.header as any).nav || [];
  const primaryCta = (content.header as any).primaryCta || null;
  const ctaEnabled = primaryCta ? (primaryCta.enabled ?? true) : false;
  const ctaHref = primaryCta ? (primaryCta.href as string) : "#";
  const ctaLabel = primaryCta ? ((primaryCta.label as string) || (primaryCta.text as string) || "") : "";
  const enabledNavItems = navItems.filter((x) => x.enabled !== false);
  return (
    <nav>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <div className="logo-dot" />
          {renderBrandText(content.header.brandText)}
        </a>

        <ul className="nav-links">
          {enabledNavItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
          ))}
        </ul>

        <details className="nav-mobile">
          <summary className="nav-toggle" aria-label="Open navigation">
            <span className="nav-toggle-bars" aria-hidden="true" />
          </summary>
          <div className="nav-mobile-menu">
            <div className="nav-mobile-card">
              <div className="nav-mobile-title">Menu</div>
              <ul className="nav-mobile-links">
                {enabledNavItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
              {ctaEnabled ? (
                <a href={ctaHref} className="btn-primary nav-mobile-cta">
                  {ctaLabel}
                </a>
              ) : null}
            </div>
          </div>
        </details>

        {ctaEnabled ? (
          <a href={ctaHref} className="btn-primary" style={{ padding: "10px 22px", fontSize: "13px" }}>
            {ctaLabel}
          </a>
        ) : (
          <span />
        )}
      </div>
    </nav>
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
