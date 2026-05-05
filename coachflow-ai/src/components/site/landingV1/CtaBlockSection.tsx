"use client";

export function CtaBlockSection({
  title,
  body,
  buttonLabel,
  buttonHref,
  columns,
  align,
}: {
  title: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
  columns?: "one" | "two";
  align?: "left" | "center" | "right";
}) {
  const a = align === "center" || align === "right" ? align : "left";
  const actionsJustify = a === "center" ? "center" : a === "right" ? "flex-end" : "flex-start";
  return (
    <section>
      <div
        style={{
          border: "0.5px solid rgba(201,168,76,0.25)",
          background: "rgba(201,168,76,0.06)",
          padding: "2.5rem",
          borderRadius: 2,
        }}
      >
        {columns === "two" ? (
          <div className="cta-grid">
            <div style={{ textAlign: a }}>
              <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                {title}
              </h2>
              {body ? (
                <p className="section-body" style={{ maxWidth: 720, marginInline: a === "center" ? "auto" : undefined }}>
                  {body}
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "flex-start" }}>
              <a href={buttonHref} className="btn-primary" style={{ textAlign: "center" }}>
                {buttonLabel}
              </a>
              <a href="#pricing" className="btn-ghost" style={{ textAlign: "center" }}>
                View Pricing
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: a }}>
            <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
              {title}
            </h2>
            {body ? (
              <p className="section-body" style={{ maxWidth: 720, marginInline: a === "center" ? "auto" : undefined }}>
                {body}
              </p>
            ) : null}
            <div
              style={{
                marginTop: "1.75rem",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: actionsJustify,
              }}
            >
              <a href={buttonHref} className="btn-primary">
                {buttonLabel}
              </a>
              <a href="#pricing" className="btn-ghost">
                View Pricing
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

