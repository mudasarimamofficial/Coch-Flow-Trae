"use client";

import Image from "next/image";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";
import { resolvePublicMediaUrl } from "@/utils/mediaUrl";

export function LandingFooter({ footer }: { footer: LandingV1Content["footer"] }) {
  const logoUrl = footer.logoImagePath ? resolvePublicMediaUrl(footer.logoImagePath) : "";
  return (
    <footer>
      <div className="footer-logo">
        {logoUrl ? (
          <Image src={logoUrl} alt={footer.logoText} width={160} height={48} className="footer-logo-img" unoptimized />
        ) : (
          footer.logoText
        )}
      </div>
      <ul className="footer-links">
        {footer.links.map((l, idx) => (
          <li key={`${idx}:${l.href}:${l.label}`}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <div className="footer-copy">{footer.copyright}</div>
    </footer>
  );
}
