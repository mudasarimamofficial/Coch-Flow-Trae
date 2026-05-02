export function LandingHtmlV1Promise() {
  const cards = [
    {
      num: "01",
      title: "We protect your brand like it's ours",
      body: "Every message we send goes out under your name. We write with your voice, your standards, and your reputation on the line. We would never send anything we wouldn't be proud to sign ourselves.",
    },
    {
      num: "02",
      title: "No vanity metrics. Booked calls or nothing.",
      body: "We don't report follower growth, impressions, or reply rates. The only number that matters is qualified calls booked onto your calendar. That's the only thing we optimise for.",
    },
    {
      num: "03",
      title: "You'll know exactly what's happening, always",
      body: "Real-time pipeline visibility. Weekly reporting. No black boxes. If something isn't working, we tell you before you ask — and we show you what we're changing.",
    },
    {
      num: "04",
      title: "We only work with coaches we can genuinely help",
      body: "Every application is reviewed personally. If your offer, audience, or stage isn't right for our system, we'll tell you honestly — and point you toward what will actually work for you right now.",
    },
  ];

  return (
    <section id="promise">
      <div className="section-tag">What You&apos;re Actually Getting</div>
      <h2 className="section-title">Four Things We Stand Behind</h2>
      <p className="section-body">Not features. Not deliverables. Commitments — the things that make working with us feel different from day one.</p>
      <div className="promise-grid">
        {cards.map((c) => (
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

