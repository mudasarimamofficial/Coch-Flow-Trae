import type { HomepageContent } from "@/content/homepage";

function splitStrong(haystack: string, strongPart: string) {
  const idx = haystack.indexOf(strongPart);
  if (idx < 0) return { before: haystack, strong: "", after: "" };
  return {
    before: haystack.slice(0, idx),
    strong: strongPart,
    after: haystack.slice(idx + strongPart.length),
  };
}

type Props = { content: HomepageContent };

export function LandingHtmlV1Hero({ content }: Props) {
  const heroTag = content.hero?.badge?.text || "Client Acquisition For Masculinity Coaches";
  const heroLine1 = content.hero?.heading?.prefix || "Stop Guessing.";
  const heroHighlight = content.hero?.heading?.highlight || "Closing.";
  const heroSub =
    content.hero?.subcopy ||
    "You've built a real coaching business. Your calendar shouldn't depend on content going viral or a referral showing up. We install a system that fills it — month after month, without ads.";
  const heroStrongSentence = "Your calendar shouldn't depend on content going viral or a referral showing up.";
  const heroSubParts = splitStrong(heroSub, heroStrongSentence);
  const heroNote = content.hero?.note || "Applications reviewed personally. No automated responses.";
  const heroPrimaryHref = content.hero?.primaryCta?.href || "#apply";
  const heroPrimaryText = content.hero?.primaryCta?.text || "Apply for Partnership";
  const heroSecondaryHref = content.hero?.secondaryCta?.href || "#how";
  const heroSecondaryText = content.hero?.secondaryCta?.text || "See How It Works";

  const trustDefaults = [
    "Fit-first — we turn away wrong clients",
    "Human outreach — no bots, no spam",
    "Brand-safe — your reputation is protected",
    "Weekly optimisation — the system improves every month",
    "No lock-in contracts",
  ];
  const trustItems = (() => {
    const pills = Array.isArray((content.hero as any)?.trust?.pills) ? ((content.hero as any).trust.pills as string[]) : [];
    const cleaned = pills.map((x) => String(x || "").trim()).filter((x) => x.length);
    return (cleaned.length ? cleaned : trustDefaults).slice(0, 5);
  })();

  return (
    <>
      <section className="hero" style={{ maxWidth: "none", paddingTop: "8rem" }}>
        <div className="hero-tag">{heroTag}</div>
        <h1>
          {heroLine1}
          <br />
          Start <em>{heroHighlight}</em>
        </h1>
        <p className="hero-sub">
          {heroSubParts.before}
          {heroSubParts.strong ? <strong>{heroSubParts.strong}</strong> : null}
          {heroSubParts.after}
        </p>
        <div className="hero-actions">
          <a href={heroPrimaryHref} className="btn-primary">
            {heroPrimaryText}
          </a>
          <a href={heroSecondaryHref} className="btn-ghost">
            {heroSecondaryText}
          </a>
        </div>
        <p className="hero-note">{heroNote}</p>
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

