export type LandingNavItem = { label: string; href: string };

type Props = {
  brandText: string;
  nav: LandingNavItem[];
  ctaHref: string;
  ctaText: string;
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
};

export function LandingHtmlV1Nav({ brandText, nav, ctaHref, ctaText, menuOpen, setMenuOpen }: Props) {
  return (
    <>
      <nav>
        <a href="#" className="nav-logo">
          {brandText}
        </a>
        <ul className="nav-links">
          {nav.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
          <li>
            <a href={ctaHref} className="nav-cta">
              {ctaText}
            </a>
          </li>
        </ul>
        <button
          className={`nav-hamburger${menuOpen ? " open" : ""}`}
          id="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobile-menu">
        {nav.map((item) => (
          <a key={`mobile-${item.href}-${item.label}`} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <a href={ctaHref} className="mob-cta" onClick={() => setMenuOpen(false)}>
          {ctaText}
        </a>
      </div>
    </>
  );
}

