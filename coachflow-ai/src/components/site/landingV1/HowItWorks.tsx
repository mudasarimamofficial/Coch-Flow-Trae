"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingHowItWorks({ how }: { how: LandingV1Content["howItWorks"] }) {
  return (
    <div
      style={{
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      <section id="how">
        <div className="section-tag">{how.sectionTag}</div>
        <h2 className="section-title">{how.title}</h2>
        <p className="section-body">{how.body}</p>

        <div className="steps">
          {how.steps.map((s) => (
            <div key={s.num} className="step">
              <div className="step-num">{s.num}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

