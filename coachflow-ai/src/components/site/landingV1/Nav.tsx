"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { resolvePublicMediaUrl } from "@/utils/mediaUrl";

export function LandingNav({ nav }: { nav: LandingV1Content["nav"] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoUrl = nav.logoImagePath ? resolvePublicMediaUrl(nav.logoImagePath) : "";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav>
        <a href="#" className="nav-logo">
          {logoUrl ? (
            <Image src={logoUrl} alt={nav.logoText} width={160} height={48} className="nav-logo-img" unoptimized />
          ) : (
            nav.logoText
          )}
        </a>
        <ul className="nav-links">
          {nav.links.map((l, idx) => (
            <li key={`${idx}:${l.href}:${l.label}`}>
              <a href={l.href} className={l.isCta ? "nav-cta" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className={`nav-hamburger ${mobileOpen ? "open" : ""}`}
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {nav.links
          .filter((l) => l.href.startsWith("#"))
          .map((l, idx) => (
            <a
              key={`m:${idx}:${l.href}:${l.label}`}
              href={l.href}
              className={l.isCta ? "mob-cta" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
      </div>
    </>
  );
}
