"use client";

export function PreviewBanner() {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "rgba(201,168,76,0.12)",
        border: "1px solid rgba(201,168,76,0.35)",
        color: "var(--gold)",
        padding: "6px 10px",
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        borderRadius: 2,
      }}
    >
      Preview
    </div>
  );
}

