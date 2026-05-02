"use client";

import { useEffect, useRef } from "react";
import type { HomepageContent } from "@/content/homepage";

type Props = { content: HomepageContent };

export function LandingHtmlV1({ content }: Props) {
  void content;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const bind = () => {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return;

      (win as any).handleSubmit = async () => {
        const fname = (doc.getElementById("fname") as HTMLInputElement | null)?.value?.trim() || "";
        const lname = (doc.getElementById("lname") as HTMLInputElement | null)?.value?.trim() || "";
        const email = (doc.getElementById("email") as HTMLInputElement | null)?.value?.trim() || "";
        const revenue = (doc.getElementById("revenue") as HTMLSelectElement | null)?.value || "";
        const bottleneck = (doc.getElementById("bottleneck") as HTMLTextAreaElement | null)?.value?.trim() || "";

        if (!fname || !email) {
          win.alert("Please fill in your name and email to apply.");
          return;
        }

        try {
          const res = await win.fetch("/api/leads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              first_name: fname,
              last_name: lname || "-",
              email,
              revenue: revenue || null,
              message: bottleneck || null,
            }),
          });
          if (!res.ok) {
            win.alert("Something went wrong. Please try again.");
            return;
          }
          const formContent = doc.getElementById("form-content");
          const formSuccess = doc.getElementById("form-success");
          if (formContent) (formContent as HTMLElement).style.display = "none";
          if (formSuccess) (formSuccess as HTMLElement).style.display = "block";
        } catch {
          win.alert("Something went wrong. Please try again.");
        }
      };
    };

    const onLoad = () => {
      bind();
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="CoachFlow Landing"
      src="/coachflow-rebuilt-1.html"
      style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
    />
  );
}

