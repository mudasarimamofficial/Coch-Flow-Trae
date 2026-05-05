"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingFounder({ founder }: { founder: LandingV1Content["founder"] }) {
  return (
    <div id="founder" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div className="founder">
        <div>
          <div className="founder-label">{founder.label}</div>
          <div className="founder-avatar">{founder.avatarText}</div>
          <div className="founder-name">{founder.name}</div>
          <div className="founder-title">{founder.title}</div>
        </div>
        <div>
          <p className="founder-quote">{founder.quote}</p>
          <div className="founder-body" dangerouslySetInnerHTML={{ __html: founder.bodyHtml }} />
        </div>
      </div>
    </div>
  );
}

