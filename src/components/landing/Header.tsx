"use client";

import { useEffect, useState } from "react";
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
  const icon = content.header.brandIcon;
  const iconUrl = icon?.type === "image" ? (icon.url || "") : "";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <nav>
        <div className="nav-inner">
          <button
            type="button"
            className={`nav-mobile nav-toggle ${mobileOpen ? "is-open" : ""}`}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="cf-mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="nav-toggle-bars" aria-hidden="true" />
          </button>

          <a href="#" className="nav-logo">
            {iconUrl ? (
              <img className="logo-img" src={iconUrl} alt="CoachFlow" />
            ) : (
              <div className="logo-dot" />
            )}
            {renderBrandText(content.header.brandText)}
          </a>

          <ul className="nav-links">
            {enabledNavItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            {ctaEnabled ? (
              <>
                <a href={ctaHref} className="btn-primary nav-cta">
                  {ctaLabel}
                </a>
                <span className="nav-cta-spacer" aria-hidden="true" />
              </>
            ) : (
              <span className="nav-cta-spacer" aria-hidden="true" />
            )}
          </div>
        </div>
      </nav>

      <div id="cf-mobile-nav" className={`nav-sheet ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="nav-sheet-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="nav-sheet-panel" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="nav-sheet-top">
            <div className="nav-sheet-brand">
              {iconUrl ? <img className="logo-img" src={iconUrl} alt="CoachFlow" /> : <div className="logo-dot" />}
              <div className="nav-sheet-brand-text">{renderBrandText(content.header.brandText)}</div>
            </div>
            <button type="button" className="nav-sheet-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <ul className="nav-sheet-links">
            {enabledNavItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {ctaEnabled ? (
            <a href={ctaHref} className="btn-primary nav-sheet-cta" onClick={() => setMobileOpen(false)}>
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </>
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
