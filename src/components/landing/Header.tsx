import type { HomepageContent } from "@/content/homepage";

type Props = {
  content: HomepageContent;
};

export function Header({ content }: Props) {
  const navItems: Array<{ label: string; href: string; enabled?: boolean }> =
    ((content.header as any).navLinks as any) || (content.header as any).nav || [];
  const primaryCta = (content.header as any).primaryCta || null;
  const ctaEnabled = primaryCta ? (primaryCta.enabled ?? true) : false;
  const ctaHref = primaryCta ? (primaryCta.href as string) : "#";
  const ctaLabel = primaryCta ? ((primaryCta.label as string) || (primaryCta.text as string) || "") : "";
  return (
    <nav>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <span className="logo-dot" aria-hidden="true" />
          {renderBrandText(content.header.brandText)}
        </a>

        <ul className="nav-links">
          {navItems
            .filter((x) => x.enabled !== false)
            .map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
        </ul>

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
