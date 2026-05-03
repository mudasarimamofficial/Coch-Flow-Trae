export function LandingHtmlV1Hero() {
  const trustItems = [
    "Fit-first — we turn away wrong clients",
    "Human outreach — no bots, no spam",
    "Brand-safe — your reputation is protected",
    "Weekly optimisation — the system improves every month",
    "No lock-in contracts",
  ];

  return (
    <>
      <section className="hero" style={{ maxWidth: "none", paddingTop: "8rem" }}>
        <div className="hero-tag">Client Acquisition For Masculinity Coaches</div>
        <h1>
          Stop Guessing.
          <br />
          Start <em>Closing.</em>
        </h1>
        <p className="hero-sub">
          You&apos;ve built a real coaching business. <strong>Your calendar shouldn&apos;t depend on content going viral or a referral showing up.</strong> We install a system that fills it — month after month, without ads.
        </p>
        <div className="hero-actions">
          <a href="#apply" className="btn-primary">Apply for Partnership</a>
          <a href="#how" className="btn-ghost">See How It Works</a>
        </div>
        <p className="hero-note">Applications reviewed personally. No automated responses.</p>
      </section>
      <div className="divider" />
      <div className="trust-strip">
        {trustItems.map((t) => (
          <div key={t} className="trust-item">
            {t}
          </div>
        ))}
      </div>
    </>
  );
}

