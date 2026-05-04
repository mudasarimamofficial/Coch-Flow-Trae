type Step = { title: string; copy: string };

type Props = { steps: Step[] };

export function LandingHtmlV1How({ steps }: Props) {
  return (
    <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
      <section id="how">
        <div className="section-tag">The Framework</div>
        <h2 className="section-title">How We Fill Your Calendar</h2>
        <p className="section-body">Five steps. No shortcuts. Built to compound — the longer you run it, the stronger it gets.</p>
        <div className="steps">
          {steps.map((s, idx) => (
            <div className="step" key={`${s.title}-${idx}`}>
              <div className="step-num">STEP {String(idx + 1).padStart(2, "0")}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-body">{s.copy}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

