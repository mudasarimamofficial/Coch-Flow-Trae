"use client";

import { useMemo, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { LandingHtmlV1View, type LandingHtmlV1ViewProps } from "@/components/landing/LandingHtmlV1View";

type Props = { content: HomepageContent };

export function LandingHtmlV1({ content }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [revenue, setRevenue] = useState("");
  const [bottleneck, setBottleneck] = useState("");

  const nav = useMemo(() => {
    const base = Array.isArray(content.header?.nav) ? content.header.nav : [];
    const defaults = [
      { label: "Our Story", href: "#founder" },
      { label: "How It Works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
    ];
    return (base.length ? base : defaults).slice(0, 3);
  }, [content.header?.nav]);

  async function submit() {
    const fn = firstName.trim();
    const em = email.trim();
    if (!fn || !em) {
      alert("Please fill in your name and email to apply.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: fn,
          last_name: lastName.trim() || "-",
          email: em,
          revenue: revenue || null,
          message: bottleneck.trim() || null,
        }),
      });
      if (!res.ok) return;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const viewProps: LandingHtmlV1ViewProps = {
    content,
    nav,
    menuOpen,
    setMenuOpen,
    submitted,
    submitting,
    firstName,
    lastName,
    email,
    revenue,
    bottleneck,
    setFirstName,
    setLastName,
    setEmail,
    setRevenue,
    setBottleneck,
    onSubmit: submit,
  };

  return <LandingHtmlV1View {...viewProps} />;
}

