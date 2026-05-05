"use client";

import { useMemo } from "react";

type WhatsappConfig = {
  enabled?: boolean;
  phone?: string;
  message?: string;
  label?: string;
};

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits;
}

export function WhatsAppFloat({ config }: { config?: WhatsappConfig }) {
  const href = useMemo(() => {
    if (!config?.enabled) return null;
    const phone = typeof config.phone === "string" ? normalizePhone(config.phone) : "";
    if (!phone) return null;
    const msg = typeof config.message === "string" ? config.message : "";
    const q = msg ? `?text=${encodeURIComponent(msg)}` : "";
    return `https://wa.me/${phone}${q}`;
  }, [config?.enabled, config?.phone, config?.message]);

  if (!href) return null;

  const label = typeof config?.label === "string" && config.label.trim() ? config.label.trim() : "WhatsApp";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 120,
        background: "rgba(201,168,76,0.95)",
        color: "#0A0A0A",
        padding: "10px 14px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textDecoration: "none",
        border: "1px solid rgba(0,0,0,0.25)",
      }}
    >
      {label}
    </a>
  );
}

