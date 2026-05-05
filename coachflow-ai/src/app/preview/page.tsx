"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LandingV1 } from "@/components/site/LandingV1";

type Device = "desktop" | "tablet" | "mobile";

function deviceWidth(device: Device) {
  if (device === "mobile") return 375;
  if (device === "tablet") return 768;
  return 1280;
}

export default function PreviewPage() {
  const sp = useSearchParams();
  const device = (sp.get("device") as Device) || "desktop";
  const [content, setContent] = useState<unknown>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const hasBuilderContent = useRef(false);

  useEffect(() => {
    fetch("/api/public/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok && !hasBuilderContent.current) setContent(j.content);
      })
      .catch(() => {
        if (!hasBuilderContent.current) setContent(null);
      });
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;
    const el = document.querySelector(`[data-section-id="${CSS.escape(selectedSectionId)}"]`) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [selectedSectionId]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!e?.data || typeof e.data !== "object") return;
      const d = e.data as any;
      if (d.type === "coachflow_builder_preview") {
        hasBuilderContent.current = true;
        setContent(d.content ?? null);
      }
      if (d.type === "coachflow_builder_highlight_section") {
        const id = typeof d.sectionId === "string" ? d.sectionId : null;
        setSelectedSectionId(id);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const frameStyle = useMemo(() => {
    const w = deviceWidth(device);
    return {
      width: w,
      maxWidth: "100%",
      height: "100%",
      background: "#0A0A0A",
      overflow: "hidden",
      borderRadius: 8,
    } as const;
  }, [device]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        padding: 24,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={frameStyle}>
        <LandingV1 content={content ?? undefined} previewBanner builderMode selectedSectionId={selectedSectionId} />
      </div>
    </div>
  );
}
