"use client";

import { useEffect, useRef, useState } from "react";
import type { HomepageContent } from "@/content/homepage";
import { scopeRebuiltTemplate } from "@/utils/scopeTemplate";
import { attachLandingBootstrap, LandingDevice } from "@/utils/landingBootstrap";

type Props = {
  content: HomepageContent;
  templateHtml?: string;
  device?: LandingDevice;
  className?: string;
};

export function DirectLandingRenderer({ content, templateHtml, device = "desktop", className }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [fetchedTemplate, setFetchedTemplate] = useState<string | null>(null);
  const [scopedHtml, setScopedHtml] = useState<{scopeClass: string, css: string, bodyHtml: string} | null>(null);
  const currentContentRef = useRef(content);
  currentContentRef.current = content;

  useEffect(() => {
    if (templateHtml && templateHtml.trim().length) return;
    let alive = true;
    fetch("/coachflow-rebuilt-1.html", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`template_fetch_${r.status}`))))
      .then((t) => {
        if (!alive) return;
        setFetchedTemplate(t);
      })
      .catch(() => {
        if (!alive) return;
        setFetchedTemplate("");
      });
    return () => {
      alive = false;
    };
  }, [templateHtml]);

  const baseTemplate = (templateHtml && templateHtml.trim().length ? templateHtml : fetchedTemplate) ?? null;

  useEffect(() => {
    if (baseTemplate) {
      setScopedHtml(scopeRebuiltTemplate(baseTemplate));
    }
  }, [baseTemplate]);

  useEffect(() => {
    if (!scopedHtml || !rootRef.current) return;
    // Attach bootstrap when html is ready and every time content or device changes
    const cleanup = attachLandingBootstrap(rootRef.current, content, device);
    return () => {
      cleanup();
    };
  }, [scopedHtml, content, device]);

  // Window message listener for preview builder
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data || {};
      if ((data.type === "coachflow_builder_preview" || data.type === "cf_rebuilt_apply") && data.content) {
        if (rootRef.current) {
          // Since we might not want to force a React render cycle just for iframe messages, 
          // we could just call attachLandingBootstrap, but that might leave cleanup dangling.
          // Better approach is to let the parent pass down `content`. 
          // If we are strictly receiving postMessages, we should update state.
          // In builder, usually `HomepageClient` handles state, so `content` prop updates automatically.
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!scopedHtml) return <div className={className}>Loading...</div>;

  return (
    <div className={className}>
      <style dangerouslySetInnerHTML={{ __html: scopedHtml.css }} />
      <div 
        ref={rootRef}
        className={scopedHtml.scopeClass} 
        dangerouslySetInnerHTML={{ __html: scopedHtml.bodyHtml }} 
      />
    </div>
  );
}
