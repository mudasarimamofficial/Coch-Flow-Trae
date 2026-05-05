"use client";

import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingPromise({ promise }: { promise: LandingV1Content["promise"] }) {
  return (
    <section id="promise">
      <div className="section-tag">{promise.sectionTag}</div>
      <h2 className="section-title">{promise.title}</h2>
      <p className="section-body">{promise.body}</p>
      <div className="promise-grid">
        {promise.cards.map((c) => (
          <div key={c.num} className="promise-card">
            <div className="promise-num">{c.num}</div>
            <div className="promise-title">{c.title}</div>
            <div className="promise-body">{c.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

