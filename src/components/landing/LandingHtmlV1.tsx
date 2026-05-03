"use client";

import { useEffect, useState } from "react";
import type { HomepageContent } from "@/content/homepage";

type Props = { content: HomepageContent };

export function LandingHtmlV1({ content }: Props) {
  void content;

  const [doc, setDoc] = useState<{ css: string; bodyHtml: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/coachflow-rebuilt-1.html", { cache: "force-cache" });
      if (!res.ok) return;
      const html = await res.text();
      if (cancelled) return;

      const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
      const css = cssMatch ? cssMatch[1] : "";

      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const rawBody = bodyMatch ? bodyMatch[1] : "";
      const bodyHtml = rawBody.replace(/<script>[\s\S]*?<\/script>/gi, "").trim();

      setDoc({ css, bodyHtml });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!doc) return;
    const w = window as any;

    w.toggleMenu = () => {
      const menu = document.getElementById("mobile-menu");
      const btn = document.getElementById("hamburger");
      if (!menu || !btn) return;
      menu.classList.toggle("open");
      btn.classList.toggle("open");
    };

    w.closeMenu = () => {
      const menu = document.getElementById("mobile-menu");
      const btn = document.getElementById("hamburger");
      if (!menu || !btn) return;
      menu.classList.remove("open");
      btn.classList.remove("open");
    };

    w.handleSubmit = async () => {
      const email = (document.getElementById("email") as HTMLInputElement | null)?.value || "";
      const fname = (document.getElementById("fname") as HTMLInputElement | null)?.value || "";
      const lname = (document.getElementById("lname") as HTMLInputElement | null)?.value || "";
      const revenue = (document.getElementById("revenue") as HTMLSelectElement | null)?.value || "";
      const bottleneck = (document.getElementById("bottleneck") as HTMLTextAreaElement | null)?.value || "";

      if (!fname.trim() || !email.trim()) {
        alert("Please fill in your name and email to apply.");
        return;
      }

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            first_name: fname.trim(),
            last_name: lname.trim() || "-",
            email: email.trim(),
            revenue: revenue || null,
            message: bottleneck.trim() || null,
          }),
        });
        if (!res.ok) {
          alert("Something went wrong. Please try again.");
          return;
        }
        const formContent = document.getElementById("form-content");
        const formSuccess = document.getElementById("form-success");
        if (formContent) (formContent as HTMLElement).style.display = "none";
        if (formSuccess) (formSuccess as HTMLElement).style.display = "block";
      } catch {
        alert("Something went wrong. Please try again.");
      }
    };

    return () => {
      delete w.toggleMenu;
      delete w.closeMenu;
      delete w.handleSubmit;
    };
  }, [doc]);

  if (!doc) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: doc.css }} />
      <div dangerouslySetInnerHTML={{ __html: doc.bodyHtml }} />
    </>
  );
}

