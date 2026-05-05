"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingHonest({ honest }: { honest: LandingV1Content["honest"] }) {
  return (
    <div className="honest" id="honest">
      <div className="honest-inner">
        <div>
          <div className="section-tag" style={{ marginBottom: "1.5rem" }}>
            {honest.sectionTag}
          </div>
          <p className="honest-quote">{honest.quote}</p>
        </div>
        <div>
          <div className="honest-body" dangerouslySetInnerHTML={{ __html: honest.bodyHtml }} />
          <div className="honest-pledge">
            <div className="honest-pledge-title">{honest.pledgeTitle}</div>
            <ul className="honest-pledge-items">
              {honest.pledgeItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

